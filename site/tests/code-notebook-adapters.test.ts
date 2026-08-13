import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { createPythonAdapter } from "../lib/code-notebook/python-adapter.ts";
import { createCodeNotebook } from "../lib/code-notebook/notebook.ts";
import {
  detectRustCapability,
  RUST_BROWSER_SPIKE,
  rustSpikeReport,
} from "../lib/code-notebook/rust-spike.ts";
import { createRustAdapter } from "../lib/code-notebook/rust-adapter.ts";
import type {
  NotebookWorker,
  PythonWorkerRequest,
  PythonWorkerResponse,
} from "../lib/code-notebook/protocol.ts";

type WorkerListener = (
  event: MessageEvent<PythonWorkerResponse> | ErrorEvent,
) => void;

class FakeWorker implements NotebookWorker {
  readonly messages: PythonWorkerRequest[] = [];
  terminated = false;
  private readonly messageListeners = new Set<WorkerListener>();
  private readonly errorListeners = new Set<WorkerListener>();

  postMessage(message: PythonWorkerRequest): void {
    this.messages.push(message);
    if (message.type === "prepare") {
      queueMicrotask(() =>
        this.send({ type: "ready", id: message.id, version: "fake-pyodide" }),
      );
      return;
    }

    if (message.code === "timeout" || message.code === "cancel") return;

    const response: PythonWorkerResponse =
      message.code === "syntax"
        ? {
            type: "result",
            id: message.id,
            ok: false,
            stdout: "",
            stderr: "SyntaxError: invalid syntax\n",
            outputTruncated: false,
            diagnostics: [
              {
                severity: "error",
                code: "PYTHON_EXCEPTION",
                message: "SyntaxError: invalid syntax",
                line: 1,
              },
            ],
          }
        : {
            type: "result",
            id: message.id,
            ok: true,
            stdout:
              message.code === "large-output"
                ? "x".repeat(128)
                : "hello from python\n",
            stderr: "",
            value: 42,
            outputTruncated: false,
            diagnostics: [],
          };

    queueMicrotask(() => this.send(response));
  }

  terminate(): void {
    this.terminated = true;
  }

  addEventListener(type: "message" | "error", listener: WorkerListener): void {
    if (type === "message") this.messageListeners.add(listener);
    else this.errorListeners.add(listener);
  }

  removeEventListener(type: "message" | "error", listener: WorkerListener): void {
    if (type === "message") this.messageListeners.delete(listener);
    else this.errorListeners.delete(listener);
  }

  private send(data: PythonWorkerResponse): void {
    if (this.terminated) return;
    const event = { data } as MessageEvent<PythonWorkerResponse>;
    for (const listener of this.messageListeners) listener(event);
  }
}

function makePythonAdapter(
  workers: FakeWorker[],
  now: () => number = () => 100,
) {
  return createPythonAdapter({
    workerFactory: () => {
      const worker = new FakeWorker();
      workers.push(worker);
      return worker;
    },
    now,
  });
}

test("Python runtime is lazy and preparation is local-worker only", async () => {
  const workers: FakeWorker[] = [];
  const adapter = makePythonAdapter(workers);

  assert.equal(workers.length, 0);
  const preparation = await adapter.prepare();

  assert.equal(preparation.status, "ready");
  assert.equal(workers.length, 1);
  assert.deepEqual(workers[0].messages[0], {
    type: "prepare",
    id: 1,
    indexURL: "/pyodide/",
  });
});
test("Python execution returns bounded output, values, and structured diagnostics", async () => {
  const workers: FakeWorker[] = [];
  const adapter = makePythonAdapter(workers);
  await adapter.prepare();

  const successful = await adapter.run("print('hello')");
  assert.equal(successful.status, "completed");
  assert.equal(successful.value, 42);
  assert.equal(successful.stdout, "hello from python\n");

  const failed = await adapter.run("syntax");
  assert.equal(failed.status, "failed");
  assert.equal(failed.diagnostics[0]?.code, "PYTHON_EXCEPTION");
  assert.equal(failed.diagnostics[0]?.line, 1);

  const capped = await adapter.run("large-output", {
    limits: { maxOutputBytes: 10 },
  });
  assert.equal(capped.status, "completed");
  assert.equal(new TextEncoder().encode(capped.stdout).byteLength, 10);
  assert.equal(capped.outputTruncated, true);
});

