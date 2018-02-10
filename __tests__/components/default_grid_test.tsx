import * as React from "react";
import { DefaultGrid } from "../../src/components/default_grid";
import { shallow } from "enzyme";
import { Grid } from "material-ui";

describe("DefaultGrid", function() {
  it("renders a nested Grid", function() {
    const wrapper = shallow(<DefaultGrid>content</DefaultGrid>);
    expect(wrapper.find(Grid)).toHaveLength(2);
  });
});
