import * as React from "react";
import { DetailedRepositorySelector } from "../../src/components/detailed_repository_selector";
import { shallow, mount } from "enzyme";
import { waitImmediate } from "../helper";
import { Github } from "../../src/github";

jest.mock("../../src/github");

describe("DetailedRepositorySelector", function() {
  describe("before data loaded", function() {
    it("shows a progress bar", function() {
      const github = new Github("token", {} as any);
      github.getOwners = jest.fn(() => new Promise(resolve => {}));

      const wrapper = shallow(
        <DetailedRepositorySelector github={github} onChange={() => {}} />
      );

      expect(wrapper.find("WithStyles(LinearProgress)")).toHaveLength(1);
    });
  });
});
