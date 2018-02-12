import * as React from "react";
import { Dropdown } from "../../src/components/dropdown";
import { shallow } from "enzyme";
import { Grid } from "material-ui";

describe("Dropdown", function() {
  it("renders a disabled option with value none", function() {
    const wrapper = shallow(
      <Dropdown options={[]} label="label" onSelect={() => {}} />
    );

    const item = wrapper.find("WithStyles(MenuItem)");
    expect(item).toHaveLength(1);
    expect(item.prop("children")).toEqual(["Select ", "label"]);
    expect(item.prop("disabled")).toEqual(true);
    expect(item.prop("value")).toEqual("none");
  });

  it("renders a Select with given options", function() {
    const wrapper = shallow(
      <Dropdown options={["opt1", "opt2"]} onSelect={() => {}} />
    );

    const items = wrapper.find("WithStyles(MenuItem)");
    expect(items).toHaveLength(3);
    expect(items.at(1).prop("children")).toEqual([null, "opt1"]);
    expect(items.at(2).prop("children")).toEqual([null, "opt2"]);
  });
});
