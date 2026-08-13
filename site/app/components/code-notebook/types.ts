export const NOTEBOOK_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "rust",
] as const;

export type NotebookLanguage = (typeof NOTEBOOK_LANGUAGES)[number];

export type NotebookStatus =
  | "idle"
  | "loading"
  | "ready"
  | "running"
  | "complete"
  | "stopped"
  | "unavailable"
  | "error";

export const NOTEBOOK_LANGUAGE_LABELS: Record<NotebookLanguage, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  rust: "Rust",
};

/** Versions are kept beside the adapter labels so the UI never implies Node.js execution. */
export const NOTEBOOK_RUNTIME_LABELS: Record<NotebookLanguage, string> = {
  javascript: "QuickJS 0.32 · browser WASM",
  typescript: "TypeScript 6.0.2 · QuickJS 0.32 · browser WASM",
  python: "CPython 3.14.0 · Pyodide 314.0.3 · browser WASM",
  rust: "Browser runtime unavailable",
};

export interface RuntimeRunOptions {
  signal?: AbortSignal;
}

export interface RuntimeResult {
  stdout?: string;
  stderr?: string;
  exitCode?: number;
  durationMs?: number;
}

export interface RuntimePreparation {
  available: boolean;
  message?: string;
}

/** The only compiler contract the notebook UI needs. */
export interface RuntimeAdapter {
  prepare(options?: RuntimeRunOptions): Promise<RuntimePreparation>;
  run(source: string, options?: RuntimeRunOptions): Promise<RuntimeResult>;
  stop?(): void | Promise<void>;
  reset?(): void | Promise<void>;
  dispose?(): void | Promise<void>;
}

export interface RuntimeLoaderContext {
  signal: AbortSignal;
}

/**
 * A loader imports only the requested language adapter. The notebook invokes
 * it when the cell nears the viewport, then enables Run after prepare succeeds.
 */
export type RuntimeLoader = (
  context: RuntimeLoaderContext,
) => Promise<RuntimeAdapter>;

export type RuntimeLoaderMap = Partial<
  Record<NotebookLanguage, RuntimeLoader>
>;

export class RuntimeUnavailableError extends Error {
  readonly language: NotebookLanguage;

  constructor(language: NotebookLanguage, message?: string) {
    super(
      message ??
        `No runtime adapter is configured for ${NOTEBOOK_LANGUAGE_LABELS[language]}.`,
    );
    this.name = "RuntimeUnavailableError";
    this.language = language;
  }
}
