import type {
  QuickJSContext,
  QuickJSHandle,
  QuickJSRuntime,
  QuickJSSyncVariant,
  QuickJSWASMModule,
} from "quickjs-emscripten-core";
import {
  BoundedText,
  NOTEBOOK_DEFAULT_LIMITS,
  createNotebookDiagnostic,
  emptyNotebookRunResult,
  isNotebookWorkerRequest,
  normalizeNotebookLimits,
  truncateText,
  type NotebookDiagnostic,
  type NotebookLanguage,
  type NotebookLimits,
  type NotebookRunResult,
  type NotebookWorkerResponse,
} from "./protocol.ts";

// TypeScript 7 is the project compiler (via @typescript/native), but its native
// rewrite intentionally does not expose the legacy Compiler API yet. The
// notebook loads the official TypeScript 6 compatibility alias lazily.
type TypeScriptModule = typeof import("typescript");

export interface NotebookWorkerScope {
  onmessage: ((event: { data: unknown }) => void) | null;
  postMessage: (message: NotebookWorkerResponse) => void;
}

export interface NotebookWorkerDependencies {
  loadQuickJS?: () => Promise<QuickJSWASMModule>;
  loadTypeScript?: () => Promise<TypeScriptModule>;
}

export type NotebookWorkerHandler = (
  message: unknown,
  postMessage: (response: NotebookWorkerResponse) => void,
) => Promise<void>;

interface WorkerState {
  disposed: boolean;
  preparedLanguage: NotebookLanguage | null;
  quickJS: QuickJSWASMModule | null;
  quickJSPromise: Promise<QuickJSWASMModule> | null;
  typeScript: TypeScriptModule | null;
  typeScriptPromise: Promise<TypeScriptModule> | null;
}

interface OutputBuffers {
  stdout: BoundedText;
  stderr: BoundedText;
}

interface DiagnosticBuffer {
  items: NotebookDiagnostic[];
  truncated: boolean;
}

const defaultDependencies: Required<NotebookWorkerDependencies> = {
  loadQuickJS: async () => {
    const [core, variantModule] = await Promise.all([
      import("quickjs-emscripten-core"),
      import("@jitl/quickjs-wasmfile-release-sync"),
    ]);
    const variant = variantModule.default as unknown as QuickJSSyncVariant;
    return core.newQuickJSWASMModuleFromVariant(variant);
  },
  loadTypeScript: async () => {
    const compilerModule = (await import("typescript")) as unknown as {
      default?: TypeScriptModule;
    } & TypeScriptModule;
    return compilerModule.default ?? compilerModule;
  },
};

export function createNotebookWorkerHandler(
  dependencies: NotebookWorkerDependencies = {},
): NotebookWorkerHandler {
  const state: WorkerState = {
    disposed: false,
    preparedLanguage: null,
    quickJS: null,
    quickJSPromise: null,
    typeScript: null,
    typeScriptPromise: null,
  };
  const loaders = {
    loadQuickJS: dependencies.loadQuickJS ?? defaultDependencies.loadQuickJS,
    loadTypeScript: dependencies.loadTypeScript ?? defaultDependencies.loadTypeScript,
  };

  return async (message, postMessage) => {
    const request = isNotebookWorkerRequest(message) ? message : null;
    if (!request) {
      postMessage({
        type: "error",
        id: getMessageId(message),
        diagnostic: createNotebookDiagnostic("Invalid notebook worker request.", {
          source: "system",
        }),
      });
      return;
    }

    if (state.disposed && request.type !== "dispose") {
      postMessage({
        type: "error",
        id: request.id,
        diagnostic: createNotebookDiagnostic("Notebook worker has been disposed.", {
          source: "system",
        }),
      });
      return;
    }

    try {
      if (request.type === "prepare") {
        const result = await prepareLanguage(request.language, state, loaders);
        postMessage({
          type: "prepared",
          id: request.id,
          language: request.language,
          ok: result.ok,
          diagnostics: result.diagnostics,
        });
        return;
      }

      if (request.type === "run") {
        const result = await runNotebook(request.language, request.source, request.limits, state, loaders);
        postMessage({ type: "result", id: request.id, result });
        return;
      }

      disposeWorkerState(state);
      postMessage({ type: "disposed", id: request.id });
    } catch (error) {
      postMessage({
        type: "error",
        id: request.id,
        diagnostic: createNotebookDiagnostic(errorMessage(error), {
          source: "system",
        }),
      });
    }
  };
}

