import * as React from "react";
import { CopyToClipboard } from "../../src/components/copy_to_clipboard";
import { shallow, ShallowWrapper } from "enzyme";
import { Button } from "@material-ui/core";

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
  let wrapper: ShallowWrapper<any, any>;

  beforeEach(function () {
    wrapper = shallow(<CopyToClipboard text="text to copy" />);
  });

  describe("span with content", function () {
    it("puts text prop into the span", function () {
      expect(wrapper.find("span").prop("children")).toEqual("text to copy");
    });

    it("has the id 'textToCopy'", function () {
      expect(wrapper.find("#textToCopy")).toHaveLength(1);
    });

    it("sets style properties", function () {
      expect(wrapper.find("span").prop("style")).toEqual({
        userSelect: "text",
        whiteSpace: "pre",
        position: "absolute",
        clip: "rect(0, 0, 0, 0)"
      });
    });
  });

  describe("copy button", function () {
    it("has text of Copy", function () {
      const button = wrapper.find(Button);
      expect(button).toHaveLength(1);
      expect(button.prop("children")).toEqual("Copy");
    });

    it("can have custom text given by buttonText prop", function () {
      wrapper = shallow(
        <CopyToClipboard buttonText="Custom Button Text" text="text to copy" />
      );
      const button = wrapper.find(Button);
      expect(button).toHaveLength(1);
      expect(button.prop("children")).toEqual("Custom Button Text");
    });

    it("copies span content on click", function () {
      const getElementByIdSpy = jest.spyOn(document, "getElementById");
      const mocks = setupMocksForCopy();

      const button = wrapper.find(Button);
      button.prop("onClick")(undefined);

      expect(mocks.createRangeMock).toHaveBeenCalled();
      expect(mocks.getSelectionMock).toHaveBeenCalled();
      expect(mocks.execCommandMock).toHaveBeenCalledWith("Copy");
      expect(getElementByIdSpy).toHaveBeenCalledWith("textToCopy");
    });

    it("calls onClick on button click", function () {
      const onClick = jest.fn();
      wrapper = shallow(
        <CopyToClipboard onClick={onClick} text="text to copy" />
      );

      setupMocksForCopy();

      const button = wrapper.find(Button);
      button.prop("onClick")(undefined);

      expect(onClick).toHaveBeenCalled();
    });
  });
});
