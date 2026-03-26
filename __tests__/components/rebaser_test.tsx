import * as React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Github } from "../../src/github";
import { Rebaser } from "../../src/components/rebaser";
import { waitImmediate } from "../helper";
import { rebasePullRequest } from "github-rebase";

jest.mock("../../src/github");
jest.mock("github-rebase");

jest.mock("../../src/components/repository_selector", () => ({
  RepositorySelector: ({ onRepositorySelect }: any) => (
    <button
      data-testid="repo-selector"
      onClick={() => onRepositorySelect("repo1")}
    >
      Select Repository
    </button>
  )
}));

jest.mock("../../src/components/dropdown", () => ({
  Dropdown: ({ onSelect, options }: any) => (
    <select
      data-testid="pr-dropdown"
      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
        onSelect(e.target.value)
      }
    >
      <option value="">-- select --</option>
      {(options || []).map((opt: string) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  )
}));

describe("Rebaser", function () {
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
  });

  describe("before selecting a repository", function () {
    it("shows a RepositorySelector", function () {
      render(<Rebaser github={github} />);
      expect(screen.getByTestId("repo-selector")).toBeInTheDocument();
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

      render(<Rebaser github={github} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId("repo-selector"));
        await waitImmediate();
      });
    });

    it("shows the PR dropdown", async function () {
      await waitFor(() => {
        expect(screen.getByTestId("pr-dropdown")).toBeInTheDocument();
      });
    });

    it("shows the disabled Rebase button", async function () {
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /Rebase/i })
        ).toBeDisabled();
      });
    });

    describe("after a PullRequest has been selected", function () {
      beforeEach(async function () {
        await waitFor(() => screen.getByTestId("pr-dropdown"));

        fireEvent.change(screen.getByTestId("pr-dropdown"), {
          target: { value: "PR Name" }
        });
        await waitImmediate();
      });

      it("shows the enabled Rebase button", function () {
        expect(
          screen.getByRole("button", { name: /Rebase/i })
        ).not.toBeDisabled();
      });

      describe("after clicking Rebase button", function () {
        let resolveRebase: Function;

        beforeEach(async function () {
          (rebasePullRequest as jest.Mock).mockReturnValue(
            new Promise(resolve => {
              resolveRebase = resolve;
            })
          );

          await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /Rebase/i }));
            await waitImmediate();
          });
        });

        it("disables the Rebase button", function () {
          expect(
            screen.getByRole("button", { name: /Rebase/i })
          ).toBeDisabled();
        });

        it("calls the rebase function", function () {
          expect(rebasePullRequest).toHaveBeenCalled();
        });

        it("shows a rebasing text", function () {
          expect(
            screen.getByText("Rebasing operation running...")
          ).toBeInTheDocument();
        });

        it("shows a linear progress", function () {
          expect(screen.getByRole("progressbar")).toBeInTheDocument();
        });

        describe("after Rebase has finished", function () {
          it("hides the linear progress", async function () {
            await act(async () => {
              resolveRebase();
              await waitImmediate();
            });

            await waitFor(() => {
              expect(
                screen.queryByRole("progressbar")
              ).not.toBeInTheDocument();
            });
          });
        });
      });
    });
  });
});
