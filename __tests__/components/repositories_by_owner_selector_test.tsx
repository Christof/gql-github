import * as React from "react";
import {
  RepositoriesByOwnerSelector,
  LoadData
} from "../../src/components/repositories_by_owner_selector";
import { shallow, ShallowWrapper } from "enzyme";
import { Button, FormControlLabel } from "@material-ui/core";
import { OwnerDropdown } from "../../src/components/owner_dropdown";

describe("RepositoriesByOwnerSelector", function () {
  let setData: LoadData;
  let wrapper: ShallowWrapper<any, any>;

  beforeEach(function () {
    const github = {} as any;
    wrapper = shallow(
      <RepositoriesByOwnerSelector
        github={github}
        onLoad={data => (setData = data)}
      />
    );
  });

  function clickLoad() {
    wrapper.find(Button).prop("onClick")({} as any);
  }

  describe("button before selection", function () {
    it("is disabled", function () {
      expect(wrapper.find(Button).prop("disabled")).toBe(true);
    });
  });

  describe("click load after selecting owner and checking includeForks", function () {
    it("calls onLoad with selected owner and includeForks true", function () {
      const owner = "selectedOwner";

      wrapper.find(OwnerDropdown).prop("onSelect")(owner as any);
      const formControlLabel = wrapper.find(FormControlLabel);
      expect(formControlLabel).toHaveLength(1);
      const checkboxWrapper = shallow(formControlLabel.prop("control"));
      (checkboxWrapper.prop("onChange") as any)(undefined, true);

      clickLoad();

      expect(setData.includeForks).toBe(true);
      expect(setData.owner).toEqual(owner);
    });
  });
});
