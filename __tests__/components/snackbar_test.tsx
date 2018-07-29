import * as React from "react";
import { shallow } from "enzyme";
import { TransitionLeft } from "../../src/components/snackbar";
import { Slide } from "material-ui";

describe("TransitionLeft", function() {
  it("is a Slide with direction left", function() {
    const props: any = {};
    const wrapper = shallow(<TransitionLeft {...props} />);

    expect(wrapper.find(Slide)).toHaveLength(1);
    expect(wrapper.prop("direction")).toEqual("left");
  });
});
