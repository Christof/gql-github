import * as React from "react";
import { DefaultGrid } from "../../src/components/default_grid";
import { shallow } from "enzyme";
import { Grid } from "material-ui";

describe("DefaultGrid", function() {
  it("renders a nested Grid", function() {
    const wrapper = shallow(<DefaultGrid>content</DefaultGrid>);
    expect(wrapper.find(Grid)).toHaveLength(2);
  });

  it("passes the content into the second Grid", function() {
    const wrapper = shallow(<DefaultGrid>content</DefaultGrid>);
    expect(
      wrapper
        .find(Grid)
        .at(1)
        .prop("children")
    ).toEqual("content");
  });

  it("has full width", function() {
    const wrapper = shallow(<DefaultGrid>content</DefaultGrid>);
    expect(
      wrapper
        .find(Grid)
        .at(1)
        .props()
    ).toHaveProperty("xs", 12);
  });

  describe("small", function() {
    it("has limited width depending on screen size", function() {
      const wrapper = shallow(<DefaultGrid small>content</DefaultGrid>);
      expect(
        wrapper
          .find(Grid)
          .at(1)
          .props()
      ).toMatchObject({ xs: 12, md: 10, lg: 8 });
    });
  });
});