export function installNotebookWorker(scope: NotebookWorkerScope): void {
  const handler = createNotebookWorkerHandler();
  scope.onmessage = (event) => {
    void handler(event.data, (response) => scope.postMessage(response));
  };
}

if (typeof document === "undefined" && typeof self !== "undefined") {
  const workerScope = self as unknown as NotebookWorkerScope;
  if (typeof workerScope.postMessage === "function") installNotebookWorker(workerScope);
}

async function prepareLanguage(
  language: NotebookLanguage,
  state: WorkerState,
  dependencies: Required<NotebookWorkerDependencies>,
): Promise<{ ok: boolean; diagnostics: NotebookDiagnostic[] }> {
  try {
    await getQuickJS(state, dependencies);
    if (language === "typescript") await getTypeScript(state, dependencies);
    state.preparedLanguage = language;
    return { ok: true, diagnostics: [] };
  } catch (error) {
    state.preparedLanguage = null;
    return {
      ok: false,
      diagnostics: [
        createNotebookDiagnostic(
          truncateText(
            `The local notebook runtime is unavailable: ${errorMessage(error)}`,
            NOTEBOOK_DEFAULT_LIMITS.maxDiagnosticChars,
          ).text,
          { source: "system" },
        ),
      ],
    };
  }
}

async function runNotebook(
  language: NotebookLanguage,
  source: string,
  rawLimits: NotebookLimits,
  state: WorkerState,
  dependencies: Required<NotebookWorkerDependencies>,
): Promise<NotebookRunResult> {
  const limits = normalizeNotebookLimits(rawLimits);
  if (!state.quickJS || state.preparedLanguage !== language) {
    return emptyNotebookRunResult(
      "not-ready",
      createNotebookDiagnostic("Prepare this notebook before running it.", {
        source: "system",
      }),
    );
  }

  if (source.length > limits.maxSourceChars) {
    return emptyNotebookRunResult(
      "diagnostics",
      createNotebookDiagnostic(
        `Notebook source is limited to ${limits.maxSourceChars.toLocaleString()} characters.`,
        { source: "system" },
      ),
    );
  }

  let executableSource = source;
  const diagnosticBuffer: DiagnosticBuffer = { items: [], truncated: false };
  if (language === "typescript") {
    const compiler = await getTypeScript(state, dependencies);
    const transpiled = transpileTypeScript(compiler, source, limits);
    for (const diagnostic of transpiled.diagnostics) {
      addDiagnostic(diagnosticBuffer, diagnostic, limits);
    }
    if (diagnosticBuffer.items.some((diagnostic) => diagnostic.severity === "error")) {
      return {
        status: "diagnostics",
        stdout: "",
        stderr: "",
        diagnostics: diagnosticBuffer.items,
        durationMs: 0,
        truncated: {
          stdout: false,
          stderr: false,
          diagnostics: diagnosticBuffer.truncated,
        },
      };
    }
    executableSource = transpiled.outputText;
  }

  return executeInQuickJS(state.quickJS, executableSource, limits, diagnosticBuffer);
}

function transpileTypeScript(
  compiler: TypeScriptModule,
  source: string,
  limits: NotebookLimits,
): { outputText: string; diagnostics: NotebookDiagnostic[] } {
  const transpiled = compiler.transpileModule(source, {
    fileName: "notebook.ts",
    reportDiagnostics: true,
    compilerOptions: {
      isolatedModules: true,
      module: compiler.ModuleKind.ESNext,
      sourceMap: false,
      target: compiler.ScriptTarget.ES2020,
    },
  });
  const diagnostics = (transpiled.diagnostics ?? []).map((diagnostic) => {
      const location = diagnostic.file && diagnostic.start !== undefined
        ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start)
        : undefined;
      const message = compiler.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
      const boundedMessage = truncateText(message, limits.maxDiagnosticChars).text;
      const severity = diagnosticCategoryToSeverity(compiler, diagnostic.category);
      return createNotebookDiagnostic(boundedMessage, {
        severity,
        source: "typescript",
        line: location ? location.line + 1 : undefined,
        column: location ? location.character + 1 : undefined,
      });
    });
  return { outputText: transpiled.outputText, diagnostics };
}

