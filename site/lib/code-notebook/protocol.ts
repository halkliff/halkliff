import type { NotebookDiagnostic } from "./types.ts";

export interface PythonWorkerRequestPrepare {
  readonly type: "prepare";
  readonly id: number;
  readonly indexURL: string;
}

export interface PythonWorkerRequestRun {
  readonly type: "run";
  readonly id: number;
  readonly code: string;
  readonly maxOutputBytes: number;
}

export type PythonWorkerRequest =
  | PythonWorkerRequestPrepare
  | PythonWorkerRequestRun;

export interface PythonWorkerResponseReady {
  readonly type: "ready";
  readonly id: number;
  readonly version?: string;
}

export interface PythonWorkerResponseResult {
  readonly type: "result";
  readonly id: number;
  readonly ok: boolean;
  readonly stdout: string;
  readonly stderr: string;
  readonly value?: unknown;
  readonly outputTruncated: boolean;
  readonly diagnostics: readonly NotebookDiagnostic[];
}

export interface PythonWorkerResponseError {
  readonly type: "error";
  readonly id: number;
  readonly stage: "prepare" | "run";
  readonly message: string;
  readonly stack?: string;
}

export interface PythonWorkerResponseTerminated {
  readonly type: "terminated";
  readonly id: number;
  readonly reason: "timeout" | "cancelled";
}

export type PythonWorkerResponse =
  | PythonWorkerResponseReady
  | PythonWorkerResponseResult
  | PythonWorkerResponseError
  | PythonWorkerResponseTerminated;

export interface NotebookWorker {
  postMessage(message: PythonWorkerRequest): void;
  terminate(): void;
  addEventListener(
    type: "message" | "error",
    listener: (event: MessageEvent<PythonWorkerResponse> | ErrorEvent) => void,
  ): void;
  removeEventListener(
    type: "message" | "error",
    listener: (event: MessageEvent<PythonWorkerResponse> | ErrorEvent) => void,
  ): void;
}
