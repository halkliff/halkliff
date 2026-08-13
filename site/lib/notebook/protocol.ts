export const NOTEBOOK_RUNTIME_VERSION = 1 as const;

export type NotebookLanguage = "javascript" | "typescript";

export type NotebookDiagnosticSeverity = "error" | "warning" | "info";
export type NotebookDiagnosticSource = "typescript" | "runtime" | "system";

export interface NotebookDiagnostic {
  severity: NotebookDiagnosticSeverity;
  source: NotebookDiagnosticSource;
  message: string;
  line?: number;
  column?: number;
}

export interface NotebookExecutionOptions {
  timeoutMs?: number;
  maxSourceChars?: number;
  maxOutputChars?: number;
  maxDiagnostics?: number;
  maxDiagnosticChars?: number;
  memoryLimitBytes?: number;
  maxStackSizeBytes?: number;
}

export interface NotebookLimits {
  timeoutMs: number;
  maxSourceChars: number;
  maxOutputChars: number;
  maxDiagnostics: number;
  maxDiagnosticChars: number;
  memoryLimitBytes: number;
  maxStackSizeBytes: number;
}

export const NOTEBOOK_HARD_LIMITS: NotebookLimits = {
  timeoutMs: 10_000,
  maxSourceChars: 120_000,
  maxOutputChars: 32_000,
  maxDiagnostics: 32,
  maxDiagnosticChars: 1_000,
  memoryLimitBytes: 16 * 1024 * 1024,
  maxStackSizeBytes: 512 * 1024,
};

export const NOTEBOOK_DEFAULT_LIMITS: NotebookLimits = {
  timeoutMs: 1_000,
  maxSourceChars: 80_000,
  maxOutputChars: 16_000,
  maxDiagnostics: 16,
  maxDiagnosticChars: 800,
  memoryLimitBytes: 8 * 1024 * 1024,
  maxStackSizeBytes: 256 * 1024,
};

export function normalizeNotebookLimits(
  options: NotebookExecutionOptions = {},
): NotebookLimits {
  return {
    timeoutMs: clampInteger(
      options.timeoutMs,
      NOTEBOOK_DEFAULT_LIMITS.timeoutMs,
      1,
      NOTEBOOK_HARD_LIMITS.timeoutMs,
    ),
    maxSourceChars: clampInteger(
      options.maxSourceChars,
      NOTEBOOK_DEFAULT_LIMITS.maxSourceChars,
      1,
      NOTEBOOK_HARD_LIMITS.maxSourceChars,
    ),
    maxOutputChars: clampInteger(
      options.maxOutputChars,
      NOTEBOOK_DEFAULT_LIMITS.maxOutputChars,
      1,
      NOTEBOOK_HARD_LIMITS.maxOutputChars,
    ),
    maxDiagnostics: clampInteger(
      options.maxDiagnostics,
      NOTEBOOK_DEFAULT_LIMITS.maxDiagnostics,
      1,
      NOTEBOOK_HARD_LIMITS.maxDiagnostics,
    ),
    maxDiagnosticChars: clampInteger(
      options.maxDiagnosticChars,
      NOTEBOOK_DEFAULT_LIMITS.maxDiagnosticChars,
      1,
      NOTEBOOK_HARD_LIMITS.maxDiagnosticChars,
    ),
    memoryLimitBytes: clampInteger(
      options.memoryLimitBytes,
      NOTEBOOK_DEFAULT_LIMITS.memoryLimitBytes,
      1024 * 1024,
      NOTEBOOK_HARD_LIMITS.memoryLimitBytes,
    ),
    maxStackSizeBytes: clampInteger(
      options.maxStackSizeBytes,
      NOTEBOOK_DEFAULT_LIMITS.maxStackSizeBytes,
      64 * 1024,
      NOTEBOOK_HARD_LIMITS.maxStackSizeBytes,
    ),
  };
}

export type NotebookRunStatus =
  | "ok"
  | "diagnostics"
  | "runtime-error"
  | "timeout"
  | "cancelled"
  | "unavailable"
  | "not-ready";

export interface NotebookTruncation {
  stdout: boolean;
  stderr: boolean;
  diagnostics: boolean;
}

