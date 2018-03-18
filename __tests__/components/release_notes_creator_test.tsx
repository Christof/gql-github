import * as React from "react";
import { ReleaseNotesCreator } from "../../src/components/release_notes_creator";
import { shallow, ShallowWrapper } from "enzyme";
import { waitImmediate } from "../helper";
import { Github } from "../../src/github";

jest.mock("../../src/github");

describe("ReleaseNotesCreator", function() {
  let github: Github;
  let wrapper: ShallowWrapper<any, any>;

  beforeEach(function() {
    github = new Github("token", {} as any);
    wrapper = shallow(<ReleaseNotesCreator github={github} />);
  });

  describe("before selecting a repository", function() {
    it("shows a RepositorySelector", function() {
      expect(wrapper.find("RepositorySelector")).toHaveLength(1);
    });

    it("shows three empty sections", function() {
      const wrapper = shallow(<ReleaseNotesCreator github={github} />);

      expect(wrapper.find("section")).toHaveLength(3);
    });
  });

  describe("after selecting a repository", function() {
    const tags = [{ name: "v0.0.1" }, { name: "v0.0.2" }];

    beforeEach(async function() {
      (github.getTags as jest.Mock).mockReturnValue(tags);
      (wrapper
        .find("RepositorySelector")
        .prop("onRepositorySelect") as any)("repo1");

      await waitImmediate();
      wrapper.update();
    });

    it("shows the range section", function() {
      expect(wrapper.find("WithStyles(Typography)")).toHaveLength(1);
      expect(wrapper.find("WithStyles(Typography)").prop("children")).toEqual(
        "Range"
      );

      const dropdowns = wrapper.find("Dropdown");
      expect(dropdowns).toHaveLength(2);
      const tagNames = [tags[0].name, tags[1].name];

      expect(dropdowns.at(0).prop("options")).toEqual(tagNames);
      expect(dropdowns.at(1).prop("options")).toEqual(tagNames);
    });
  });
});
