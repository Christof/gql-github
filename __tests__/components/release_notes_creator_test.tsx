import * as React from "react";
import { ReleaseNotesCreator } from "../../src/components/release_notes_creator";
import { shallow } from "enzyme";
import { waitImmediate } from "../helper";
import { Github } from "../../src/github";

jest.mock("../../src/github");

describe("ReleaseNotesCreator", function() {
  let github: Github;

  beforeEach(function() {
    github = new Github("token", {} as any);
  });

  describe("before selecting a repository", function() {
    it("shows a RepositorySelector", function() {
      const wrapper = shallow(<ReleaseNotesCreator github={github} />);

      expect(wrapper.find("RepositorySelector")).toHaveLength(1);
    });

    it("shows three empty sections", function() {
      const wrapper = shallow(<ReleaseNotesCreator github={github} />);

      expect(wrapper.find("section")).toHaveLength(3);
    });
  });
});
