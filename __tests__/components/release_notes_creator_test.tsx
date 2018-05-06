import * as React from "react";
import {
  ReleaseNotesCreator,
  TransitionLeft
} from "../../src/components/release_notes_creator";
import { shallow, ShallowWrapper } from "enzyme";
import { waitImmediate } from "../helper";
import { Github } from "../../src/github";
import { PullRequest, ChangeCategory } from "../../src/pull_request";

jest.mock("../../src/github");

describe("ReleaseNotesCreator", function() {
  let github: Github;
  let wrapper: ShallowWrapper<any, any>;

  beforeEach(function() {
    const fetch = undefined;
    github = new Github("token", {} as any, fetch);
    wrapper = shallow(<ReleaseNotesCreator github={github} />);
  });

  describe("before selecting a repository", function() {
    it("shows a RepositorySelector", function() {
      expect(wrapper.find("RepositorySelector")).toHaveLength(1);
    });

    it("shows three empty sections", function() {
      const wrapper = shallow(<ReleaseNotesCreator github={github} />);

      expect(wrapper.find("section")).toHaveLength(3);
    });
  });

  describe("after selecting a repository", function() {
    const tags = [{ name: "v0.0.1" }, { name: "v0.0.2" }];

    beforeEach(async function() {
      (github.getTags as jest.Mock).mockReturnValue(tags);
      (wrapper.find("RepositorySelector").prop("onRepositorySelect") as any)(
        "repo1"
      );

      await waitImmediate();
      wrapper.update();
    });

    it("shows the range section", function() {
      expect(wrapper.find("WithStyles(Typography)")).toHaveLength(1);
      expect(wrapper.find("WithStyles(Typography)").prop("children")).toEqual(
        "Range"
      );

      const dropdowns = wrapper.find("Dropdown");
      expect(dropdowns).toHaveLength(2);
      const tagNames = [tags[0].name, tags[1].name];

      expect(dropdowns.at(0).prop("options")).toEqual(tagNames);
      expect(dropdowns.at(1).prop("options")).toEqual(tagNames);
    });

    describe("after selecting a range", function() {
      const commits = [
        {
          author: { login: "author1" },
          commit: { message: "commit message 1" }
        },
        {
          author: { login: "author1" },
          commit: {
            message:
              "Merge pull request #8 from Christof/build\n\nUpdate webpack."
          }
        }
      ];

      beforeEach(async function() {
        const dropdowns = wrapper.find("Dropdown");
        (dropdowns.at(0).prop("onSelect") as any)("v0.0.1");
        (dropdowns.at(1).prop("onSelect") as any)("v0.0.2");

        (github.compare as jest.Mock).mockReturnValue({ commits });
        (wrapper.find("WithStyles(Button)").prop("onClick") as any)();

        await waitImmediate();
        wrapper.update();
      });

      it("calls github.compare with repository, start and end tag", function() {
        expect(github.compare).toHaveBeenCalledWith(
          "repo1",
          "v0.0.1",
          "v0.0.2"
        );
      });

      it("shows the Adjust Categories section", function() {
        expect(wrapper.find("WithStyles(Typography)")).toHaveLength(3);
        expect(
          wrapper
            .find("WithStyles(Typography)")
            .at(1)
            .prop("children")
        ).toEqual("Adjust Categories");

        const selector = wrapper.find("PullRequestChangeCategorySelector");
        expect(selector).toHaveLength(1);
      });

      it("shows the release note section", function() {
        expect(
          wrapper
            .find("WithStyles(Typography)")
            .at(2)
            .prop("children")
        ).toEqual("Release Note");
      });

      it("shows the release note as markdown", function() {
        const markdown = wrapper.find("Markdown");
        expect(markdown).toHaveLength(1);
        expect(markdown.prop("source")).toEqual(
          "**Basic Changes:**\n\n- Update webpack. (#8)\n\n"
        );
      });

      it("adapts release notes on category changes", async function() {
        const selector = wrapper.find("PullRequestChangeCategorySelector");
        const pullRequest = selector.prop("pullRequest") as PullRequest;
        pullRequest.changeCategory = ChangeCategory.Breaking;
        (selector.prop("onChange") as any)(pullRequest);

        await waitImmediate();
        wrapper.update();

        const markdown = wrapper.find("Markdown");
        expect(markdown.prop("source")).toEqual(
          "**Breaking Changes:**\n\n- Update webpack. (#8)\n\n"
        );
      });

      it("posts the release note on github on pressing a button", function() {
        (github.postRelease as jest.Mock).mockReturnValue({ ok: true });
        const buttons = wrapper.find("WithStyles(Button)");

        expect(buttons).toHaveLength(2);
        const releaseButton = buttons.at(1);
        expect(releaseButton.prop("children")).toEqual("Create Release");

        (releaseButton.prop("onClick") as any)();
        expect(github.postRelease).toHaveBeenCalledWith("repo1", {
          tag_name: "v0.0.2",
          target_commitish: "master",
          name: "v0.0.2",
          body: "**Basic Changes:**\n\n- Update webpack. (#8)\n\n",
          draft: false,
          prerelease: false
        });
      });

      it("opens a snackbar after a successful release creation", async function() {
        (github.postRelease as jest.Mock).mockReturnValue({ ok: true });

        const buttons = wrapper.find("WithStyles(Button)");
        (buttons.at(1).prop("onClick") as any)();

        await waitImmediate();
        wrapper.update();

        const snackbar = wrapper.find("WithStyles(Snackbar)");
        expect(snackbar).toHaveLength(1);
        expect(snackbar.prop("open")).toBe(true);

        (snackbar.prop("onClose") as any)();

        await waitImmediate();
        wrapper.update();

        expect(wrapper.find("WithStyles(Snackbar)").prop("open")).toBe(false);
      });

      it("doesn't open a snackbar after unsuccessful release creation", async function() {
        (github.postRelease as jest.Mock).mockReturnValue({ ok: false });

        const buttons = wrapper.find("WithStyles(Button)");
        (buttons.at(1).prop("onClick") as any)();

        await waitImmediate();
        wrapper.update();

        const snackbar = wrapper.find("WithStyles(Snackbar)");
        expect(snackbar).toHaveLength(1);
        expect(snackbar.prop("open")).toBe(false);
      });
    });
  });
});

describe("TransitionLeft", function() {
  it("is a Slide with direction left", function() {
    const props: any = {};
    const wrapper = shallow(<TransitionLeft {...props} />);

    expect(wrapper.find("WithTheme(Slide)")).toHaveLength(1);
    expect(wrapper.prop("direction")).toEqual("left");
  });
});
