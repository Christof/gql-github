import * as React from "react";
import { Stats } from "../../src/components/stats";
import { shallow, ShallowWrapper } from "enzyme";
import { waitImmediate } from "../helper";
import { Github, GithubData } from "../../src/github";

jest.mock("../../src/github");

describe("Stats", function() {
  let github: Github;

  beforeEach(function() {
    github = new Github("token", {} as any);
  });

  describe("repository selection", function() {
    it("shows a RepositoriesByOwnerSelector", function() {
      const wrapper = shallow(<Stats github={github} />);

      expect(wrapper.find("RepositoriesByOwnerSelector")).toHaveLength(1);
    });
  });
});
