import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CopyToClipboard } from "../../src/components/copy_to_clipboard";

export function setupMocksForCopy() {
  const createRangeMock = jest.fn();
  createRangeMock.mockReturnValue({ selectNode() {} });
  document.createRange = createRangeMock;

  const getSelectionMock = jest.fn();
  getSelectionMock.mockReturnValue({ empty() {}, addRange() {} });
  document.getSelection = getSelectionMock;

  const execCommandMock = jest.fn();
  document.execCommand = execCommandMock;

  return { createRangeMock, getSelectionMock, execCommandMock };
}

describe("CopyToClipboard", function () {
  describe("span with content", function () {
    it("puts text prop into the span", function () {
      render(<CopyToClipboard text="text to copy" />);
      const span = document.getElementById("textToCopy");
      expect(span).toHaveTextContent("text to copy");
    });

    it("has the id 'textToCopy'", function () {
      render(<CopyToClipboard text="text to copy" />);
      expect(document.getElementById("textToCopy")).toBeTruthy();
    });

    it("sets style properties on the span", function () {
      render(<CopyToClipboard text="text to copy" />);
      const span = document.getElementById("textToCopy") as HTMLElement;
      expect(span).toHaveStyle("position: absolute");
      expect(span).toHaveStyle("white-space: pre");
    });
  });

  describe("copy button", function () {
    it("has text of Copy", function () {
      render(<CopyToClipboard text="text to copy" />);
      expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
    });

    it("can have custom text given by buttonText prop", function () {
      render(
        <CopyToClipboard buttonText="Custom Button Text" text="text to copy" />
      );
      expect(
        screen.getByRole("button", { name: "Custom Button Text" })
      ).toBeInTheDocument();
    });

    it("copies span content on click", function () {
      const getElementByIdSpy = jest.spyOn(document, "getElementById");
      const mocks = setupMocksForCopy();

      render(<CopyToClipboard text="text to copy" />);
      fireEvent.click(screen.getByRole("button", { name: "Copy" }));

      expect(mocks.createRangeMock).toHaveBeenCalled();
      expect(mocks.getSelectionMock).toHaveBeenCalled();
      expect(mocks.execCommandMock).toHaveBeenCalledWith("Copy");
      expect(getElementByIdSpy).toHaveBeenCalledWith("textToCopy");
    });

    it("calls onClick on button click", function () {
      const onClick = jest.fn();
      setupMocksForCopy();

      render(<CopyToClipboard onClick={onClick} text="text to copy" />);
      fireEvent.click(screen.getByRole("button", { name: "Copy" }));

      expect(onClick).toHaveBeenCalled();
    });
  });
});
