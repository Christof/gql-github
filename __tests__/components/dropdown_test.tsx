import * as React from "react";
import { Dropdown } from "../../src/components/dropdown";
import { shallow } from "enzyme";
import { InputLabel, Select, MenuItem } from "@material-ui/core";

describe("Dropdown", function() {
  describe("with label", function() {
    it("adds an InputLabel", function() {
      const wrapper = shallow(
        <Dropdown options={[]} label="label" onSelect={() => {}} />
      );

      const label = wrapper.find(InputLabel);
      expect(label.prop("children")).toEqual("label");
      expect(label.prop("htmlFor")).toEqual("label");
    });

    it("sets the id to the label", function() {
      const wrapper = shallow(
        <Dropdown options={[]} label="label" onSelect={() => {}} />
      );

      expect(wrapper.find(Select).prop("id")).toEqual("label");
    });

    it("renders a disabled option with value none", function() {
      const wrapper = shallow(
        <Dropdown options={[]} label="label" onSelect={() => {}} />
      );

      const item = wrapper.find(MenuItem);
      expect(item).toHaveLength(1);
      expect(item.prop("children")).toEqual(["Select ", "label"]);
      expect(item.prop("disabled")).toEqual(true);
      expect(item.prop("value")).toEqual("none");
    });
  });

  it("renders a Select with given options", function() {
    const wrapper = shallow(
      <Dropdown options={["opt1", "opt2"]} onSelect={() => {}} />
    );

    const items = wrapper.find(MenuItem);
    expect(items).toHaveLength(3);
    expect(items.at(1).prop("children")).toEqual([null, "opt1"]);
    expect(items.at(2).prop("children")).toEqual([null, "opt2"]);
  });

  describe("initialSelection", function() {
    const wrapper = shallow(
      <Dropdown
        options={["opt1", "opt2"]}
        initialSelection="opt2"
        onSelect={() => {}}
      />
    );

    expect(wrapper.find(Select).prop("value")).toEqual("opt2");
  });

  describe("componentDidUpdate", function() {
    it("sets an initial selection if given and the options change", function() {
      const wrapper = shallow(
        <Dropdown
          options={["opt1", "opt2"]}
          initialSelection="opt2"
          onSelect={() => {}}
        />
      );

      wrapper.setProps({
        options: ["optionA", "optionB"],
        initialSelection: "optionA"
      });

      expect(wrapper.find(Select).prop("value")).toEqual("optionA");
    });

    it("doesn't update the selection if the options are the same", function() {
      const options = ["opt1", "opt2"];
      const wrapper = shallow(
        <Dropdown
          options={options}
          initialSelection="opt2"
          onSelect={() => {}}
        />
      );

      wrapper.setProps({
        options,
        initialSelection: "opt1"
      });

      expect(wrapper.find(Select).prop("value")).toEqual("opt2");
    });
  });

  describe("onSelect", function() {
    it("on selection calls onSelect", function() {
      let selected = "";
      const wrapper = shallow(
        <Dropdown
          options={["opt1", "opt2"]}
          onSelect={value => (selected = value)}
        />
      );

      wrapper.find(Select).prop("onChange")({
        target: { value: "opt2" }
      } as any);

      expect(selected).toEqual("opt2");
    });
  });

  describe("iconUrls", function() {
    it("adds an img before each option", function() {
      const wrapper = shallow(
        <Dropdown
          options={["opt1", "opt2"]}
          iconUrls={["url1", "url2"]}
          onSelect={() => {}}
        />
      );

      const items = wrapper.find(MenuItem);
      expect(items).toHaveLength(3);
      expect(
        items
          .at(1)
          .find("img")
          .prop("src")
      ).toEqual("url1");
      expect(
        items
          .at(2)
          .find("img")
          .prop("src")
      ).toEqual("url2");
    });
  });
});