function executeInQuickJS(
  quickJS: QuickJSWASMModule,
  source: string,
  limits: NotebookLimits,
  diagnosticBuffer: DiagnosticBuffer,
): NotebookRunResult {
  const startedAt = Date.now();
  const output: OutputBuffers = {
    stdout: new BoundedText(limits.maxOutputChars),
    stderr: new BoundedText(limits.maxOutputChars),
  };
  const runtime = quickJS.newRuntime();
  let context: QuickJSContext | null = null;

  try {
    runtime.setMemoryLimit(limits.memoryLimitBytes);
    runtime.setMaxStackSize(limits.maxStackSizeBytes);
    runtime.setInterruptHandler(() => Date.now() - startedAt >= limits.timeoutMs);
    context = runtime.newContext();
    installConsole(context, output);

    const evaluated = context.evalCode(source, "notebook.js");
    if (evaluated.error !== undefined) {
      const errorHandle = evaluated.error;
      const errorText = formatGuestError(context, errorHandle);
      errorHandle.dispose();
      output.stderr.append(`${errorText}\n`);
      if (isInterrupted(errorText)) {
        addDiagnostic(
          diagnosticBuffer,
          createNotebookDiagnostic("Execution exceeded the notebook time limit.", {
            source: "runtime",
          }),
          limits,
        );
        return makeRunResult("timeout", output, diagnosticBuffer, startedAt);
      }

      const location = parseLocation(errorText);
      addDiagnostic(
        diagnosticBuffer,
        createNotebookDiagnostic(errorText, {
          source: "runtime",
          line: location?.line,
          column: location?.column,
        }),
        limits,
      );
      return makeRunResult("runtime-error", output, diagnosticBuffer, startedAt);
    }

    if (!("value" in evaluated)) {
      throw new Error("QuickJS returned neither a value nor an error.");
    }

    const pendingError = drainPendingJobs(runtime, context);
    if (pendingError) {
      output.stderr.append(`${pendingError}\n`);
      addDiagnostic(
        diagnosticBuffer,
        createNotebookDiagnostic(pendingError, { source: "runtime" }),
        limits,
      );
      return makeRunResult("runtime-error", output, diagnosticBuffer, startedAt);
    }

    const valueHandle = evaluated.value;
    const value = context.dump(valueHandle) as unknown;
    if (valueHandle.alive) valueHandle.dispose();

    return {
      ...makeRunResult("ok", output, diagnosticBuffer, startedAt),
      value: normalizeGuestValue(value),
    };
  } finally {
    context?.dispose();
    runtime.dispose();
  }
}

function drainPendingJobs(
  runtime: QuickJSRuntime,
  context: QuickJSContext,
): string | undefined {
  const maxJobs = 1_000;
  let executed = 0;

  while (runtime.hasPendingJob()) {
    if (executed >= maxJobs) {
      return `Promise microtask limit exceeded (${maxJobs} jobs).`;
    }

    const result = runtime.executePendingJobs(Math.min(100, maxJobs - executed));
    if (result.error) {
      const message = formatGuestError(context, result.error);
      result.dispose();
      return message;
    }

    const count = result.value;
    result.dispose();
    if (count <= 0) break;
    executed += count;
  }

  return undefined;
}

function installConsole(context: QuickJSContext, output: OutputBuffers): void {
  const consoleObject = context.newObject();
  const methods: ReadonlyArray<readonly [string, keyof OutputBuffers]> = [
    ["log", "stdout"],
    ["info", "stdout"],
    ["debug", "stdout"],
    ["warn", "stderr"],
    ["error", "stderr"],
  ];

  for (const [name, stream] of methods) {
    const functionHandle = context.newFunction(name, (...args: QuickJSHandle[]) => {
      const values = args.map((argument) => formatGuestValue(context, argument));
      output[stream].append(`${values.join(" ")}\n`);
      return context.undefined;
    });
    context.setProp(consoleObject, name, functionHandle);
    functionHandle.dispose();
  }

  context.setProp(context.global, "console", consoleObject);
  consoleObject.dispose();
}

