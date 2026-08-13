import assert from "node:assert/strict";
import { test } from "node:test";
import type { QuickJSWASMModule } from "quickjs-emscripten-core";
import {
  createCodeNotebookRuntime,
  type NotebookWorkerLike,
} from "../lib/notebook/code-notebook-runtime.ts";
import {
  createNotebookWorkerHandler,
  type NotebookWorkerDependencies,
  type NotebookWorkerHandler,
} from "../lib/notebook/code-notebook-worker.ts";
import {
  isNotebookWorkerResponse,
  normalizeNotebookLimits,
  type NotebookLanguage,
  type NotebookWorkerRequest,
  type NotebookWorkerResponse,
} from "../lib/notebook/protocol.ts";

let dispatchSequence = 0;

test("the notebook keeps the TypeScript 6 Compiler API compatibility layer", async () => {
  const compiler = await import("typescript");
  assert.match(compiler.version, /^6\./);
  assert.equal(typeof compiler.transpileModule, "function");
});

test("the adapter is lazy and loads only the requested language tools", async () => {
  let workerCreated = 0;
  let quickJSLoads = 0;
  let typeScriptLoads = 0;
  const fakeQuickJS = {} as QuickJSWASMModule;
  const fakeTypeScript = {} as Awaited<
    ReturnType<NonNullable<NotebookWorkerDependencies["loadTypeScript"]>>
  >;
  const dependencies: NotebookWorkerDependencies = {
    loadQuickJS: async () => {
      quickJSLoads += 1;
      return fakeQuickJS;
    },
    loadTypeScript: async () => {
      typeScriptLoads += 1;
      return fakeTypeScript;
    },
  };
  const runtime = createCodeNotebookRuntime({
    workerFactory: () => {
      workerCreated += 1;
      return new HandlerWorker(createNotebookWorkerHandler(dependencies));
    },
  });

  assert.equal(workerCreated, 0);
  const javascriptPreparation = await runtime.prepare({ language: "javascript" });
  assert.equal(javascriptPreparation.ok, true);
  assert.equal(workerCreated, 1);
  assert.equal(quickJSLoads, 1);
  assert.equal(typeScriptLoads, 0);

  const repeatedPreparation = await runtime.prepare({ language: "javascript" });
  assert.equal(repeatedPreparation.ok, true);
  assert.equal(quickJSLoads, 1);

  runtime.reset();
  const typescriptPreparation = await runtime.prepare({ language: "typescript" });
  assert.equal(typescriptPreparation.ok, true);
  assert.equal(quickJSLoads, 2);
  assert.equal(typeScriptLoads, 1);
  runtime.dispose();
});

test("QuickJS executes JavaScript with a fresh context and no host globals", async () => {
  const handler = createNotebookWorkerHandler();
  await prepare(handler, "javascript");

  const first = await run(handler, "globalThis.secret = 42; console.log(secret); secret;");
  assert.equal(first.status, "ok");
  assert.equal(first.stdout, "42\n");
  assert.equal(first.value, "42");

  const second = await run(
    handler,
    'console.log(typeof window, typeof document, typeof fetch, typeof process, typeof require); typeof secret;',
  );
  assert.equal(second.status, "ok");
  assert.match(second.stdout, /^undefined undefined undefined undefined undefined\n$/);
  assert.equal(second.value, "undefined");
});

test("TypeScript is transpiled locally and executed inside QuickJS", async () => {
  const handler = createNotebookWorkerHandler();
  await prepare(handler, "typescript");

  const result = await run(
    handler,
    "const answer: number = 40 + 2; console.log(answer); answer;",
    {},
    "typescript",
  );
  assert.equal(result.status, "ok");
  assert.equal(result.stdout, "42\n");
  assert.equal(result.value, "42");
});

test("QuickJS drains bounded promise microtasks before returning", async () => {
  const handler = createNotebookWorkerHandler();
  await prepare(handler, "javascript");

  const result = await run(
    handler,
    'Promise.resolve(42).then((answer) => console.log(answer));',
  );
  assert.equal(result.status, "ok");
  assert.equal(result.stdout, "42\n");
});

test("TypeScript diagnostics stop execution and runtime errors are reported", async () => {
  const handler = createNotebookWorkerHandler();
  await prepare(handler, "typescript");

  const typeError = await run(handler, "const answer: = 1;", {}, "typescript");
  assert.equal(typeError.status, "diagnostics");
  assert.ok(typeError.diagnostics.some((diagnostic) => diagnostic.source === "typescript"));

  const runtimeErrorHandler = createNotebookWorkerHandler();
  await prepare(runtimeErrorHandler, "javascript");
  const runtimeError = await run(runtimeErrorHandler, 'throw new Error("boom");');
  assert.equal(runtimeError.status, "runtime-error");
  assert.ok(runtimeError.diagnostics.some((diagnostic) => diagnostic.message.includes("boom")));
  assert.match(runtimeError.stderr, /boom/);
});

test("the worker enforces output caps and interrupts runaway code", async () => {
  const handler = createNotebookWorkerHandler();
  await prepare(handler, "javascript");

  const output = await run(handler, 'console.log("0123456789");', { maxOutputChars: 5 });
  assert.equal(output.stdout, "01234");
  assert.equal(output.truncated.stdout, true);

  const timeout = await run(handler, "while (true) {}", { timeoutMs: 25 });
  assert.equal(timeout.status, "timeout");
  assert.ok(timeout.diagnostics.some((diagnostic) => diagnostic.source === "runtime"));
});

