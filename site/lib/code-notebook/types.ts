export type NotebookLanguage = "python" | "rust";

export type DiagnosticSeverity = "error" | "warning" | "info";

export interface NotebookDiagnostic {
  readonly severity: DiagnosticSeverity;
  readonly message: string;
  readonly code?: string;
  readonly line?: number;
  readonly column?: number;
}

export interface ExecutionLimits {
  /** Maximum wall-clock time for one run, excluding preparation. */
  readonly timeoutMs: number;
  /** Maximum UTF-8 source size accepted by the adapter. */
  readonly maxCodeBytes: number;
  /** Maximum combined UTF-8 stdout and stderr retained by the adapter. */
  readonly maxOutputBytes: number;
}

export type AdapterCapabilityState = "available" | "disabled";

export interface AdapterCapability {
  readonly language: NotebookLanguage;
  readonly state: AdapterCapabilityState;
  readonly local: true;
  readonly reason?: string;
  readonly evidence?: readonly string[];
}

export type PreparationStatus = "ready" | "disabled" | "failed" | "cancelled";

export interface PreparationResult {
  readonly language: NotebookLanguage;
  readonly status: PreparationStatus;
  readonly capability: AdapterCapability;
  readonly runtime?: {
    readonly name: string;
    readonly version?: string;
    readonly source: "local";
  };
  readonly diagnostics: readonly NotebookDiagnostic[];
}

export type ExecutionStatus =
  | "completed"
  | "failed"
  | "timeout"
  | "cancelled"
  | "disabled";

export interface ExecutionResult {
  readonly language: NotebookLanguage;
  readonly status: ExecutionStatus;
  readonly stdout: string;
  readonly stderr: string;
  readonly value?: unknown;
  readonly outputTruncated: boolean;
  readonly durationMs: number;
  readonly diagnostics: readonly NotebookDiagnostic[];
}

export interface RunOptions {
  readonly limits?: Partial<ExecutionLimits>;
  readonly signal?: AbortSignal;
}

export interface NotebookExecutionAdapter {
  readonly language: NotebookLanguage;
  readonly capability: AdapterCapability;

  prepare(): Promise<PreparationResult>;
  run(source: string, options?: RunOptions): Promise<ExecutionResult>;
  cancel(reason?: string): void;
  terminate(reason?: string): void;
  dispose(): void;
}

