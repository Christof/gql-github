import * as React from "react";
import { ReactWrapper, mount } from "enzyme";
import { Github } from "../../src/github";
import { RepositorySelector } from "../../src/components/repository_selector";
import { Rebaser, PullRequestSelector } from "../../src/components/rebaser";
import { waitImmediate } from "../helper";
import { Dropdown } from "../../src/components/dropdown";
import { Button, Typography, LinearProgress } from "@material-ui/core";
import { act } from "react-dom/test-utils";
import { rebasePullRequest } from "github-rebase";

jest.mock("../../src/github");
jest.mock("github-rebase");

describe("Rebaser", function () {
  let wrapper: ReactWrapper<any, any>;
  let github: Github;

  beforeEach(function () {
    const fetch = undefined as any;
    github = new Github("token", {} as any, fetch);
    (github.getRepositoryNames as jest.Mock).mockReturnValue(
      Promise.resolve(["repo1"])
    );
    (github.getOwnersWithAvatar as jest.Mock).mockReturnValue(
      Promise.resolve([{ login: "user", avatarUrl: "avatarUrl" }])
    );
    wrapper = mount(<Rebaser github={github} />);
  });

  describe("before selecting a repository", function () {
    it("shows a RepositorySelector", function () {
      expect(wrapper.find(RepositorySelector)).toHaveLength(1);
    });
  });

  describe("after selecting a repository", function () {
    beforeEach(async function () {
      (github.getOpenPullRequests as jest.Mock).mockReturnValue(
        Promise.resolve([
          {
            author: "username",
            createdAt: "2019-09-01T14:24:37Z",
            headRefName: "PR Name",
            number: 2,
            mergeable: "MERGEABLE"
          }
        ])
      );

      (
        wrapper.find(RepositorySelector).prop("onRepositorySelect") as any
      )("repo1");

      await waitImmediate();
      wrapper.update();
    });

    it("shows a PullRequestSelector", function () {
      expect(wrapper.find(PullRequestSelector)).toHaveLength(1);
    });

    it("shows the disabled Rebase button", function () {
      const button = wrapper.find(Button);
      expect(button).toHaveLength(1);
      expect(button.prop("disabled")).toBe(true);
    });

    describe("after a PullRequest has been selected", function () {
      beforeEach(async function () {
        act(() => {
          (wrapper.find(Dropdown).last().prop("onSelect") as any)("PR Name");
        });

        await waitImmediate();
        wrapper.update();
      });

      it("shows the Rebase button", function () {
        const button = wrapper.find(Button);
        expect(button).toHaveLength(1);
        expect(button.prop("disabled")).toBe(false);
      });

      describe("after clicking Rebase button", function () {
        let resolveRebase: Function;

        beforeEach(async function () {
          (rebasePullRequest as jest.Mock).mockResolvedValue(
            new Promise(resolve => {
              resolveRebase = resolve;
            })
          );

          const button = wrapper.find(Button);
          act(() => {
            button.prop("onClick")(undefined);
          });

          await waitImmediate();
          wrapper.update();
        });

        it("disables the Rebase button", function () {
          const button = wrapper.find(Button);
          expect(button.prop("disabled")).toBe(true);
        });

        it("cals the rebase function", function () {
          expect(rebasePullRequest).toHaveBeenCalled();
        });

        it("shows a text", function () {
          const typography = wrapper.find(Typography);
          expect(typography.last().prop("children")).toEqual(
            "Rebasing operation running..."
          );
        });

        it("shows a linear progress", function () {
          expect(wrapper.find(LinearProgress)).toHaveLength(1);
        });

        describe("after Rebase has finished", function () {
          beforeEach(function () {
            resolveRebase();
          });

          it("doesn't show a liner progress", function () {
            expect(wrapper.find(LinearProgress)).toHaveLength(1);
          });
        });
      });
    });
  });
});
