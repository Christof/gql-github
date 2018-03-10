import * as React from "react";
import { createDynamicImport } from "../../src/components/dynamic_import";
import { mount } from "enzyme";
import { waitImmediate } from "../helper";

class TestComponent extends React.Component<{ n: number }> {
  render() {
    return <div>Number: {this.props.n}</div>;
  }
}

describe("createDynamicImport", function() {
  describe("before load is finished", function() {
    it("shows 'Loading!' in h1", function() {
      const Component = createDynamicImport<{ n: number }, TestComponent>(
        () => new Promise<typeof TestComponent>(() => {})
      );

      const wrapper = mount(<Component n={1} />);

      expect(wrapper.find("h1")).toHaveLength(1);
      expect(wrapper.find("h1").text()).toEqual("Loading!");
    });
  });
});
