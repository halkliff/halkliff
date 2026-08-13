import {
  createNotebookDiagnostic,
  emptyNotebookRunResult,
  isNotebookWorkerResponse,
  normalizeNotebookLimits,
  type NotebookExecutionOptions,
  type NotebookLanguage,
  type NotebookPreparationResult,
  type NotebookRunResult,
  type NotebookWorkerRequest,
  type NotebookWorkerResponse,
} from "./protocol.ts";

export type {
  NotebookDiagnostic,
  NotebookExecutionOptions,
  NotebookLanguage,
  NotebookLimits,
  NotebookPreparationResult,
  NotebookRunResult,
  NotebookRunStatus,
  NotebookTruncation,
} from "./protocol.ts";

export interface NotebookWorkerLike {
  onmessage: ((event: { data: unknown }) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onmessageerror: ((event: unknown) => void) | null;
  postMessage(message: NotebookWorkerRequest): void;
  terminate(): void;
}

export type NotebookWorkerFactory = () => NotebookWorkerLike;

export interface CodeNotebookRuntime {
  prepare(options: { language: NotebookLanguage }): Promise<NotebookPreparationResult>;
  run(request: {
    language: NotebookLanguage;
    source: string;
    options?: NotebookExecutionOptions;
  }): Promise<NotebookRunResult>;
  cancel(): void;
  terminate(): void;
  reset(): void;
  dispose(): void;
}

export interface CodeNotebookRuntimeOptions {
  workerFactory?: NotebookWorkerFactory;
  requestTimeoutMs?: number;
}

type RuntimeState = "idle" | "preparing" | "ready" | "failed" | "disposed";
type PendingKind = "prepare" | "run";

interface PendingRequest {
  kind: PendingKind;
  resolve: (response: NotebookWorkerResponse) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

const DEFAULT_PREPARE_TIMEOUT_MS = 15_000;

export function createCodeNotebookRuntime(
  options: CodeNotebookRuntimeOptions = {},
): CodeNotebookRuntime {
  return new CodeNotebookRuntimeAdapter(options);
}

class CodeNotebookRuntimeAdapter implements CodeNotebookRuntime {
  private readonly workerFactory: NotebookWorkerFactory;
  private readonly requestTimeoutMs: number;
  private readonly pending = new Map<string, PendingRequest>();
  private worker: NotebookWorkerLike | null = null;
  private requestSequence = 0;
  private state: RuntimeState = "idle";
  private preparedLanguage: NotebookLanguage | null = null;
  private preparation: Promise<NotebookPreparationResult> | null = null;

  public constructor(options: CodeNotebookRuntimeOptions) {
    this.workerFactory = options.workerFactory ?? defaultWorkerFactory;
    this.requestTimeoutMs = clampTimeout(options.requestTimeoutMs);
  }

  public prepare(options: { language: NotebookLanguage }): Promise<NotebookPreparationResult> {
    if (this.state === "disposed") {
      return Promise.resolve(this.unavailablePreparation(options.language, "Runtime has been disposed."));
    }
    if (this.state === "ready" && this.preparedLanguage === options.language) {
      return Promise.resolve({ ok: true, language: options.language, diagnostics: [] });
    }
    if (this.preparation) return this.preparation;

    this.state = "preparing";
    const preparation = this.prepareOnWorker(options.language);
    this.preparation = preparation;
    void preparation.finally(() => {
      if (this.preparation === preparation) this.preparation = null;
    });
    return preparation;
  }

  public async run(request: {
    language: NotebookLanguage;
    source: string;
    options?: NotebookExecutionOptions;
  }): Promise<NotebookRunResult> {
    const limits = normalizeNotebookLimits(request.options);
    if (this.state === "disposed") {
      return this.unavailableRun("Runtime has been disposed.");
    }
    if (this.state === "failed") {
      return this.unavailableRun("Preparation did not succeed.");
    }
    if (this.state !== "ready" || this.preparedLanguage !== request.language) {
      return emptyNotebookRunResult(
        "not-ready",
        createNotebookDiagnostic("Prepare this notebook before running it.", {
          source: "system",
        }),
      );
    }
    if (request.source.length > limits.maxSourceChars) {
      return emptyNotebookRunResult(
        "diagnostics",
        createNotebookDiagnostic(
          `Notebook source is limited to ${limits.maxSourceChars.toLocaleString()} characters.`,
          { source: "system" },
        ),
      );
    }
    if (this.hasPendingRun()) {
      return this.unavailableRun("Another notebook run is already in progress.");
    }

    try {
      const response = await this.request(
        {
          type: "run",
          id: this.nextRequestId(),
          language: request.language,
          source: request.source,
          limits,
        },
        limits.timeoutMs,
      );
      if (response.type !== "result") {
        throw new Error("Notebook worker returned an unexpected run response.");
      }
      return response.result;
    } catch (error) {
      this.failWorker(errorMessage(error));
      return this.unavailableRun(errorMessage(error));
    }
  }

  public cancel(): void {
    const activeRun = [...this.pending.entries()].find(([, pending]) => pending.kind === "run");
    if (!activeRun) return;

    const [id, pending] = activeRun;
    clearTimeout(pending.timer);
    this.pending.delete(id);
    pending.resolve({
      type: "result",
      id,
      result: emptyNotebookRunResult(
        "cancelled",
        createNotebookDiagnostic("Notebook run cancelled.", { source: "system" }),
      ),
    });
    this.stopWorker();
  }

  public terminate(): void {
    this.cancel();
    this.rejectPending("Notebook worker terminated.");
    this.stopWorker();
    if (this.state !== "disposed") this.state = "idle";
  }

  public reset(): void {
    this.terminate();
    if (this.state !== "disposed") this.state = "idle";
  }

