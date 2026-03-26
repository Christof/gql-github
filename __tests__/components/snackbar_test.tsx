import * as React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TransitionLeft } from "../../src/components/snackbar";

describe("TransitionLeft", function () {
  it("renders a Slide transition with direction left", function () {
    // TransitionLeft wraps MUI Slide with direction="left"
    // We verify it renders without crashing and produces DOM output
    const { container } = render(
      <TransitionLeft in={true}>
        <div>content</div>
      </TransitionLeft>
    );
    expect(container).toBeTruthy();
  });

  it("passes through children when in=true", function () {
    const { getByText } = render(
      <TransitionLeft in={true}>
        <div>slide content</div>
      </TransitionLeft>
    );
    expect(getByText("slide content")).toBeInTheDocument();
  });
});
