import * as React from "react";
import { createDynamicImport } from "../../src/components/dynamic_import";
import { shallow } from "enzyme";

class TestComponent extends React.Component<{ n: number }> {
  render() {
    return <div />;
  }
}

describe("createDynamicImport", function() {
  describe("before resolved", function() {
    it("shows 'Loading!' in h1", function() {
      const Component = createDynamicImport<{ n: number }, TestComponent>(
        () => new Promise<typeof TestComponent>(() => {})
      );

      const wrapper = shallow(<Component n={1} />);

      const dynamicImport = wrapper.find("DynamicImport");
      expect(dynamicImport).toHaveLength(1);
      const childrenFunction: any = dynamicImport.prop("children");
      expect(childrenFunction).toBeDefined();
      expect(typeof childrenFunction).toBe(typeof Function);
      expect(childrenFunction()).toEqual(<h1>Loading!</h1>);
    });
  });
});
