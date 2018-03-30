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
      Promise.resolve({ login: "username" })
    );

    wrapper = shallow(<PersonalStats github={github} />);
  });

  it("shows a DetailedRepositorySelector", function() {
    expect(wrapper.find("DetailedRepositorySelector")).toHaveLength(1);
  });
});
