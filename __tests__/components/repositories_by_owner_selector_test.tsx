import * as React from "react";
import {
  RepositoriesByOwnerSelector,
  LoadData
} from "../../src/components/repositories_by_owner_selector";
import { shallow, ShallowWrapper } from "enzyme";

describe("RepositoriesByOwnerSelector", function() {
  let setData: LoadData;
  let wrapper: ShallowWrapper<any, any>;

  beforeEach(function() {
    const github = {} as any;
    wrapper = shallow(
      <RepositoriesByOwnerSelector
        github={github}
        onLoad={data => (setData = data)}
      />
    );
  });

  function clickLoad() {
    wrapper.find("WithStyles(Button)").prop("onClick")({} as any);
  }

  describe("click load with default values", function() {
    it("calls onLoad with undefined owner and includeForks is false", function() {
      clickLoad();

      expect(setData.includeForks).toBe(false);
      expect(setData.owner).toBeUndefined();
    });
  });

  describe("click load after selecting owner and checking includeForks", function() {
    it("calls onLoad with selected owner and includeForks true", function() {
      const owner = "selectedOwner";

      wrapper.find("OwnerDropdown").prop("onSelect")(owner as any);
      const checkboxWrapper = shallow(
        wrapper.find("WithStyles(FormControlLabel)").prop("control")
      );
      (checkboxWrapper.find("Checkbox").prop("onChange") as any)(
        undefined,
        true
      );

      clickLoad();

      expect(setData.includeForks).toBe(true);
      expect(setData.owner).toEqual(owner);
    });
  });
});
