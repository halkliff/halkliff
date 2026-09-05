import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": root,
    },
  },
  test: {
    environment: "jsdom",
    include: [
      "tests/memory-model.test.ts",
      "tests/reusable-logic.test.ts",
      "tests/memory-inspector.test.tsx",
      "tests/code-notebook-component.test.tsx",
      "tests/appearance-controls.test.tsx",
      "tests/mdx-components.test.tsx",
      "tests/workbench-terminal.test.tsx",
    ],
    setupFiles: ["./tests/setup.ts"],
  },
});
