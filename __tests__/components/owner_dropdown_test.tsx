import * as React from "react";
import { OwnerDropdown } from "../../src/components/owner_dropdown";
import { shallow, ShallowWrapper } from "enzyme";

describe("OwnerSelector", function() {
  it("calls onSelect owner selection", function(done) {
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

    const dropdown = wrapper.find("Dropdown");
    dropdown.prop("onSelect")(owner as any);

    expect(selectedOwner).toEqual(owner);

    setTimeout(() => {
      expect(wrapper.state().owners).toEqual(["owner1", owner]);
      expect(wrapper.state().iconUrls).toEqual(["icon1", "icon2"]);
      done();
    }, 0);
  });
});
