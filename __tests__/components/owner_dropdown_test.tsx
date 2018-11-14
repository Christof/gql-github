import * as React from "react";
import { OwnerDropdown, State } from "../../src/components/owner_dropdown";
import { shallow } from "enzyme";
import { waitImmediate } from "../helper";
import { Dropdown } from "../../src/components/dropdown";

describe("OwnerSelector", function() {
  it("calls onSelect owner selection", async function() {
    const owner = "owner2";

    const github = {
      getOwnersWithAvatar() {
        return Promise.resolve([
          { login: "owner1", avatarUrl: "icon1" },
          { login: owner, avatarUrl: "icon2" }
        ]);
      }
    } as any;

    let selectedOwner: string;

    const wrapper = shallow(
      <OwnerDropdown
        github={github}
        onSelect={owner => (selectedOwner = owner)}
      />
    );

    const dropdown = wrapper.find(Dropdown);
    dropdown.prop("onSelect")(owner as any);

    expect(selectedOwner).toEqual(owner);

    await waitImmediate();

    const state = wrapper.state() as State;
    expect(state.owners).toEqual(["owner1", owner]);
    expect(state.iconUrls).toEqual(["icon1", "icon2"]);
  });
});
