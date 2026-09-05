# CodeNotebook runtime adapter

`createCodeNotebookRuntime` is the integration seam for an editable JavaScript
or TypeScript notebook. It has no UI dependencies and is not imported by the
portfolio pages unless a notebook opts into it.

```ts
import { createCodeNotebookRuntime } from "@/lib/notebook";

const runtime = createCodeNotebookRuntime();
const preparation = await runtime.prepare({ language: "typescript" });

if (preparation.ok) {
  const result = await runtime.run({
    language: "typescript",
    source: editorValue,
  });
  // Render result.stdout, result.stderr, and result.diagnostics.
}

runtime.dispose();
```

Preparation creates a module Worker, which then lazy-loads the TypeScript
transpiler for TypeScript notebooks and the local QuickJS-WASM release for
both supported languages. A page that never calls `prepare` does not create a
worker or request either runtime chunk.

The repository compiler is TypeScript 7 (`@typescript/native`), but the
notebook transpiler intentionally loads the official TypeScript 6 compatibility
alias from `typescript`. That keeps the legacy Compiler API available without
downgrading the project-wide compiler.

Each run receives a fresh QuickJS runtime and context. The worker exposes only
bounded `console.log`/`info`/`debug` stdout and `warn`/`error` stderr. User code
does not receive DOM, network, storage, filesystem, or host-object bindings.
CPU, memory, source, output, and diagnostic limits are clamped in
`protocol.ts`. `cancel` terminates the worker so a synchronous infinite loop
cannot block the page; `reset` starts fresh on the next preparation.

Runtime preparation failures return diagnostics. There is deliberately no
main-thread `eval`/`Function` fallback.