export interface NotebookRunResult {
  status: NotebookRunStatus;
  stdout: string;
  stderr: string;
  value?: unknown;
  diagnostics: NotebookDiagnostic[];
  durationMs: number;
  truncated: NotebookTruncation;
}

export interface NotebookPreparationResult {
  ok: boolean;
  language: NotebookLanguage;
  diagnostics: NotebookDiagnostic[];
}

export type NotebookWorkerRequest =
  | {
      type: "prepare";
      id: string;
      language: NotebookLanguage;
    }
  | {
      type: "run";
      id: string;
      language: NotebookLanguage;
      source: string;
      limits: NotebookLimits;
    }
  | {
      type: "dispose";
      id: string;
    };

export type NotebookWorkerResponse =
  | {
      type: "prepared";
      id: string;
      language: NotebookLanguage;
      ok: boolean;
      diagnostics: NotebookDiagnostic[];
    }
  | {
      type: "result";
      id: string;
      result: NotebookRunResult;
    }
  | {
      type: "error";
      id: string;
      diagnostic: NotebookDiagnostic;
    }
  | {
      type: "disposed";
      id: string;
    };

export function createNotebookDiagnostic(
  message: string,
  options: Partial<
    Pick<NotebookDiagnostic, "severity" | "source" | "line" | "column">
  > = {},
): NotebookDiagnostic {
  return {
    severity: options.severity ?? "error",
    source: options.source ?? "system",
    message: String(message),
    ...(isPositiveInteger(options.line) ? { line: options.line } : {}),
    ...(isPositiveInteger(options.column) ? { column: options.column } : {}),
  };
}

export function emptyNotebookRunResult(
  status: NotebookRunStatus,
  diagnostic?: NotebookDiagnostic,
): NotebookRunResult {
  return {
    status,
    stdout: "",
    stderr: "",
    diagnostics: diagnostic ? [diagnostic] : [],
    durationMs: 0,
    truncated: { stdout: false, stderr: false, diagnostics: false },
  };
}

export function isNotebookLanguage(value: unknown): value is NotebookLanguage {
  return value === "javascript" || value === "typescript";
}

export function isNotebookWorkerRequest(
  value: unknown,
): value is NotebookWorkerRequest {
  if (!isRecord(value) || typeof value.id !== "string") return false;

  if (value.type === "prepare") {
    return hasOnlyKeys(value, ["type", "id", "language"]) && isNotebookLanguage(value.language);
  }

  if (value.type === "run") {
    return (
      hasOnlyKeys(value, ["type", "id", "language", "source", "limits"]) &&
      isNotebookLanguage(value.language) &&
      typeof value.source === "string" &&
      value.source.length <= NOTEBOOK_HARD_LIMITS.maxSourceChars &&
      isNotebookLimits(value.limits)
    );
  }

  return value.type === "dispose" && hasOnlyKeys(value, ["type", "id"]);
}

export function isNotebookWorkerResponse(
  value: unknown,
): value is NotebookWorkerResponse {
  if (!isRecord(value) || typeof value.id !== "string") return false;

  if (value.type === "prepared") {
    return (
      hasOnlyKeys(value, ["type", "id", "language", "ok", "diagnostics"]) &&
      isNotebookLanguage(value.language) &&
      typeof value.ok === "boolean" &&
      isNotebookDiagnostics(value.diagnostics)
    );
  }

  if (value.type === "result") {
    return hasOnlyKeys(value, ["type", "id", "result"]) && isNotebookRunResult(value.result);
  }

  if (value.type === "error") {
    return (
      hasOnlyKeys(value, ["type", "id", "diagnostic"]) &&
      isNotebookDiagnostic(value.diagnostic)
    );
  }

  return value.type === "disposed" && hasOnlyKeys(value, ["type", "id"]);
}

export function isNotebookRunResult(value: unknown): value is NotebookRunResult {
  if (!isRecord(value)) return false;
  const allowed = [
    "status",
    "stdout",
    "stderr",
    "value",
    "diagnostics",
    "durationMs",
    "truncated",
  ];
  const hasValue = Object.prototype.hasOwnProperty.call(value, "value");
  if (!hasValue) allowed.splice(3, 1);
  return (
    hasOnlyKeys(value, allowed) &&
    isNotebookRunStatus(value.status) &&
    typeof value.stdout === "string" &&
    value.stdout.length <= NOTEBOOK_HARD_LIMITS.maxOutputChars &&
    typeof value.stderr === "string" &&
    value.stderr.length <= NOTEBOOK_HARD_LIMITS.maxOutputChars &&
    isNotebookDiagnostics(value.diagnostics) &&
    typeof value.durationMs === "number" &&
    Number.isFinite(value.durationMs) &&
    isNotebookTruncation(value.truncated)
  );
}

