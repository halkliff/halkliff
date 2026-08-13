import type {
  NotebookLanguage,
  RuntimeAdapter,
  RuntimeLoader,
  RuntimePreparation,
  RuntimeResult,
} from "./types";

function messages(
  diagnostics: readonly { message: string; severity?: string }[],
): string {
  return diagnostics.map((item) => item.message).join("\n");
}

function jsRuntimeLoader(language: "javascript" | "typescript"): RuntimeLoader {
  return async () => {
    const { createCodeNotebookRuntime } = await import(
      "@/lib/notebook/code-notebook-runtime"
    );
    const runtime = createCodeNotebookRuntime();

    return {
      async prepare(): Promise<RuntimePreparation> {
        const result = await runtime.prepare({ language });
        return {
          available: result.ok,
          message: result.ok ? undefined : messages(result.diagnostics),
        };
      },
      async run(source): Promise<RuntimeResult> {
        const result = await runtime.run({ language, source });
        const diagnosticText = messages(result.diagnostics);
        const stderr = [result.stderr, diagnosticText].filter(Boolean).join("\n");
        return {
          stdout: result.stdout,
          stderr,
          durationMs: result.durationMs,
          exitCode: result.status === "ok" ? 0 : 1,
        };
      },
      stop: () => runtime.cancel(),
      reset: () => runtime.reset(),
      dispose: () => runtime.dispose(),
    } satisfies RuntimeAdapter;
  };
}

const pythonRuntimeLoader: RuntimeLoader = async () => {
  const { createPythonAdapter } = await import("@/lib/code-notebook/python-adapter");
  const adapter = createPythonAdapter();

  return {
    async prepare(): Promise<RuntimePreparation> {
      const result = await adapter.prepare();
      return {
        available: result.status === "ready",
        message: result.status === "ready" ? undefined : messages(result.diagnostics),
      };
    },
    async run(source, options): Promise<RuntimeResult> {
      const result = await adapter.run(source, { signal: options?.signal });
      const diagnosticText = messages(result.diagnostics);
      return {
        stdout: result.stdout,
        stderr: [result.stderr, diagnosticText].filter(Boolean).join("\n"),
        durationMs: result.durationMs,
        exitCode: result.status === "completed" ? 0 : 1,
      };
    },
    stop: () => adapter.cancel(),
    reset: () => adapter.terminate(),
    dispose: () => adapter.dispose(),
  } satisfies RuntimeAdapter;
};

const rustRuntimeLoader: RuntimeLoader = async () => {
  const { createRustAdapter } = await import("@/lib/code-notebook/rust-adapter");
  const adapter = createRustAdapter();

  return {
    async prepare(): Promise<RuntimePreparation> {
      const result = await adapter.prepare();
      return {
        available: false,
        message: messages(result.diagnostics),
      };
    },
    async run(source): Promise<RuntimeResult> {
      const result = await adapter.run(source);
      return {
        stdout: result.stdout,
        stderr: messages(result.diagnostics),
        durationMs: result.durationMs,
        exitCode: 1,
      };
    },
    stop: () => adapter.cancel(),
    dispose: () => adapter.dispose(),
  } satisfies RuntimeAdapter;
};

export const DEFAULT_RUNTIME_LOADERS: Record<NotebookLanguage, RuntimeLoader> = {
  javascript: jsRuntimeLoader("javascript"),
  typescript: jsRuntimeLoader("typescript"),
  python: pythonRuntimeLoader,
  rust: rustRuntimeLoader,
};
