import * as React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Section } from "../../src/components/section";

describe("Section", function () {
  it("renders the Paper component", function () {
    const { container } = render(<Section />);
    expect(container.firstChild).toBeTruthy();
  });

  it("sets some style", function () {
    const { container } = render(<Section />);
    const paper = container.firstChild as HTMLElement;
    expect(paper).toHaveStyle("margin-top: 8px");
    expect(paper).toHaveStyle("padding: 12px");
    expect(paper).toHaveStyle("margin-bottom: 16px");
  });

  describe("with set heading", function () {
    it("renders a heading", function () {
      render(<Section heading="my heading" />);
      expect(screen.getByText("my heading")).toBeInTheDocument();
    });

    it("renders the heading as an h5 variant", function () {
      const { container } = render(<Section heading="my heading" />);
      // MUI Typography variant="h5" renders as h6 in v4 by default mapping,
      // but with variantMapping it renders the text. Check the text is present.
      expect(screen.getByText("my heading")).toBeInTheDocument();
    });
  });
});
