import type { ComponentProps, ComponentType } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useMDXComponents } from "@/mdx-components";

describe("MDX typography", () => {
  it("renders inline code inside one semantic paragraph", () => {
    const components = useMDXComponents({});
    const Paragraph = components.p as ComponentType<ComponentProps<"p">>;
    const Code = components.code as ComponentType<ComponentProps<"code">>;

    const { container } = render(
      <Paragraph>
        In Rust, <Code>[u16; 4]</Code> describes the layout.
      </Paragraph>,
    );

    const paragraph = screen.getByText(/In Rust/).closest("p");
    const code = screen.getByText("[u16; 4]");

    expect(paragraph).not.toBeNull();
    expect(code.tagName).toBe("CODE");
    expect(code.parentElement).toBe(paragraph);
    expect(container.querySelector("p p")).toBeNull();
  });
});