  public dispose(): void {
    if (this.state === "disposed") return;
    this.terminate();
    this.state = "disposed";
    this.preparedLanguage = null;
  }

  private async prepareOnWorker(language: NotebookLanguage): Promise<NotebookPreparationResult> {
    try {
      const response = await this.request(
        { type: "prepare", id: this.nextRequestId(), language },
        this.requestTimeoutMs,
      );
      if (response.type !== "prepared") {
        throw new Error("Notebook worker returned an unexpected preparation response.");
      }
      if (!response.ok) {
        this.state = "failed";
        this.preparedLanguage = null;
        this.stopWorker();
      } else {
        this.state = "ready";
        this.preparedLanguage = language;
      }
      return {
        ok: response.ok,
        language,
        diagnostics: response.diagnostics,
      };
    } catch (error) {
      this.failWorker(errorMessage(error));
      return this.unavailablePreparation(language, errorMessage(error));
    }
  }

  private request(
    request: NotebookWorkerRequest,
    timeoutMs: number,
  ): Promise<NotebookWorkerResponse> {
    const worker = this.ensureWorker();
    return new Promise<NotebookWorkerResponse>((resolve, reject) => {
      const pending: PendingRequest = {
        kind: request.type === "run" ? "run" : "prepare",
        resolve,
        reject,
        timer: setTimeout(() => this.expireRequest(request.id), timeoutMs),
      };
      this.pending.set(request.id, pending);
      try {
        worker.postMessage(request);
      } catch (error) {
        clearTimeout(pending.timer);
        this.pending.delete(request.id);
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  private ensureWorker(): NotebookWorkerLike {
    if (this.worker) return this.worker;
    if (this.state === "disposed") throw new Error("Runtime has been disposed.");

    const worker = this.workerFactory();
    worker.onmessage = (event) => this.handleMessage(event.data);
    worker.onerror = (event) => this.handleWorkerError(event);
    worker.onmessageerror = (event) => this.handleWorkerError(event);
    this.worker = worker;
    return worker;
  }

  private handleMessage(value: unknown): void {
    if (!isNotebookWorkerResponse(value)) {
      this.failWorker("Notebook worker returned an invalid response.");
      return;
    }

    const pending = this.pending.get(value.id);
    if (!pending) return;
    clearTimeout(pending.timer);
    this.pending.delete(value.id);

    if (value.type === "error") {
      pending.reject(new Error(value.diagnostic.message));
      return;
    }
    if (pending.kind === "prepare" && value.type !== "prepared") {
      pending.reject(new Error("Notebook worker returned an unexpected preparation response."));
      return;
    }
    if (pending.kind === "run" && value.type !== "result") {
      pending.reject(new Error("Notebook worker returned an unexpected run response."));
      return;
    }
    pending.resolve(value);
  }

  private handleWorkerError(event: unknown): void {
    this.failWorker(eventMessage(event));
  }

  private failWorker(message: string): void {
    this.rejectPending(message);
    this.stopWorker();
    if (this.state !== "disposed") this.state = "failed";
  }

  private rejectPending(message: string): void {
    const error = new Error(message);
    for (const [id, pending] of this.pending) {
      clearTimeout(pending.timer);
      this.pending.delete(id);
      pending.reject(error);
    }
  }

  private expireRequest(id: string): void {
    const pending = this.pending.get(id);
    if (!pending) return;
    clearTimeout(pending.timer);
    this.pending.delete(id);
    if (pending.kind === "run") {
      pending.resolve({
        type: "result",
        id,
        result: emptyNotebookRunResult(
          "timeout",
          createNotebookDiagnostic("Execution exceeded the notebook time limit.", {
            source: "runtime",
          }),
        ),
      });
      this.stopWorker();
      return;
    }
    pending.reject(new Error("Notebook runtime preparation timed out."));
    this.stopWorker();
    if (this.state !== "disposed") this.state = "failed";
  }

  private stopWorker(): void {
    const worker = this.worker;
    this.worker = null;
    this.preparedLanguage = null;
    if (!worker) return;
    worker.onmessage = null;
    worker.onerror = null;
    worker.onmessageerror = null;
    worker.terminate();
  }

  private hasPendingRun(): boolean {
    return [...this.pending.values()].some((pending) => pending.kind === "run");
  }

  private nextRequestId(): string {
    this.requestSequence += 1;
    return `notebook-${this.requestSequence}`;
  }

  private unavailablePreparation(language: NotebookLanguage, message: string): NotebookPreparationResult {
    return {
      ok: false,
      language,
      diagnostics: [
        createNotebookDiagnostic(`The local notebook runtime is unavailable: ${message}`, {
          source: "system",
        }),
      ],
    };
  }

  private unavailableRun(message: string): NotebookRunResult {
    return emptyNotebookRunResult(
      "unavailable",
      createNotebookDiagnostic(`The local notebook runtime is unavailable: ${message}`, {
        source: "system",
      }),
    );
  }
}

function defaultWorkerFactory(): NotebookWorkerLike {
  if (typeof Worker === "undefined") {
    throw new Error("This browser does not support module workers.");
  }
  return new Worker(new URL("./code-notebook-worker.ts", import.meta.url), {
    name: "code-notebook-runtime",
    type: "module",
  }) as unknown as NotebookWorkerLike;
}

function clampTimeout(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) return DEFAULT_PREPARE_TIMEOUT_MS;
  return Math.min(DEFAULT_PREPARE_TIMEOUT_MS, Math.max(1, Math.floor(value)));
}

function eventMessage(event: unknown): string {
  if (event instanceof Error && event.message) return event.message;
  if (typeof event === "object" && event !== null && "message" in event) {
    const message = (event as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  return "The notebook worker stopped unexpectedly.";
}

function errorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : String(error);
}
