import * as React from "react";
import { MenuButton } from "../../src/components/menu_button";
import { shallow } from "enzyme";
import { Button } from "material-ui";

describe("MenuButton", function() {
  const button = (
    <MenuButton
      text="Route1"
      to="/route1"
      disabled={false}
      className="some-class"
    />
  );

  it("renders a Button with primary color if not active", function() {
    const wrapper = shallow(button);
    expect(wrapper.prop("color")).toEqual("primary");
  });

  it("renders a Button with secondary color if active", function() {
    history.pushState({}, "route 1", "/route1");
    const wrapper = shallow(button);
    expect(wrapper.prop("color")).toEqual("secondary");
  });
});
