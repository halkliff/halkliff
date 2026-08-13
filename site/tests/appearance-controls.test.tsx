import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { setTheme } = vi.hoisted(() => ({ setTheme: vi.fn() }));

vi.mock("next-themes", () => ({
  useTheme: () => ({ setTheme, theme: "system" }),
}));

import { AppearanceControls } from "@/app/components/AppearanceControls";

describe("AppearanceControls", () => {
  beforeEach(() => setTheme.mockClear());

  it("uses the shared theme setter for every placement", async () => {
    const user = userEvent.setup();
    render(<AppearanceControls placement="header" />);

    expect(screen.getByText("Appearance")).toBeTruthy();
    expect(screen.getByRole("button", { name: "system" }).getAttribute("aria-pressed")).toBe(
      "true",
    );

    await user.click(screen.getByRole("button", { name: "light" }));
    expect(setTheme).toHaveBeenCalledOnce();
    expect(setTheme).toHaveBeenCalledWith("light");
  });
});
