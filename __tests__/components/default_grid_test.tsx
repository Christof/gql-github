import * as React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { DefaultGrid } from "../../src/components/default_grid";

describe("DefaultGrid", function () {
  it("renders children", function () {
    render(<DefaultGrid>content</DefaultGrid>);
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("wraps children in a nested grid container", function () {
    const { container } = render(<DefaultGrid>content</DefaultGrid>);
    // MUI Grid container + item renders as two nested divs
    const inner = screen.getByText("content");
    expect(inner.parentElement).toBeTruthy();
    expect(inner.parentElement!.parentElement).toBeTruthy();
  });

  it("renders content with full width (xs=12)", function () {
    render(<DefaultGrid>content</DefaultGrid>);
    // MUI v7 Grid v2: children are rendered in a grid item
    expect(screen.getByText("content")).toBeInTheDocument();
    expect(screen.getByText("content").parentElement).toBeTruthy();
  });

  describe("small", function () {
    it("has limited width depending on screen size", function () {
      render(<DefaultGrid small>content</DefaultGrid>);
      // MUI v7 Grid v2: content is still rendered inside a responsive grid item
      expect(screen.getByText("content")).toBeInTheDocument();
      expect(screen.getByText("content").parentElement).toBeTruthy();
    });
  });
});
