import * as React from "react";
import { PersonalStats } from "../../src/components/personal_stats";
import { shallow, ShallowWrapper } from "enzyme";
import { waitImmediate } from "../helper";
import { Github, GithubData } from "../../src/github";

jest.mock("../../src/github");

describe("PersonalStats", function() {
  let github: Github;
  let wrapper: ShallowWrapper<any, any>;

  beforeEach(function() {
    github = new Github("token", {} as any);
    (github.getUser as jest.Mock).mockReturnValue(
      Promise.resolve({ login: "user" })
    );

    wrapper = shallow(<PersonalStats github={github} />);
  });

  it("shows a DetailedRepositorySelector", function() {
    expect(wrapper.find("DetailedRepositorySelector")).toHaveLength(1);
  });

  describe("repository selection", function() {
    let repositoriesByOwner: Map<string, string[]>;

    beforeEach(async function() {
      const repositorySelector = wrapper.find("DetailedRepositorySelector");

      (github.copyFor as jest.Mock).mockReturnValue(github);
      (github.getStats as jest.Mock).mockReturnValue(
        new Promise(resolve => {})
      );

      repositoriesByOwner = new Map<string, string[]>();
      repositoriesByOwner.set("user", ["repo1", "repo2"]);
      repositoriesByOwner.set("org", ["repo3"]);

      (repositorySelector.prop("onChange") as any)(repositoriesByOwner);

      await waitImmediate();
      wrapper.update();
    });

    it("shows a heading and progress bar", function() {
      const heading = wrapper.find("WithStyles(Typography)");

      expect(heading).toHaveLength(1);
      expect(heading.prop("children")).toEqual("Stats");

      expect(wrapper.find("WithStyles(LinearProgress)")).toHaveLength(1);
    });
  });
});