test("an adapter cancellation terminates the worker and resolves the run", async () => {
  const worker = new SilentWorker();
  const runtime = createCodeNotebookRuntime({ workerFactory: () => worker });
  assert.equal((await runtime.prepare({ language: "javascript" })).ok, true);

  const pending = runtime.run({ language: "javascript", source: "while (true) {}" });
  await tick();
  runtime.cancel();
  const result = await pending;
  assert.equal(result.status, "cancelled");
  assert.equal(worker.terminated, true);
});

test("the adapter converts a worker timeout into a bounded result", async () => {
  const worker = new SilentWorker();
  const runtime = createCodeNotebookRuntime({ workerFactory: () => worker });
  assert.equal((await runtime.prepare({ language: "javascript" })).ok, true);

  const result = await runtime.run({
    language: "javascript",
    source: "while (true) {}",
    options: { timeoutMs: 15 },
  });
  assert.equal(result.status, "timeout");
  assert.equal(worker.terminated, true);
  assert.ok(result.diagnostics.length > 0);
});

test("worker failures use a safe fallback instead of page-context execution", async () => {
  let workerCreated = 0;
  const runtime = createCodeNotebookRuntime({
    workerFactory: () => {
      workerCreated += 1;
      throw new Error("module workers unavailable");
    },
  });

  assert.equal(workerCreated, 0);
  const preparation = await runtime.prepare({ language: "javascript" });
  assert.equal(preparation.ok, false);
  assert.match(preparation.diagnostics[0]?.message ?? "", /unavailable/);
  const result = await runtime.run({ language: "javascript", source: "1 + 1" });
  assert.equal(result.status, "unavailable");
  assert.equal(workerCreated, 1);
  runtime.dispose();
});

test("malformed worker responses are rejected by the strict protocol validator", async () => {
  const runtime = createCodeNotebookRuntime({
    workerFactory: () => new MalformedWorker(),
  });
  assert.equal((await runtime.prepare({ language: "javascript" })).ok, true);
  const result = await runtime.run({ language: "javascript", source: "1 + 1" });
  assert.equal(result.status, "unavailable");
});

test("protocol validation rejects unknown fields", () => {
  assert.equal(
    isNotebookWorkerResponse({
      type: "disposed",
      id: "x",
      unexpected: true,
    }),
    false,
  );
});

async function prepare(
  handler: NotebookWorkerHandler,
  language: NotebookLanguage,
): Promise<void> {
  const response = await dispatch(handler, {
    type: "prepare",
    id: `prepare-${language}`,
    language,
  });
  assert.equal(response.type, "prepared");
  assert.equal(response.ok, true);
}

async function run(
  handler: NotebookWorkerHandler,
  source: string,
  options: Parameters<typeof normalizeNotebookLimits>[0] = {},
  language: NotebookLanguage = "javascript",
) {
  const response = await dispatch(handler, {
    type: "run",
    id: `run-${++dispatchSequence}`,
    language,
    source,
    limits: normalizeNotebookLimits(options),
  });
  assert.equal(response.type, "result");
  return response.result;
}

async function dispatch(
  handler: NotebookWorkerHandler,
  request: NotebookWorkerRequest,
): Promise<NotebookWorkerResponse> {
  return new Promise<NotebookWorkerResponse>((resolve, reject) => {
    void handler(request, resolve).catch(reject);
  });
}

function tick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

class HandlerWorker implements NotebookWorkerLike {
  public onmessage: ((event: { data: unknown }) => void) | null = null;
  public onerror: ((event: unknown) => void) | null = null;
  public onmessageerror: ((event: unknown) => void) | null = null;
  public terminated = false;
  private readonly handler: NotebookWorkerHandler;

  public constructor(handler: NotebookWorkerHandler) {
    this.handler = handler;
  }

  public postMessage(message: NotebookWorkerRequest): void {
    void this.handler(message, (response) => {
      if (!this.terminated) this.onmessage?.({ data: response });
    }).catch((error: unknown) => this.onerror?.(error));
  }

  public terminate(): void {
    this.terminated = true;
  }
}

class SilentWorker implements NotebookWorkerLike {
  public onmessage: ((event: { data: unknown }) => void) | null = null;
  public onerror: ((event: unknown) => void) | null = null;
  public onmessageerror: ((event: unknown) => void) | null = null;
  public terminated = false;

  public postMessage(message: NotebookWorkerRequest): void {
    if (message.type === "prepare") {
      this.onmessage?.({
        data: {
          type: "prepared",
          id: message.id,
          language: message.language,
          ok: true,
          diagnostics: [],
        } satisfies NotebookWorkerResponse,
      });
    }
  }

  public terminate(): void {
    this.terminated = true;
  }
}

class MalformedWorker extends SilentWorker {
  public override postMessage(message: NotebookWorkerRequest): void {
    if (message.type === "run") {
      this.onmessage?.({
        data: {
          type: "result",
          id: message.id,
          result: {
            status: "ok",
            stdout: "",
            stderr: "",
            diagnostics: [],
            durationMs: 0,
            truncated: { stdout: false, stderr: false, diagnostics: false },
            unexpected: true,
          },
        },
      });
      return;
    }
    super.postMessage(message);
  }
}
