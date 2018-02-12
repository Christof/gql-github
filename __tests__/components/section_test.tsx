import * as React from "react";
import { Section } from "../../src/components/section";
import { shallow } from "enzyme";
import { Paper } from "material-ui";

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
});
