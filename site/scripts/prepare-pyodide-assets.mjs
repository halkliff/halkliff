import { copyFile, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const targetRoot = resolve(projectRoot, "public", "pyodide");
const workerSource = resolve(projectRoot, "lib", "code-notebook", "python.worker.mjs");
const workerTarget = resolve(projectRoot, "public", "python-notebook.worker.mjs");

// Pyodide resolves its WebAssembly and package files relative to indexURL.
// Keep this list extension-based so upgrades add new runtime data files to the
// manifest instead of silently falling back to a CDN or another network host.
const runtimeExtensions = new Set([
  ".data",
  ".js",
  ".json",
  ".mjs",
  ".wasm",
  ".whl",
  ".zip",
]);

function packageRoot() {
  let entry;
  try {
    entry = require.resolve("pyodide");
  } catch {
    throw new Error(
      "The local Pyodide package is not installed. Run `pnpm install` before staging runtime assets.",
    );
  }

  return dirname(entry);
}

async function collectRuntimeFiles(root, directory = root) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === "node_modules") continue;
    const source = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectRuntimeFiles(root, source)));
      continue;
    }

    if (runtimeExtensions.has(extname(entry.name).toLowerCase())) {
      files.push(source);
    }
  }

  return files;
}

async function main() {
  const sourceRoot = packageRoot();
  const files = await collectRuntimeFiles(sourceRoot);

  if (!files.some((file) => file.endsWith("pyodide.asm.wasm"))) {
    throw new Error(
      `The installed Pyodide package at ${sourceRoot} does not contain pyodide.asm.wasm.`,
    );
  }

  await rm(targetRoot, { recursive: true, force: true });
  await mkdir(targetRoot, { recursive: true });

  const assets = [];
  for (const source of files.sort()) {
    const relativePath = relative(sourceRoot, source).replaceAll("\\", "/");
    const destination = join(targetRoot, relativePath);
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(source, destination);
    const bytes = (await stat(source)).size;
    assets.push({ path: relativePath, bytes });
  }

  const packageManifest = JSON.parse(
    await readFile(join(sourceRoot, "package.json"), "utf8"),
  );
  const manifest = {
    generatedBy: "scripts/prepare-pyodide-assets.mjs",
    package: "pyodide",
    version: packageManifest.version,
    indexURL: "/pyodide/",
    assets,
    totalBytes: assets.reduce((total, asset) => total + asset.bytes, 0),
  };
  await writeFile(
    join(targetRoot, "asset-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
  await copyFile(workerSource, workerTarget);

  console.log(
    `Staged ${assets.length} local Pyodide assets (${manifest.totalBytes} bytes) and its module Worker for version ${manifest.version}.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
