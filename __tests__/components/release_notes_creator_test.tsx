import * as React from "react";
import { ReleaseNotesCreator } from "../../src/components/release_notes_creator";
import { mount, ReactWrapper } from "enzyme";
import { waitImmediate } from "../helper";
import { Github, GithubTag } from "../../src/github";
import { PullRequest, ChangeCategory } from "../../src/pull_request";
import { Section } from "../../src/components/section";
import { RepositorySelector } from "../../src/components/repository_selector";
import { Button, Snackbar, Typography } from "@material-ui/core";
import { Dropdown } from "../../src/components/dropdown";
import { PullRequestChangeCategorySelector } from "../../src/components/pull_request_change_category_selector";
import { Markdown } from "../../src/components/markdown";
import { setupMocksForCopy } from "./copy_to_clipboard_test";

jest.mock("../../src/github");

describe("ReleaseNotesCreator", function () {
  let github: Github;
  let wrapper: ReactWrapper<any, any>;

  beforeEach(function () {
    const fetch = undefined as any;
    github = new Github("token", {} as any, fetch);
    (github.getRepositoryNames as jest.Mock).mockReturnValue(
      Promise.resolve(["repo1"])
    );
    (github.getOwnersWithAvatar as jest.Mock).mockReturnValue(
      Promise.resolve([{ login: "user", avatarUrl: "avatarUrl" }])
    );
    (github.loadTags as jest.Mock).mockReturnValue(
      Promise.resolve({
        tags: [],
        repo: "repo1",
        github
      })
    );
    wrapper = mount(<ReleaseNotesCreator github={github} />);
  });

  describe("before selecting a repository", function () {
    it("shows a RepositorySelector", function () {
      expect(wrapper.find(RepositorySelector)).toHaveLength(1);
    });
  });

  describe("after selecting a repository with no tag", function () {
    const tags: GithubTag[] = [];

    beforeEach(async function () {
      (
        wrapper.find(RepositorySelector).prop("onRepositorySelect") as any
      )("repo1");
      (github.loadTags as jest.Mock).mockReturnValue(
        Promise.resolve({
          tags,
          repo: "repo1",
          github
        })
      );

      await waitImmediate();
      wrapper.update();
    });

    it("shows error message", async function () {
      (github.getCommits as jest.Mock).mockReturnValue([]);

      expect(wrapper.find(Section)).toHaveLength(2);
      expect(wrapper.find(Section).at(1).prop("heading")).toEqual("Range");

      const dropdowns = wrapper.find(Dropdown);
      expect(dropdowns).toHaveLength(2);

      expect(wrapper.find(Button)).toHaveLength(0);
      const typogryphies = wrapper.find(Typography);
      expect(typogryphies).toHaveLength(3);
      expect(typogryphies.at(2).prop("children")).toMatch(/no existing tags/);
    });
  });

  describe("after selecting a repository with one tag", function () {
    const tags = [{ name: "v0.0.1" }];

    beforeEach(async function () {
      (github.loadTags as jest.Mock).mockReturnValue(
        Promise.resolve({
          tags,
          repo: "repo1",
          github,
          lastMasterReleaseTag: tags[0]
        })
      );
      (
        wrapper.find(RepositorySelector).prop("onRepositorySelect") as any
      )("repo1");

      await waitImmediate();
      wrapper.update();
    });

    it("shows the last 100 commits before the first tag if only one exists", async function () {
      (github.getCommits as jest.Mock).mockReturnValue([]);

      expect(wrapper.find(Section)).toHaveLength(2);
      expect(wrapper.find(Section).at(1).prop("heading")).toEqual("Range");

      const dropdowns = wrapper.find(Dropdown);
      expect(dropdowns).toHaveLength(2);

      (github.compare as jest.Mock).mockReturnValue({ commits: [] });
      const button = wrapper.find(Button);
      expect(button).toHaveLength(1);
      (button.prop("onClick") as any)();

      await waitImmediate();
      wrapper.update();

      expect(github.getCommits).toHaveBeenCalledWith("repo1");
    });
  });

  describe("after selecting a repository", function () {
    const tags = [{ name: "v0.0.1" }, { name: "v0.0.2" }, { name: "v0.0.3" }];

    beforeEach(async function () {
      (github.loadTags as jest.Mock).mockReturnValue(
        Promise.resolve({
          tags,
          repo: "repo1",
          lastMasterReleaseTag: "v0.0.2",
          github
        })
      );

      (
        wrapper.find(RepositorySelector).prop("onRepositorySelect") as any
      )("repo1");

      await waitImmediate();
      wrapper.update();
    });

    it("shows disabled button as long as no tags are selected", function () {
      expect(wrapper.find(Button).prop("disabled")).toBe(true);
    });

    it("shows the range section with preselected start tag", async function () {
      expect(wrapper.find(Section)).toHaveLength(2);
      expect(wrapper.find(Section).at(1).prop("heading")).toEqual("Range");

      const dropdowns = wrapper.find(Dropdown);
      expect(dropdowns).toHaveLength(4);
      const tagNames = tags.map(tag => tag.name);

      expect(dropdowns.at(2).prop("options")).toEqual(tagNames);
      expect(dropdowns.at(3).prop("options")).toEqual(tagNames);

      expect(dropdowns.at(2).prop("initialSelection")).toEqual("v0.0.2");

      (github.compare as jest.Mock).mockReturnValue({ commits: [] });
      (wrapper.find(Button).prop("onClick") as any)();

      await waitImmediate();
      wrapper.update();

      expect(github.compare).toHaveBeenCalledWith("repo1", "v0.0.2", undefined);
    });

    it("doesn't preselected start tag if none can be found", async function () {
      (github.loadTags as jest.Mock).mockReturnValue(
        Promise.resolve({
          tags,
          repo: "repo1",
          lastMasterReleaseTag: undefined,
          github
        })
      );
      (wrapper.find(RepositorySelector).prop("onRepositorySelect") as any)(
        "repo1"
      );
      await waitImmediate();
      wrapper.update();

      const dropdowns = wrapper.find(Dropdown);
      expect(dropdowns.at(2).prop("initialSelection")).toBeUndefined();
    });

    describe("after selecting a range", function () {
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

      let execCommandMock: jest.Mock;

      beforeEach(async function () {
        const dropdowns = wrapper.find(Dropdown);
        (dropdowns.at(2).prop("onSelect") as any)("v0.0.1");
        (dropdowns.at(3).prop("onSelect") as any)("v0.0.2");

        (github.compare as jest.Mock).mockReturnValue({ commits });

        execCommandMock = setupMocksForCopy().execCommandMock;

        (wrapper.find(Button).prop("onClick") as any)();

        await waitImmediate();
        wrapper.update();
      });

      it("shows an enabled button", function () {
        expect(wrapper.find(Button).at(0).prop("disabled")).toBe(false);
      });

      it("calls github.compare with repository, start and end tag", function () {
        expect(github.compare).toHaveBeenCalledWith(
          "repo1",
          "v0.0.1",
          "v0.0.2"
        );
      });

      it("shows the Adjust Categories section", function () {
        const sections = wrapper.find(Section);
        expect(sections).toHaveLength(4);
        expect(sections.at(2).prop("heading")).toEqual("Adjust Categories");

        const selector = wrapper.find(PullRequestChangeCategorySelector);
        expect(selector).toHaveLength(1);
      });

      it("shows the release note section", function () {
        expect(wrapper.find(Section).at(3).prop("heading")).toEqual(
          "Release Note"
        );
      });

      it("shows the release note as markdown", function () {
        const markdown = wrapper.find(Markdown);
        expect(markdown).toHaveLength(1);
        expect(markdown.prop("source")).toEqual(
          "# v0.0.2\n\n**Basic Changes:**\n\n- Update webpack. (#8)\n\n"
        );
      });

      it("adapts release notes on category changes", async function () {
        const selector = wrapper.find(PullRequestChangeCategorySelector);
        const pullRequest = selector.prop("pullRequest") as PullRequest;
        pullRequest.changeCategory = ChangeCategory.Breaking;
        (selector.prop("onChange") as any)(pullRequest);

        await waitImmediate();
        wrapper.update();

        const markdown = wrapper.find(Markdown);
        expect(markdown.prop("source")).toEqual(
          "# v0.0.2\n\n**Breaking Changes:**\n\n- Update webpack. (#8)\n\n"
        );
      });

      it("posts the release note on github on pressing a button", function () {
        (github.postRelease as jest.Mock).mockReturnValue({ ok: true });
        const buttons = wrapper.find(Button);

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

      it("copies the release not to the clipboard on pressing a button", function () {
        (github.postRelease as jest.Mock).mockReturnValue({ ok: true });
        const buttons = wrapper.find(Button);

        expect(buttons).toHaveLength(2);
        const releaseButton = buttons.at(1);
        (releaseButton.prop("onClick") as any)();

        expect(execCommandMock).toHaveBeenCalledWith("Copy");
      });

      it("opens a snackbar after a successful release creation", async function () {
        (github.postRelease as jest.Mock).mockReturnValue({ ok: true });

        const buttons = wrapper.find(Button);
        (buttons.at(1).prop("onClick") as any)();

        await waitImmediate();
        wrapper.update();

        const snackbar = wrapper.find(Snackbar);
        expect(snackbar).toHaveLength(1);
        expect(snackbar.prop("open")).toBe(true);

        (snackbar.prop("onClose") as any)();

        await waitImmediate();
        wrapper.update();

        expect(wrapper.find(Snackbar).prop("open")).toBe(false);
      });

      it("doesn't open a snackbar after unsuccessful release creation", async function () {
        (github.postRelease as jest.Mock).mockReturnValue({ ok: false });

        const buttons = wrapper.find(Button);
        await expect(buttons.at(1).prop("onClick") as any);

        await waitImmediate();
        wrapper.update();

        const snackbar = wrapper.find(Snackbar);
        expect(snackbar).toHaveLength(1);
        expect(snackbar.prop("open")).toBe(false);
      });

      it("only shows range section after another repository seleciton", async function () {
        const tags = [{ name: "v0.0.1" }, { name: "v0.0.2" }];
        (github.loadTags as jest.Mock).mockReturnValue(
          Promise.resolve({
            tags,
            repo: "repo1",
            lastMasterReleaseTag: undefined,
            github
          })
        );
        (wrapper.find(RepositorySelector).prop("onRepositorySelect") as any)(
          "repo1"
        );

        await waitImmediate();
        wrapper.update();

        const dropdowns = wrapper.find(Dropdown);
        expect(dropdowns).toHaveLength(4);

        expect(dropdowns.at(2).prop("options")).toEqual(["v0.0.1", "v0.0.2"]);
        expect(dropdowns.at(3).prop("options")).toEqual(["v0.0.1", "v0.0.2"]);

        expect(dropdowns.at(2).prop("initialSelection")).toBeUndefined();
        const sectionHeadings = wrapper.find(Section);
        expect(sectionHeadings).toHaveLength(2);
        expect(sectionHeadings.at(1).prop("heading")).toEqual("Range");
      });
    });

    describe("after selecting a range which doesn't contain merge commits", function () {
      beforeEach(async function () {
        const dropdowns = wrapper.find(Dropdown);
        (dropdowns.at(2).prop("onSelect") as any)("v0.0.1");
        (dropdowns.at(3).prop("onSelect") as any)("v0.0.1");

        (github.compare as jest.Mock).mockReturnValue({ commits: [] });

        (wrapper.find(Button).prop("onClick") as any)();

        await waitImmediate();
        wrapper.update();
      });

      it("shows the Adjust Categories section with a warning message", function () {
        const sections = wrapper.find(Section);
        expect(sections).toHaveLength(3);
        expect(sections.at(2).prop("heading")).toEqual("Adjust Categories");

        const selector = wrapper.find(PullRequestChangeCategorySelector);
        expect(selector).toHaveLength(0);

        const typogryphies = wrapper.find(Typography);
        expect(typogryphies).toHaveLength(4);
        expect(typogryphies.at(3).prop("children")).toMatch(/no merged PRs/);
      });
    });
  });
});
