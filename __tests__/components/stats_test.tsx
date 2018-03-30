import * as React from "react";
import { Stats } from "../../src/components/stats";
import { shallow, ShallowWrapper } from "enzyme";
import { waitImmediate } from "../helper";
import { Github, GithubData } from "../../src/github";

jest.mock("../../src/github");

describe("Stats", function() {
  let github: Github;
  let wrapper: ShallowWrapper<any, any>;

  beforeEach(function() {
    github = new Github("token", {} as any);
    wrapper = shallow(<Stats github={github} />);
  });

  it("shows a RepositoriesByOwnerSelector", function() {
    expect(wrapper.find("RepositoriesByOwnerSelector")).toHaveLength(1);
  });

  describe("repository selection", function() {
    let repositoriesByOwner: Map<string, string[]>;
    let resolveForGetRepositoryNames: Function;

    beforeEach(async function() {
      const repositorySelector = wrapper.find("RepositoriesByOwnerSelector");

      (github.getRepositoryNames as jest.Mock).mockReturnValue(
        new Promise(resolve => {
          resolveForGetRepositoryNames = resolve;
        })
      );

      (repositorySelector.prop(
        "onLoad"
      ) as any)({ owner: "owner", includeForks: true });

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
