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

  describe("after data loaded", function() {
    it("shows checkboxes for all owners ", async function() {
      const github = new Github("token", {} as any);
      const owner1 = "owner1";
      const owner2 = "owner2";
      github.getOwners = jest.fn(() => Promise.resolve([owner1, owner2]));
      (github.copyFor as jest.Mock<Github>).mockReturnValue(github);
      (github.getRepositoryNames as jest.Mock<string[]>).mockReturnValueOnce([
        "repo1",
        "repo2"
      ]);
      (github.getRepositoryNames as jest.Mock<string[]>).mockReturnValueOnce([
        "repo3"
      ]);

      const wrapper = shallow(
        <DetailedRepositorySelector github={github} onChange={() => {}} />
      );

      await waitImmediate();
      wrapper.update();

      expect(wrapper.find("WithStyles(LinearProgress)")).toHaveLength(0);

      const labels = wrapper.find("WithStyles(FormControlLabel)");
      expect(labels).toHaveLength(2);
      expect(labels.at(0).prop("label")).toEqual(owner1);
      expect(labels.at(1).prop("label")).toEqual(owner2);
    });
  });
});
