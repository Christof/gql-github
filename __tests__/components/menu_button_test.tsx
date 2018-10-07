import * as React from "react";
import { MenuButton } from "../../src/components/menu_button";
import { shallow } from "enzyme";
import { Link } from "react-router-dom";

describe("MenuButton", function() {
  const button = (
    <MenuButton
      text="Route1"
      to="/route1"
      disabled={false}
      className="some-class"
      activeClassName="active-class"
    />
  );

  it("renders a Button with given className if not active", function() {
    const wrapper = shallow(button);
    expect(wrapper.prop("className")).toEqual("some-class");
  });

  it("renders a Button with given className and activeClassName if active", function() {
    history.pushState({}, "route 1", "/route1");
    const wrapper = shallow(button);
    expect(wrapper.prop("className")).toEqual("some-class active-class");
  });

  it("passes text along as children", function() {
    const wrapper = shallow(button);
    expect(wrapper.prop("children")).toEqual("Route1");
  });

  it("creates a Link component", function() {
    const wrapper = shallow(button);
    expect(wrapper.prop("component")).toEqual(Link);
  });

  it("passes disabled along to Button", function() {
    const wrapper = shallow(button);
    expect(wrapper.prop("disabled")).toEqual(false);
  });
});
