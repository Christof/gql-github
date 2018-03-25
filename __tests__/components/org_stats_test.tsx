import * as React from "react";
import { OrgStats } from "../../src/components/org_stats";
import { shallow, ShallowWrapper } from "enzyme";
import { waitImmediate } from "../helper";
import { Github } from "../../src/github";

jest.mock("../../src/github");

describe("OrgStats", function() {
  let github: Github;
  let wrapper: ShallowWrapper<any, any>;

  beforeEach(function() {
    github = new Github("token", {} as any);

    wrapper = shallow(<OrgStats github={github} />);
  });

  it("shows a RepositoryByOwnerSelector", function() {
    expect(wrapper.find("RepositoriesByOwnerSelector")).toHaveLength(1);
  });
});