test("Python source limits are checked before a Worker run", async () => {
  const workers: FakeWorker[] = [];
  const adapter = makePythonAdapter(workers);
  await adapter.prepare();

  const result = await adapter.run("12345", { limits: { maxCodeBytes: 4 } });
  assert.equal(result.status, "failed");
  assert.equal(result.diagnostics[0]?.code, "PYTHON_CODE_TOO_LARGE");
  assert.equal(workers[0].messages.filter((message) => message.type === "run").length, 0);
});

test("Python timeout terminates the Worker and requires a fresh prepare", async () => {
  const workers: FakeWorker[] = [];
  const adapter = makePythonAdapter(workers);
  await adapter.prepare();

  const result = await adapter.run("timeout", { limits: { timeoutMs: 10 } });
  assert.equal(result.status, "timeout");
  assert.equal(result.diagnostics[0]?.code, "PYTHON_TIMEOUT");
  assert.equal(workers[0].terminated, true);

  const notPrepared = await adapter.run("print('again')");
  assert.equal(notPrepared.diagnostics[0]?.code, "PYTHON_NOT_PREPARED");

  await adapter.prepare();
  assert.equal(workers.length, 2);
});

test("Python cancellation and AbortSignal terminate the Worker", async () => {
  const workers: FakeWorker[] = [];
  const adapter = makePythonAdapter(workers);
  await adapter.prepare();

  const running = adapter.run("cancel");
  adapter.cancel();
  const cancelled = await running;
  assert.equal(cancelled.status, "cancelled");
  assert.equal(workers[0].terminated, true);

  await adapter.prepare();
  const controller = new AbortController();
  controller.abort();
  const aborted = await adapter.run("print('never')", { signal: controller.signal });
  assert.equal(aborted.status, "cancelled");
  assert.equal(aborted.diagnostics[0]?.code, "PYTHON_CANCELLED");
});

test("Rust capability detection and the spike remain explicitly disabled", async () => {
  const capability = detectRustCapability({
    hasWebAssembly: true,
    hasWorker: true,
    localCompilerAsset: "public/rust/rustc.wasm",
  });
  assert.equal(capability.state, "disabled");
  assert.equal(capability.runtime, "none");
  assert.equal(RUST_BROWSER_SPIKE.status, "blocked");
  assert.equal(rustSpikeReport().status, "blocked");

  const adapter = createRustAdapter({ capabilityProbe: capability.environment });
  const prepared = await adapter.prepare();
  assert.equal(prepared.status, "disabled");
  assert.equal(prepared.diagnostics[0]?.code, "RUST_LOCAL_COMPILER_UNAVAILABLE");

  const result = await adapter.run("fn main() { println!(\"no\"); }");
  assert.equal(result.status, "disabled");
  assert.equal(result.diagnostics[0]?.code, "RUST_LOCAL_COMPILER_UNAVAILABLE");
});

test("CodeNotebook wires editable cells to language-specific adapters", async () => {
  const workers: FakeWorker[] = [];
  const notebook = createCodeNotebook({
    python: {
      workerFactory: () => {
        const worker = new FakeWorker();
        workers.push(worker);
        return worker;
      },
    },
  });

  const pythonCell = { id: "py-1", language: "python" as const, source: "print(1)" };
  await notebook.prepare(pythonCell);
  const result = await notebook.run(pythonCell);
  assert.equal(result.status, "completed");
  assert.equal(workers.length, 1);
  notebook.dispose();
});

test("worker source keeps Pyodide loading lazy and avoids package discovery", async () => {
  const source = await readFile(
    new URL("../lib/code-notebook/python.worker.mjs", import.meta.url),
    "utf8",
  );
  assert.match(source, /import\(`\$\{localIndexURL\}pyodide\.mjs`\)/);
  assert.match(source, /jsglobals: Object\.create\(null\)/);
  assert.doesNotMatch(source, /loadPackagesFromImports/);
});