export function isNotebookDiagnostic(value: unknown): value is NotebookDiagnostic {
  if (!isRecord(value)) return false;
  const allowed = ["severity", "source", "message", "line", "column"];
  const hasLine = Object.prototype.hasOwnProperty.call(value, "line");
  const hasColumn = Object.prototype.hasOwnProperty.call(value, "column");
  if (!hasLine) allowed.splice(3, 1);
  if (!hasColumn) allowed.splice(hasLine ? 4 : 3, 1);
  return (
    hasOnlyKeys(value, allowed) &&
    isNotebookDiagnosticSeverity(value.severity) &&
    isNotebookDiagnosticSource(value.source) &&
    typeof value.message === "string" &&
    value.message.length <= NOTEBOOK_HARD_LIMITS.maxDiagnosticChars &&
    (!hasLine || isPositiveInteger(value.line)) &&
    (!hasColumn || isPositiveInteger(value.column))
  );
}

export function isNotebookDiagnostics(value: unknown): value is NotebookDiagnostic[] {
  return (
    Array.isArray(value) &&
    value.length <= NOTEBOOK_HARD_LIMITS.maxDiagnostics &&
    value.every(isNotebookDiagnostic)
  );
}

export function truncateText(
  text: string,
  maxChars: number,
): { text: string; truncated: boolean } {
  if (text.length <= maxChars) return { text, truncated: false };
  return { text: text.slice(0, maxChars), truncated: true };
}

export class BoundedText {
  private current = "";
  private didTruncate = false;
  private readonly maxChars: number;

  public constructor(maxChars: number) {
    this.maxChars = maxChars;
  }

  public append(value: string): void {
    if (this.current.length >= this.maxChars) {
      this.didTruncate = true;
      return;
    }

    const remaining = this.maxChars - this.current.length;
    if (value.length > remaining) {
      this.current += value.slice(0, remaining);
      this.didTruncate = true;
      return;
    }

    this.current += value;
  }

  public get text(): string {
    return this.current;
  }

  public get truncated(): boolean {
    return this.didTruncate;
  }
}

function clampInteger(
  value: number | undefined,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  if (value === undefined || !Number.isFinite(value)) return fallback;
  return Math.min(maximum, Math.max(minimum, Math.floor(value)));
}

function isNotebookRunStatus(value: unknown): value is NotebookRunStatus {
  return (
    value === "ok" ||
    value === "diagnostics" ||
    value === "runtime-error" ||
    value === "timeout" ||
    value === "cancelled" ||
    value === "unavailable" ||
    value === "not-ready"
  );
}

function isNotebookDiagnosticSeverity(
  value: unknown,
): value is NotebookDiagnosticSeverity {
  return value === "error" || value === "warning" || value === "info";
}

function isNotebookDiagnosticSource(
  value: unknown,
): value is NotebookDiagnosticSource {
  return value === "typescript" || value === "runtime" || value === "system";
}

function isNotebookTruncation(value: unknown): value is NotebookTruncation {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, ["stdout", "stderr", "diagnostics"]) &&
    typeof value.stdout === "boolean" &&
    typeof value.stderr === "boolean" &&
    typeof value.diagnostics === "boolean"
  );
}

function isNotebookLimits(value: unknown): value is NotebookLimits {
  if (!isRecord(value)) return false;
  return (
    hasOnlyKeys(value, [
      "timeoutMs",
      "maxSourceChars",
      "maxOutputChars",
      "maxDiagnostics",
      "maxDiagnosticChars",
      "memoryLimitBytes",
      "maxStackSizeBytes",
    ]) &&
    Object.values(value).every(
      (item) => typeof item === "number" && Number.isFinite(item) && item > 0,
    )
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, keys: string[]): boolean {
  const actual = Object.keys(value);
  return actual.length === keys.length && actual.every((key) => keys.includes(key));
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}
