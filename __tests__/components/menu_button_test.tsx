import * as React from "react";
import { MenuButton } from "../../src/components/menu_button";
import { shallow } from "enzyme";
import { Button } from "material-ui";
import { Link } from "react-router-dom";

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

  it("passes text along as children", function() {
    const wrapper = shallow(button);
    expect(wrapper.prop("children")).toEqual("Route1");
  });

  it("creates a Link component", function() {
    const wrapper = shallow(button);
    expect(wrapper.prop("component")()).toEqual(<Link to="/route1" />);
  });

  it("passes disabled along to Button", function() {
    const wrapper = shallow(button);
    expect(wrapper.prop("disabled")).toEqual(false);
  });

  it("passes className along to Button", function() {
    const wrapper = shallow(button);
    expect(wrapper.prop("className")).toEqual("some-class");
  });
});
