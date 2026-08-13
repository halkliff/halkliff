import { createPythonAdapter, type PythonAdapterOptions } from "./python-adapter.ts";
import { createRustAdapter, type RustAdapterOptions } from "./rust-adapter.ts";
import type {
  ExecutionResult,
  NotebookExecutionAdapter,
  NotebookLanguage,
  PreparationResult,
  RunOptions,
} from "./types.ts";

export interface CodeNotebookCell {
  readonly id: string;
  readonly language: NotebookLanguage;
  readonly source: string;
}
export interface CodeNotebookOptions {
  readonly python?: PythonAdapterOptions;
  readonly rust?: RustAdapterOptions;
}

export interface CodeNotebook {
  readonly adapters: Readonly<Record<NotebookLanguage, NotebookExecutionAdapter>>;
  prepare(cell: CodeNotebookCell): Promise<PreparationResult>;
  run(cell: CodeNotebookCell, options?: RunOptions): Promise<ExecutionResult>;
  cancel(language: NotebookLanguage): void;
  dispose(): void;
}

export function createCodeNotebook(
  options: CodeNotebookOptions = {},
): CodeNotebook {
  const adapters = {
    python: createPythonAdapter(options.python),
    rust: createRustAdapter(options.rust),
  } satisfies Record<NotebookLanguage, NotebookExecutionAdapter>;

  return {
    adapters,
    prepare(cell) {
      return adapters[cell.language].prepare();
    },
    run(cell, runOptions) {
      return adapters[cell.language].run(cell.source, runOptions);
    },
    cancel(language) {
      adapters[language].cancel();
    },
    dispose() {
      adapters.python.dispose();
      adapters.rust.dispose();
    },
  };
}
