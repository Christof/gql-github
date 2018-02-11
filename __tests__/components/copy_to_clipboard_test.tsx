import * as React from "react";
import { CopyToClipboard } from "../../src/components/copy_to_clipboard";
import { shallow, ShallowWrapper } from "enzyme";

describe("CopyToClipboard", function() {
  let wrapper: ShallowWrapper<any, any>;

  beforeEach(function() {
    wrapper = shallow(<CopyToClipboard text="text to copy" />);
  });

  describe("span with content", function() {
    it("puts text prop into the span", function() {
      expect(wrapper.find("span").prop("children")).toEqual("text to copy");
    });
  });
});
