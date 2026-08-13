import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CodeNotebook } from "@/app/components/code-notebook/CodeNotebook";
import type { RuntimeAdapter, RuntimeLoader } from "@/app/components/code-notebook/types";

describe("CodeNotebook component", () => {
  it("prepares lazily, runs edited source, resets, and disposes its adapter", async () => {
    const user = userEvent.setup();
    const adapter: RuntimeAdapter = {
      prepare: vi.fn(async () => ({ available: true })),
      run: vi.fn(async (source: string) => ({ stdout: `ran:${source}` })),
      reset: vi.fn(async () => undefined),
      dispose: vi.fn(async () => undefined),
    };
    const loader: RuntimeLoader = vi.fn(async () => adapter);

    const view = render(
      <CodeNotebook
        initialSource="const value = 1"
        language="typescript"
        runtimeLoader={loader}
        title="Test notebook"
      />,
    );

    const notebook = screen.getByRole("region", { name: "Test notebook" });
    await waitFor(() => expect(notebook.dataset.runtimeState).toBe("ready"));
    expect(loader).toHaveBeenCalledTimes(1);

    const editor = screen.getByRole("textbox", { name: "TypeScript source" });
    await user.clear(editor);
    await user.type(editor, "console.log(2)");
    await user.click(screen.getByRole("button", { name: "Run" }));

    await waitFor(() => expect(screen.getByText("ran:console.log(2)")).toBeTruthy());
    expect(adapter.run).toHaveBeenCalledWith(
      "console.log(2)",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );

    await user.click(screen.getByRole("button", { name: "Reset" }));
    await waitFor(() =>
      expect((editor as HTMLTextAreaElement).value).toBe("const value = 1"),
    );
    expect(adapter.reset).toHaveBeenCalledTimes(1);

    view.unmount();
    expect(adapter.dispose).toHaveBeenCalledTimes(1);
  });

  it("surfaces an unavailable local runtime without attempting a run", async () => {
    const adapter: RuntimeAdapter = {
      prepare: vi.fn(async () => ({ available: false, message: "No local compiler" })),
      run: vi.fn(),
    };
    render(
      <CodeNotebook
        initialSource="fn main() {}"
        language="rust"
        runtimeLoader={async () => adapter}
      />,
    );

    const notebook = screen.getByRole("region", {
      name: "Interactive code notebook",
    });
    await waitFor(() => expect(notebook.dataset.runtimeState).toBe("unavailable"));
    expect(screen.getByText("No local compiler")).toBeTruthy();
    expect(adapter.run).not.toHaveBeenCalled();
  });
});
