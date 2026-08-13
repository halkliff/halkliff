let runtime = null;
let namespace = null;
let outputCapture = null;
let requestQueue = Promise.resolve();

function isPythonProxy(value) {
  return value !== null && typeof value === "object" && typeof value.toJs === "function";
}

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error || "Python execution failed.");
}

function normalizeIndexURL(indexURL) {
  return indexURL.endsWith("/") ? indexURL : `${indexURL}/`;
}

function appendOutput(capture, stream, message) {
  const normalized = message.endsWith("\n") ? message : `${message}\n`;
  const encoded = new TextEncoder().encode(normalized);
  const remaining = capture.maxBytes - capture.bytes;
  if (remaining <= 0) {
    capture.outputTruncated = true;
    return;
  }

  const retained = encoded.byteLength <= remaining
    ? normalized
    : new TextDecoder().decode(encoded.slice(0, remaining));
  capture[stream] += retained;
  capture.bytes += new TextEncoder().encode(retained).byteLength;
  if (retained !== normalized) capture.outputTruncated = true;
}

function createOutputCapture(maxBytes) {
  const capture = {
    maxBytes,
    stdout: "",
    stderr: "",
    bytes: 0,
    outputTruncated: false,
    append(stream, message) {
      appendOutput(capture, stream, message);
    },
  };
  return capture;
}

function serializeResult(value) {
  if (value === undefined) return { truncated: false };
  let converted = value;
  try {
    if (isPythonProxy(value)) {
      converted = value.toJs({ depth: 2, dict_converter: Object.fromEntries });
    }
    if (typeof converted === "bigint") converted = `${converted.toString()}n`;
    if (new TextEncoder().encode(JSON.stringify(converted)).byteLength > 16 * 1024) {
      return { value: "<result omitted: value size limit exceeded>", truncated: true };
    }
    return { value: converted, truncated: false };
  } catch {
    return { value: "<result omitted: value is not serializable>", truncated: false };
  } finally {
    if (isPythonProxy(value)) value.destroy?.();
  }
}

function pythonDiagnostic(error) {
  const message = errorMessage(error);
  const line = message.match(/line (\d+)/i)?.[1];
  return {
    severity: "error",
    code: "PYTHON_EXCEPTION",
    message,
    ...(line ? { line: Number(line) } : {}),
  };
}

function postError(id, stage, error) {
  self.postMessage({
    type: "error",
    id,
    stage,
    message: errorMessage(error),
    ...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
  });
}

async function prepare(id, indexURL) {
  if (runtime && namespace) {
    self.postMessage({ type: "ready", id, version: runtime.version });
    return;
  }

  try {
    const localIndexURL = normalizeIndexURL(indexURL);
    const pyodideModule = await import(`${localIndexURL}pyodide.mjs`);
    runtime = await pyodideModule.loadPyodide({
      indexURL: localIndexURL,
      packageBaseUrl: localIndexURL,
      fullStdLib: false,
      jsglobals: Object.create(null),
      stdout: (message) => outputCapture?.append("stdout", message),
      stderr: (message) => outputCapture?.append("stderr", message),
      stdin: () => {
        throw new Error("input() is disabled in the CodeNotebook runner.");
      },
    });

    const dictFactory = runtime.globals.get("dict");
    if (typeof dictFactory !== "function") {
      throw new Error("Pyodide did not expose the Python dict constructor.");
    }
    namespace = dictFactory();
    self.postMessage({ type: "ready", id, version: runtime.version });
  } catch (error) {
    runtime = null;
    namespace?.destroy?.();
    namespace = null;
    postError(id, "prepare", error);
  }
}

async function run(id, code, maxOutputBytes) {
  if (!runtime || !namespace) {
    postError(id, "run", new Error("Python runtime has not been prepared."));
    return;
  }

  const capture = createOutputCapture(maxOutputBytes);
  outputCapture = capture;
  try {
    const value = await runtime.runPythonAsync(code, { globals: namespace });
    const serialized = serializeResult(value);
    self.postMessage({
      type: "result",
      id,
      ok: true,
      stdout: capture.stdout,
      stderr: capture.stderr,
      ...(serialized.value !== undefined ? { value: serialized.value } : {}),
      outputTruncated: capture.outputTruncated || serialized.truncated,
      diagnostics: [],
    });
  } catch (error) {
    self.postMessage({
      type: "result",
      id,
      ok: false,
      stdout: capture.stdout,
      stderr: capture.stderr,
      outputTruncated: capture.outputTruncated,
      diagnostics: [pythonDiagnostic(error)],
    });
  } finally {
    outputCapture = null;
  }
}

async function handleRequest(request) {
  if (request.type === "prepare") {
    await prepare(request.id, request.indexURL);
  } else if (request.type === "run") {
    await run(request.id, request.code, request.maxOutputBytes);
  } else {
    postError(request?.id ?? 0, "run", new Error("Unknown Python Worker request."));
  }
}

self.addEventListener("message", (event) => {
  requestQueue = requestQueue
    .then(() => handleRequest(event.data))
    .catch((error) => postError(event.data?.id ?? 0, "run", error));
});
