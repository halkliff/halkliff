import { DEFAULT_EXECUTION_LIMITS, resolveExecutionLimits, utf8ByteLength } from "./limits.ts";
import {
  detectRustCapability,
  rustFallbackDiagnostic,
  type RustCapabilityProbe,
} from "./rust-spike.ts";
import type {
  ExecutionResult,
  NotebookDiagnostic,
  NotebookExecutionAdapter,
  PreparationResult,
  RunOptions,
} from "./types.ts";

export interface RustAdapterOptions {
  readonly capabilityProbe?: RustCapabilityProbe;
}

function disabledResult(
  diagnostics: readonly NotebookDiagnostic[],
): ExecutionResult {
  return {
    language: "rust",
    status: "disabled",
    stdout: "",
    stderr: "",
    outputTruncated: false,
    durationMs: 0,
    diagnostics,
  };
}

export function createRustAdapter(
  options: RustAdapterOptions = {},
): NotebookExecutionAdapter {
  const capability = detectRustCapability(options.capabilityProbe);
  let disposed = false;

  const adapter: NotebookExecutionAdapter = {
    language: "rust",
    capability,

    async prepare(): Promise<PreparationResult> {
      if (disposed) {
        return {
          language: "rust",
          status: "failed",
          capability,
          diagnostics: [
            {
              severity: "error",
              code: "RUST_ADAPTER_DISPOSED",
              message: "The Rust adapter has been disposed.",
            },
          ],
        };
      }

      return {
        language: "rust",
        status: "disabled",
        capability,
        diagnostics: [rustFallbackDiagnostic()],
      };
    },

    async run(source: string, optionsForRun: RunOptions = {}): Promise<ExecutionResult> {
      void source;
      const resolved = resolveExecutionLimits({
        ...DEFAULT_EXECUTION_LIMITS,
        ...optionsForRun.limits,
      });

      if (!resolved.limits) {
        return {
          ...disabledResult(resolved.diagnostics),
          status: "failed",
        };
      }

      if (utf8ByteLength(source) > resolved.limits.maxCodeBytes) {
        return {
          ...disabledResult([
            {
              severity: "error",
              code: "RUST_CODE_TOO_LARGE",
              message: `Rust source exceeds the ${resolved.limits.maxCodeBytes} byte limit.`,
            },
          ]),
          status: "failed",
        };
      }

      return disabledResult([rustFallbackDiagnostic()]);
    },

    cancel(): void {
      // There is no process or fake compiler to cancel while capability is disabled.
      void 0;
    },

    terminate(): void {
      // Keep the common contract available for a future local compiler backend.
      void 0;
    },

    dispose(): void {
      disposed = true;
    },
  };

  return adapter;
}
