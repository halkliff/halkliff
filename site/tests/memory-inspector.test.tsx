import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MemoryInspector } from "@/app/(blog)/blog/(entries)/(01_memory-layout-for-react-devs)/memory-layout-for-react-devs/MemoryInspector";

describe("MemoryInspector", () => {
  it("updates its accessible byte summary when readers change the model", async () => {
    const user = userEvent.setup();
    render(<MemoryInspector />);

    expect(screen.getAllByText("8 bytes", { selector: "strong" })).toHaveLength(2);
    expect(screen.getByText(/0x1000—0x1007/)).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "u32" }));
    expect(screen.getAllByText("16 bytes", { selector: "strong" })).toHaveLength(2);
    expect(screen.getByText(/0x1000—0x100F/)).toBeTruthy();

    const length = screen.getByRole("slider", { name: "Array length" });
    fireEvent.change(length, { target: { value: "2" } });
    expect(screen.getAllByText("8 bytes", { selector: "strong" })).toHaveLength(2);
  });
});
