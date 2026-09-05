import type { AdapterCapability, NotebookDiagnostic } from "./types.ts";

export const RUST_BROWSER_SPIKE = Object.freeze({
  id: "rust-browser-compiler-2026-08",
  status: "blocked" as const,
  question:
    "Can an editable arbitrary Rust cell be compiled and run locally in this browser app?",
  requiredPath:
    "source -> local rustc/LLVM toolchain in a Worker -> wasm32 output -> isolated local execution",
  checkedCandidates: [
    "rustc + wasm-bindgen/wasm-pack",
    "Rust Playground",
    "rustc self-hosting to WebAssembly",
  ] as const,
  blocker:
    "No production-suitable, maintained rustc/LLVM browser distribution is available to ship in this app.",
  evidence: [
    "https://doc.rust-lang.org/stable/rustc/platform-support/wasm32-unknown-unknown.html",
    "https://github.com/rust-lang/rust-playground#architecture",
    "https://github.com/rust-lang/rust/issues/62202",
  ] as const,
  reproducibleCheck: "pnpm spike:rust",
});

export interface RustCapabilityProbe {
  readonly hasWebAssembly?: boolean;
  readonly hasWorker?: boolean;
  readonly localCompilerAsset?: string | boolean;
}

export interface RustCapability extends AdapterCapability {
  readonly language: "rust";
  readonly state: "disabled";
  readonly runtime: "none";
  readonly environment: {
    readonly hasWebAssembly: boolean;
    readonly hasWorker: boolean;
    readonly localCompilerAsset: boolean;
  };
}

export function detectRustCapability(
  probe: RustCapabilityProbe = {},
): RustCapability {
  const hasWebAssembly =
    probe.hasWebAssembly ?? typeof WebAssembly !== "undefined";
  const hasWorker = probe.hasWorker ?? typeof Worker !== "undefined";
  const localCompilerAsset = Boolean(probe.localCompilerAsset);

  return {
    language: "rust",
    state: "disabled",
    local: true,
    runtime: "none",
    reason: RUST_BROWSER_SPIKE.blocker,
    evidence: RUST_BROWSER_SPIKE.evidence,
    environment: {
      hasWebAssembly,
      hasWorker,
      localCompilerAsset,
    },
  };
}

export function rustFallbackDiagnostic(): NotebookDiagnostic {
  return {
    severity: "warning",
    code: "RUST_LOCAL_COMPILER_UNAVAILABLE",
    message:
      "Rust execution is disabled: this build does not ship a local rustc/LLVM browser compiler. No server or precompiled snippet fallback is used.",
  };
}

export function rustSpikeReport(): {
  readonly id: string;
  readonly status: "blocked";
  readonly blocker: string;
  readonly evidence: readonly string[];
  readonly environment: RustCapability["environment"];
} {
  const capability = detectRustCapability();
  return {
    id: RUST_BROWSER_SPIKE.id,
    status: RUST_BROWSER_SPIKE.status,
    blocker: RUST_BROWSER_SPIKE.blocker,
    evidence: RUST_BROWSER_SPIKE.evidence,
    environment: capability.environment,
  };
}