function makeRunResult(
  status: NotebookRunResult["status"],
  output: OutputBuffers,
  diagnostics: DiagnosticBuffer,
  startedAt: number,
): NotebookRunResult {
  return {
    status,
    stdout: output.stdout.text,
    stderr: output.stderr.text,
    diagnostics: diagnostics.items,
    durationMs: Math.max(0, Date.now() - startedAt),
    truncated: {
      stdout: output.stdout.truncated,
      stderr: output.stderr.truncated,
      diagnostics: diagnostics.truncated,
    },
  };
}

function addDiagnostic(
  buffer: DiagnosticBuffer,
  diagnostic: NotebookDiagnostic,
  limits: NotebookLimits,
): void {
  const bounded = {
    ...diagnostic,
    message: truncateText(diagnostic.message, limits.maxDiagnosticChars).text,
  };
  if (bounded.message.length !== diagnostic.message.length) buffer.truncated = true;
  if (buffer.items.length >= limits.maxDiagnostics) {
    buffer.truncated = true;
    return;
  }
  buffer.items.push(bounded);
}

async function getQuickJS(
  state: WorkerState,
  dependencies: Required<NotebookWorkerDependencies>,
): Promise<QuickJSWASMModule> {
  if (state.quickJS) return state.quickJS;
  if (!state.quickJSPromise) {
    state.quickJSPromise = dependencies.loadQuickJS().then((quickJS) => {
      if (state.disposed) throw new Error("Notebook worker has been disposed.");
      state.quickJS = quickJS;
      state.quickJSPromise = null;
      return quickJS;
    });
  }
  return state.quickJSPromise;
}

async function getTypeScript(
  state: WorkerState,
  dependencies: Required<NotebookWorkerDependencies>,
): Promise<TypeScriptModule> {
  if (state.typeScript) return state.typeScript;
  if (!state.typeScriptPromise) {
    state.typeScriptPromise = dependencies.loadTypeScript().then((compiler) => {
      if (state.disposed) throw new Error("Notebook worker has been disposed.");
      state.typeScript = compiler;
      state.typeScriptPromise = null;
      return compiler;
    });
  }
  return state.typeScriptPromise;
}

function disposeWorkerState(state: WorkerState): void {
  state.disposed = true;
  state.preparedLanguage = null;
  state.quickJS = null;
  state.quickJSPromise = null;
  state.typeScript = null;
  state.typeScriptPromise = null;
}

function diagnosticCategoryToSeverity(
  compiler: TypeScriptModule,
  category: import("typescript").DiagnosticCategory,
): NotebookDiagnostic["severity"] {
  if (category === compiler.DiagnosticCategory.Error) return "error";
  if (category === compiler.DiagnosticCategory.Warning) return "warning";
  return "info";
}

function formatGuestValue(context: QuickJSContext, handle: QuickJSHandle): string {
  return normalizeGuestValue(context.dump(handle));
}

function formatGuestError(context: QuickJSContext, handle: QuickJSHandle): string {
  const dumped = context.dump(handle) as unknown;
  if (isRecord(dumped)) {
    const name = typeof dumped.name === "string" ? dumped.name : "Error";
    const message = typeof dumped.message === "string" ? dumped.message : "Unknown error";
    const stack = typeof dumped.stack === "string" ? dumped.stack : "";
    return stack && !stack.includes(message) ? `${name}: ${message}\n${stack}` : `${name}: ${message}${stack ? `\n${stack}` : ""}`;
  }
  return normalizeGuestValue(dumped);
}

function normalizeGuestValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === undefined) return "undefined";
  if (value === null) return "null";
  if (typeof value === "object") {
    try {
      const json = JSON.stringify(value);
      if (json !== undefined) return json;
    } catch {
      return "[unserializable value]";
    }
  }
  return String(value);
}

function parseLocation(value: string): { line: number; column: number } | undefined {
  const match = /notebook\.js:(\d+)(?::(\d+))?/.exec(value);
  if (!match) return undefined;
  return { line: Number(match[1]), column: Number(match[2] ?? 1) };
}

function isInterrupted(value: string): boolean {
  return /\binterrupted\b/i.test(value);
}

function getMessageId(value: unknown): string {
  return isRecord(value) && typeof value.id === "string" ? value.id : "invalid";
}

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return String(error);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
