import { capOutput, DEFAULT_EXECUTION_LIMITS, resolveExecutionLimits, utf8ByteLength } from "./limits.ts";
import type {
  NotebookWorker,
  PythonWorkerRequest,
  PythonWorkerResponse,
} from "./protocol.ts";
import type {
  AdapterCapability,
  ExecutionLimits,
  ExecutionResult,
  NotebookDiagnostic,
  NotebookExecutionAdapter,
  PreparationResult,
  RunOptions,
} from "./types.ts";

const DEFAULT_PYODIDE_INDEX_URL = "/pyodide/";
const PYODIDE_RUNTIME_NAME = "Pyodide";

export { DEFAULT_PYODIDE_INDEX_URL };

type PendingKind = "prepare" | "run";

interface PendingRequest {
  readonly id: number;
  readonly kind: PendingKind;
  readonly resolve: (response: PythonWorkerResponse) => void;
  readonly timer: ReturnType<typeof setTimeout>;
  readonly removeAbortListener?: () => void;
}

export interface PythonAdapterOptions {
  readonly workerFactory?: () => NotebookWorker;
  readonly indexURL?: string | (() => string);
  readonly defaultLimits?: Partial<ExecutionLimits>;
  readonly prepareTimeoutMs?: number;
  readonly now?: () => number;
}

const pythonCapability: AdapterCapability = Object.freeze({
  language: "python",
  state: "available",
  local: true,
  reason: "Pyodide is staged as a local application asset and runs in a module Worker.",
});

function defaultWorkerFactory(): NotebookWorker {
  if (typeof Worker === "undefined") {
    throw new Error("The Python adapter requires a browser Worker implementation.");
  }

  return new Worker("/python-notebook.worker.mjs", {
    name: "python-code-notebook",
    type: "module",
  }) as unknown as NotebookWorker;
}

function defaultIndexURL(): string {
  return DEFAULT_PYODIDE_INDEX_URL;
}

function diagnostic(
  code: string,
  message: string,
  severity: NotebookDiagnostic["severity"] = "error",
): NotebookDiagnostic {
  return { severity, code, message };
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return typeof error === "string" ? error : "Python adapter failed.";
}

function isMessageEvent(
  event: MessageEvent<PythonWorkerResponse> | ErrorEvent,
): event is MessageEvent<PythonWorkerResponse> {
  return "data" in event;
}

function emptyExecutionResult(
  status: ExecutionResult["status"],
  durationMs: number,
  diagnostics: readonly NotebookDiagnostic[],
): ExecutionResult {
  return {
    language: "python",
    status,
    stdout: "",
    stderr: "",
    outputTruncated: false,
    durationMs,
    diagnostics,
  };
}

