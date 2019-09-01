import * as React from "react";
import { ReactWrapper, mount } from "enzyme";
import { Github } from "../../src/github";
import { RepositorySelector } from "../../src/components/repository_selector";
import { Rebaser } from "../../src/components/rebaser";

describe("Rebaser", function() {
  let wrapper: ReactWrapper<any, any>;
  let github: Github;

  beforeEach(function() {
    const fetch = undefined as any;
    github = new Github("token", {} as any, fetch);
    wrapper = mount(<Rebaser github={github} />);
  });

  describe("before selecting a repository", function() {
    it("shows a RepositorySelector", function() {
      expect(wrapper.find(RepositorySelector)).toHaveLength(1);
    });
  });
});
