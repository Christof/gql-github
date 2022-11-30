import * as React from "react";
import ReactMarkdown from "react-markdown";
import { Markdown } from "../../src/components/markdown";
import { shallow } from "enzyme";

describe("Markdown", function () {
  it("passes the source to ReactMarkdown", function () {
    const source = "# heading\nsome text";
    const wrapper = shallow(<Markdown source={source} />);

    expect(wrapper.find(ReactMarkdown).prop("children")).toEqual(source);
  });

  it("sets the fontFamiliy on the outer div", function () {
    const wrapper = shallow(<Markdown source="# heading" />);

    const div = wrapper.find("div");
    expect(div).toHaveLength(1);
    expect(div.prop("style")).toHaveProperty("fontFamily");
  });
});