export function createPythonAdapter(
  options: PythonAdapterOptions = {},
): NotebookExecutionAdapter {
  const workerFactory = options.workerFactory ?? defaultWorkerFactory;
  const indexURL = options.indexURL ?? defaultIndexURL;
  const now = options.now ?? (() => performance.now());
  const prepareTimeoutMs = options.prepareTimeoutMs ?? 30_000;
  const defaultLimits = {
    ...DEFAULT_EXECUTION_LIMITS,
    ...options.defaultLimits,
  };

  let worker: NotebookWorker | null = null;
  let nextRequestId = 1;
  let pending: PendingRequest | null = null;
  let prepared = false;
  let disposed = false;
  let preparePromise: Promise<PreparationResult> | null = null;
  let lastPreparation: PreparationResult | null = null;

  const onWorkerMessage = (
    event: MessageEvent<PythonWorkerResponse> | ErrorEvent,
  ): void => {
    if (!isMessageEvent(event)) {
      completePending({
        type: "error",
        id: pending?.id ?? 0,
        stage: pending?.kind ?? "run",
        message: event.message || "Python Worker failed.",
      }, true);
      return;
    }

    if (!pending || event.data.id !== pending.id) return;
    completePending(event.data, false);
  };

  const attachWorker = (): NotebookWorker => {
    if (worker) return worker;

    worker = workerFactory();
    worker.addEventListener("message", onWorkerMessage);
    worker.addEventListener("error", onWorkerMessage);
    return worker;
  };

  const detachAndTerminate = (): void => {
    if (!worker) return;
    worker.removeEventListener("message", onWorkerMessage);
    worker.removeEventListener("error", onWorkerMessage);
    worker.terminate();
    worker = null;
    prepared = false;
    lastPreparation = null;
  };

  function completePending(
    response: PythonWorkerResponse,
    terminate: boolean,
  ): void {
    const request = pending;
    if (!request) return;

    pending = null;
    clearTimeout(request.timer);
    request.removeAbortListener?.();
    if (terminate) detachAndTerminate();
    request.resolve(response);
  }

  function request(
    kind: PendingKind,
    message: PythonWorkerRequest,
    timeoutMs: number,
    signal: AbortSignal | undefined,
  ): Promise<PythonWorkerResponse> {
    return new Promise((resolve) => {
      const requestId = message.id;
      const timer = setTimeout(() => {
        completePending(
          {
            type: "terminated",
            id: requestId,
            reason: "timeout",
          },
          true,
        );
      }, timeoutMs);

      const abort = (): void => {
        completePending(
          {
            type: "terminated",
            id: requestId,
            reason: "cancelled",
          },
          true,
        );
      };

      if (signal?.aborted) {
        clearTimeout(timer);
        resolve({ type: "terminated", id: requestId, reason: "cancelled" });
        return;
      }

      signal?.addEventListener("abort", abort, { once: true });
      pending = {
        id: requestId,
        kind,
        resolve,
        timer,
        removeAbortListener: signal
          ? () => signal.removeEventListener("abort", abort)
          : undefined,
      };

      try {
        attachWorker().postMessage(message);
      } catch (error) {
        completePending(
          {
            type: "error",
            id: requestId,
            stage: kind,
            message: errorMessage(error),
          },
          true,
        );
      }
    });
  }

  function preparationFromResponse(
    response: PythonWorkerResponse,
  ): PreparationResult {
    if (response.type === "ready") {
      return {
        language: "python",
        status: "ready",
        capability: pythonCapability,
        runtime: {
          name: PYODIDE_RUNTIME_NAME,
          version: response.version,
          source: "local",
        },
        diagnostics: [],
      };
    }

    if (response.type === "terminated") {
      return {
        language: "python",
        status: "cancelled",
        capability: pythonCapability,
        diagnostics: [
          diagnostic("PYTHON_PREPARE_CANCELLED", "Python preparation was cancelled."),
        ],
      };
    }

    if (response.type === "error") {
      return {
        language: "python",
        status: "failed",
        capability: pythonCapability,
        diagnostics: [
          diagnostic("PYTHON_RUNTIME_LOAD_FAILED", response.message),
        ],
      };
    }

    return {
      language: "python",
      status: "failed",
      capability: pythonCapability,
      diagnostics: [
        diagnostic(
          "PYTHON_PROTOCOL_ERROR",
          "Python Worker returned an execution result during preparation.",
        ),
      ],
    };
  }

  function executionFromResponse(
    response: PythonWorkerResponse,
    startedAt: number,
    limits: ExecutionLimits,
  ): ExecutionResult {
    const durationMs = Math.max(0, Math.round(now() - startedAt));

    if (response.type === "terminated") {
      return emptyExecutionResult(
        response.reason,
        durationMs,
        [
          diagnostic(
            response.reason === "timeout"
              ? "PYTHON_TIMEOUT"
              : "PYTHON_CANCELLED",
            response.reason === "timeout"
              ? `Python execution exceeded the ${limits.timeoutMs} ms time limit.`
              : "Python execution was cancelled and its Worker was terminated.",
          ),
        ],
      );
    }

    if (response.type === "error") {
      return emptyExecutionResult(
        "failed",
        durationMs,
        [diagnostic("PYTHON_WORKER_ERROR", response.message)],
      );
    }

    if (response.type === "ready") {
      return emptyExecutionResult(
        "failed",
        durationMs,
        [diagnostic("PYTHON_PROTOCOL_ERROR", "Python Worker returned ready during execution.")],
      );
    }

    const output = capOutput(
      response.stdout,
      response.stderr,
      limits.maxOutputBytes,
    );

    return {
      language: "python",
      status: response.ok ? "completed" : "failed",
      stdout: output.stdout,
      stderr: output.stderr,
      ...(response.value !== undefined ? { value: response.value } : {}),
      outputTruncated: response.outputTruncated || output.outputTruncated,
      durationMs,
      diagnostics: response.diagnostics,
    };
  }

  const adapter: NotebookExecutionAdapter = {
    language: "python",
    capability: pythonCapability,

    async prepare(): Promise<PreparationResult> {
      if (disposed) {
        return {
          language: "python",
          status: "failed",
          capability: pythonCapability,
          diagnostics: [
            diagnostic("PYTHON_ADAPTER_DISPOSED", "The Python adapter has been disposed."),
          ],
        };
      }

      if (lastPreparation?.status === "ready") return lastPreparation;
      if (preparePromise) return preparePromise;

      let url: string;
      try {
        url = typeof indexURL === "function" ? indexURL() : indexURL;
      } catch (error) {
        const result: PreparationResult = {
          language: "python",
          status: "failed",
          capability: pythonCapability,
          diagnostics: [diagnostic("PYTHON_INDEX_URL_FAILED", errorMessage(error))],
        };
        lastPreparation = result;
        return result;
      }

      preparePromise = (async () => {
        try {
          const response = await request(
            "prepare",
            { type: "prepare", id: nextRequestId++, indexURL: url },
            prepareTimeoutMs,
            undefined,
          );
          const result = preparationFromResponse(response);
          prepared = result.status === "ready";
          lastPreparation = result;
          return result;
        } catch (error) {
          const result: PreparationResult = {
            language: "python",
            status: "failed",
            capability: pythonCapability,
            diagnostics: [diagnostic("PYTHON_PREPARE_FAILED", errorMessage(error))],
          };
          lastPreparation = result;
          return result;
        } finally {
          preparePromise = null;
        }
      })();

      return preparePromise;
    },

    async run(source: string, runOptions: RunOptions = {}): Promise<ExecutionResult> {
      const startedAt = now();

      if (disposed) {
        return emptyExecutionResult(
          "failed",
          0,
          [diagnostic("PYTHON_ADAPTER_DISPOSED", "The Python adapter has been disposed.")],
        );
      }

      const resolved = resolveExecutionLimits({
        ...defaultLimits,
        ...runOptions.limits,
      });
      if (!resolved.limits) {
        return emptyExecutionResult("failed", 0, resolved.diagnostics);
      }

      const limits = resolved.limits;
      if (utf8ByteLength(source) > limits.maxCodeBytes) {
        return emptyExecutionResult(
          "failed",
          0,
          [
            diagnostic(
              "PYTHON_CODE_TOO_LARGE",
              `Python source exceeds the ${limits.maxCodeBytes} byte limit.`,
            ),
          ],
        );
      }

      if (!prepared) {
        return emptyExecutionResult(
          "failed",
          0,
          [
            diagnostic(
              "PYTHON_NOT_PREPARED",
              "Call prepare() before running Python code.",
            ),
          ],
        );
      }

      if (pending) {
        return emptyExecutionResult(
          "failed",
          0,
          [diagnostic("PYTHON_ADAPTER_BUSY", "Only one Python request may run at a time.")],
        );
      }

      const response = await request(
        "run",
        {
          type: "run",
          id: nextRequestId++,
          code: source,
          maxOutputBytes: limits.maxOutputBytes,
        },
        limits.timeoutMs,
        runOptions.signal,
      );
      return executionFromResponse(response, startedAt, limits);
    },

    cancel(reason = "Python execution was cancelled."): void {
      if (pending) {
        completePending(
          {
            type: "terminated",
            id: pending.id,
            reason: "cancelled",
          },
          true,
        );
        return;
      }

      if (worker) detachAndTerminate();
      if (reason) lastPreparation = null;
    },

    terminate(reason = "Python Worker terminated."): void {
      void reason;
      adapter.cancel("Python Worker terminated.");
    },

    dispose(): void {
      if (disposed) return;
      disposed = true;
      adapter.cancel("Python adapter disposed.");
    },
  };

  return adapter;
}
