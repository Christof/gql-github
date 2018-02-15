import * as React from "react";
import { RepositorySelector } from "../../src/components/repository_selector";
import { shallow } from "enzyme";

describe("RepositorySelector", function() {
  it("calls onRepositorySelect after owner and repo selecion", function() {
    const github = {
      owner: "defaultOwner",
      getRepositoryNames() {
        return ["repo1", "repo2", "repo3"];
      }
    } as any;
    let selectedRepository: string;
    const wrapper = shallow(
      <RepositorySelector
        github={github}
        onRepositorySelect={repo => (selectedRepository = repo)}
      />
    );

    const owner = "selectedOwner";
    wrapper.find("OwnerDropdown").prop("onSelect")(owner as any);

    expect(github.owner).toEqual(owner);

    wrapper.find("Dropdown").prop("onSelect")("repo2" as any);

    expect(selectedRepository).toEqual("repo2");
  });
});
