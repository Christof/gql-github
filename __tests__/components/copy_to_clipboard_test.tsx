import * as React from "react";
import { CopyToClipboard } from "../../src/components/copy_to_clipboard";
import { shallow, ShallowWrapper } from "enzyme";
import { Button } from "@material-ui/core";

describe("CopyToClipboard", function() {
  let wrapper: ShallowWrapper<any, any>;

  beforeEach(function() {
    wrapper = shallow(<CopyToClipboard text="text to copy" />);
  });

  describe("span with content", function() {
    it("puts text prop into the span", function() {
      expect(wrapper.find("span").prop("children")).toEqual("text to copy");
    });

    it("has the id 'textToCopy'", function() {
      expect(wrapper.find("#textToCopy")).toHaveLength(1);
    });

    it("sets style properties", function() {
      expect(wrapper.find("span").prop("style")).toEqual({
        userSelect: "text",
        whiteSpace: "pre",
        position: "absolute",
        clip: "rect(0, 0, 0, 0)"
      });
    });
  });

  describe("copy button", function() {
    it("is text of Copy", function() {
      const button = wrapper.find(Button);
      expect(button).toHaveLength(1);
      expect(button.prop("children")).toEqual("Copy");
    });

    it("copies span content on click", function() {
      const createRangeMock = jest.fn();
      createRangeMock.mockReturnValue({ selectNode() {} });
      document.createRange = createRangeMock;

      const getSelectionMock = jest.fn();
      getSelectionMock.mockReturnValue({ empty() {}, addRange() {} });
      document.getSelection = getSelectionMock;

      const getElementByIdSpy = jest.spyOn(document, "getElementById");

      const execCommandMock = jest.fn();
      document.execCommand = execCommandMock;

      const button = wrapper.find(Button);
      button.prop("onClick")(undefined);

      expect(createRangeMock).toHaveBeenCalled();
      expect(getSelectionMock).toHaveBeenCalled();
      expect(getElementByIdSpy).toHaveBeenCalledWith("textToCopy");
      expect(execCommandMock).toHaveBeenCalledWith("Copy");
    });
  });
});
