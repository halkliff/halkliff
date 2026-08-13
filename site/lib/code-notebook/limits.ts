import type { ExecutionLimits, NotebookDiagnostic } from "./types.ts";

export const DEFAULT_EXECUTION_LIMITS: ExecutionLimits = Object.freeze({
  timeoutMs: 4_000,
  maxCodeBytes: 64 * 1024,
  maxOutputBytes: 64 * 1024,
});

export function resolveExecutionLimits(
  requested: Partial<ExecutionLimits> | undefined,
): {
  readonly limits?: ExecutionLimits;
  readonly diagnostics: readonly NotebookDiagnostic[];
} {
  const candidate = {
    ...DEFAULT_EXECUTION_LIMITS,
    ...requested,
  };

  const invalid = Object.entries(candidate).find(
    ([, value]) =>
      typeof value !== "number" || !Number.isInteger(value) || value <= 0,
  );

  if (invalid) {
    return {
      diagnostics: [
        {
          severity: "error",
          code: "INVALID_LIMIT",
          message: `${invalid[0]} must be a positive integer.`,
        },
      ],
    };
  }

  return {
    limits: candidate,
    diagnostics: [],
  };
}
export function utf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

export function truncateUtf8(value: string, maxBytes: number): string {
  if (maxBytes <= 0) return "";

  const encoded = new TextEncoder().encode(value);
  if (encoded.byteLength <= maxBytes) return value;

  return new TextDecoder().decode(encoded.slice(0, maxBytes));
}

export function capOutput(
  stdout: string,
  stderr: string,
  maxOutputBytes: number,
): {
  readonly stdout: string;
  readonly stderr: string;
  readonly outputTruncated: boolean;
} {
  let remaining = maxOutputBytes;
  const cappedStdout = truncateUtf8(stdout, remaining);
  remaining -= utf8ByteLength(cappedStdout);
  const cappedStderr = truncateUtf8(stderr, remaining);

  return {
    stdout: cappedStdout,
    stderr: cappedStderr,
    outputTruncated:
      cappedStdout !== stdout || cappedStderr !== stderr,
  };
}

