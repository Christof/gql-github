import * as React from "react";
import {
  DetailedRepositorySelector,
  RepositoriesPerOwner
} from "../../src/components/detailed_repository_selector";
import { shallow, mount, ShallowWrapper } from "enzyme";
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
    let github: Github;
    const owner1 = "owner1";
    const owner2 = "owner2";
    let wrapper: ShallowWrapper<any, any>;
    let repositoresPerOwner: RepositoriesPerOwner;

    beforeEach(async function() {
      github = new Github("token", {} as any);
      github.getOwners = jest.fn(() => Promise.resolve([owner1, owner2]));
      (github.copyFor as jest.Mock<Github>).mockReturnValue(github);
      (github.getRepositoryNames as jest.Mock<string[]>).mockReturnValueOnce([
        "repo1",
        "repo2"
      ]);
      (github.getRepositoryNames as jest.Mock<string[]>).mockReturnValueOnce([
        "repo3"
      ]);

      wrapper = shallow(
        <DetailedRepositorySelector
          github={github}
          onChange={data => (repositoresPerOwner = data)}
        />
      );

      await waitImmediate();
      wrapper.update();
    });

    function checkOwner1() {
      const owner1CheckboxWrapper = shallow(
        wrapper
          .find("WithStyles(FormControlLabel)")
          .at(0)
          .prop("control")
      );

      const event = null;
      const checked = true;
      (owner1CheckboxWrapper.prop("onChange") as any)(event, checked);
    }

    it("shows checkboxes for all owners ", async function() {
      expect(wrapper.find("WithStyles(LinearProgress)")).toHaveLength(0);

      const labels = wrapper.find("WithStyles(FormControlLabel)");
      expect(labels).toHaveLength(2);
      expect(labels.at(0).prop("label")).toEqual(owner1);
      expect(labels.at(1).prop("label")).toEqual(owner2);
    });

    it("shows checkboxes for all repositories if owner is checked", async function() {
      expect(wrapper.find("WithStyles(LinearProgress)")).toHaveLength(0);

      checkOwner1();

      await waitImmediate();
      wrapper.update();

      const labels = wrapper.find("WithStyles(FormControlLabel)");
      expect(labels).toHaveLength(4);
    });

    it("passes selected repositories per owner to callback on button click", async function() {
      checkOwner1();

      await waitImmediate();
      wrapper.update();

      const acceptButton = wrapper.find("WithStyles(Button)");
      expect(acceptButton).toHaveLength(1);
      (acceptButton.prop("onClick") as any)();

      const expected = new Map<string, string[]>();
      expected.set(owner1, ["repo1", "repo2"]);
      expect(repositoresPerOwner).toEqual(expected);
    });

    it("allows deselecting repositories", async function() {
      checkOwner1();

      await waitImmediate();
      wrapper.update();

      const repo1FormControlLabel = wrapper
        .find("WithStyles(FormControlLabel)")
        .findWhere(f => f.prop("label") === "repo1");
      expect(repo1FormControlLabel).toHaveLength(1);
      const checkbox = shallow(repo1FormControlLabel.prop("control"));
      (checkbox.prop("onChange") as any)(null, false);

      const acceptButton = wrapper.find("WithStyles(Button)");
      expect(acceptButton).toHaveLength(1);
      (acceptButton.prop("onClick") as any)();

      const expected = new Map<string, string[]>();
      expected.set(owner1, ["repo2"]);
      expect(repositoresPerOwner).toEqual(expected);
    });
  });
});
