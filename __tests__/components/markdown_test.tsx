import * as React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Markdown } from "../../src/components/markdown";

describe("Markdown", function () {
  it("renders the source as markdown content", function () {
    const source = "# heading\nsome text";
    const { container } = render(<Markdown source={source} />);
    // The ReactMarkdown mock renders children as-is inside a div
    expect(container.textContent).toContain("# heading");
  });

  it("sets the fontFamily on the outer div", function () {
    const { container } = render(<Markdown source="# heading" />);
    const div = container.firstChild as HTMLElement;
    expect(div).toHaveStyle("font-family: Roboto, Helvetica, Arial, sans-serif");
  });

  it("uses custom fontFamily when provided", function () {
    const { container } = render(
      <Markdown source="text" fontFamily="monospace" />
    );
    const div = container.firstChild as HTMLElement;
    expect(div).toHaveStyle("font-family: monospace");
  });
});
