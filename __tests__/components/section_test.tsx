import * as React from "react";
import { Section } from "../../src/components/section";
import { shallow } from "enzyme";
import { Paper, Typography } from "@material-ui/core";

describe("Section", function() {
  it("renders the Paper components", function() {
    const wrapper = shallow(<Section />);
    expect(wrapper.find(Paper)).toHaveLength(1);
  });

  it("sets some style", function() {
    const wrapper = shallow(<Section />);
    expect(wrapper.props().style).toMatchObject({
      marginTop: 8,
      padding: 12,
      marginBottom: 16
    });
  });

  describe("with set heading", function() {
    it("renders a heading", function() {
      const wrapper = shallow(<Section heading="my heading" />);

      const typography = wrapper.find(Typography);
      expect(typography).toHaveLength(1);
      expect(typography.prop("children")).toEqual("my heading");
      expect(typography.prop("variant")).toEqual("h5");
      expect(typography.prop("paragraph")).toEqual(true);
    });
  });
});
