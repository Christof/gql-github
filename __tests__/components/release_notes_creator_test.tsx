import * as React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ReleaseNotesCreator } from "../../src/components/release_notes_creator";
import { Github, GithubTag } from "../../src/github";
import { waitImmediate } from "../helper";
import { setupMocksForCopy } from "./copy_to_clipboard_test";

jest.mock("../../src/github");

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

jest.mock("../../src/components/tag_range_selector", () => ({
  TagRangeSelector: ({ onSelect, defaultStartTag, tags }: any) => (
    <div data-testid="tag-range-selector">
      <button
        data-testid="select-range"
        data-start={defaultStartTag}
        onClick={() =>
          onSelect(
            defaultStartTag || (tags[0] && tags[0].name),
            tags[tags.length - 1] && tags[tags.length - 1].name
          )
        }
      >
        Get merged PRs in range
      </button>
    </div>
  )
}));

describe("ReleaseNotesCreator", function () {
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
    (github.loadTags as jest.Mock).mockReturnValue(
      Promise.resolve({
        tags: [],
        repo: "repo1",
        github
      })
    );
  });

  describe("before selecting a repository", function () {
    it("shows a RepositorySelector", function () {
      render(<ReleaseNotesCreator github={github} />);
      expect(screen.getByTestId("repo-selector")).toBeInTheDocument();
    });
  });

  describe("after selecting a repository with no tags", function () {
    beforeEach(async function () {
      (github.loadTags as jest.Mock).mockReturnValue(
        Promise.resolve({ tags: [], repo: "repo1", github })
      );

      render(<ReleaseNotesCreator github={github} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId("repo-selector"));
        await waitImmediate();
      });
    });

    it("shows error message about no existing tags", async function () {
      await waitFor(() => {
        expect(
          screen.getByText(/no existing tags/i)
        ).toBeInTheDocument();
      });
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

      render(<ReleaseNotesCreator github={github} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId("repo-selector"));
        await waitImmediate();
      });
    });

    it("shows a Get merged PRs button for single tag", async function () {
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /Get merged PRs/i })
        ).toBeInTheDocument();
      });
    });

    it("fetches commits when Get merged PRs button is clicked", async function () {
      (github.getCommits as jest.Mock).mockReturnValue([]);

      await waitFor(() => screen.getByRole("button", { name: /Get merged PRs/i }));

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /Get merged PRs/i }));
        await waitImmediate();
      });

      expect(github.getCommits).toHaveBeenCalledWith("repo1");
    });
  });

  describe("after selecting a repository with multiple tags", function () {
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

      render(<ReleaseNotesCreator github={github} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId("repo-selector"));
        await waitImmediate();
      });
    });

    it("shows the tag range selector", async function () {
      await waitFor(() => {
        expect(screen.getByTestId("tag-range-selector")).toBeInTheDocument();
      });
    });

    it("uses the lastMasterReleaseTag as default start", async function () {
      await waitFor(() => {
        const selector = screen.getByTestId("select-range");
        expect(selector).toHaveAttribute("data-start", "v0.0.2");
      });
    });

    describe("after selecting a range with PR merge commits", function () {
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
        (github.compare as jest.Mock).mockReturnValue({ commits });
        execCommandMock = setupMocksForCopy().execCommandMock;

        await waitFor(() => screen.getByTestId("select-range"));

        await act(async () => {
          fireEvent.click(screen.getByTestId("select-range"));
          await waitImmediate();
        });
      });

      it("shows the release note", async function () {
        await waitFor(() => {
          const elements = screen.getAllByText(/Update webpack/);
          expect(elements.length).toBeGreaterThan(0);
        });
      });

      it("calls github.compare with repository and tags", function () {
        expect(github.compare).toHaveBeenCalledWith(
          "repo1",
          "v0.0.2",
          "v0.0.3"
        );
      });

      it("shows the Adjust Categories section", async function () {
        await waitFor(() => {
          expect(screen.getByText("Adjust Categories")).toBeInTheDocument();
        });
      });

      it("shows no merged PRs warning when range has no merge commits", async function () {
        (github.compare as jest.Mock).mockReturnValue({ commits: [] });

        await act(async () => {
          fireEvent.click(screen.getByTestId("select-range"));
          await waitImmediate();
        });

        await waitFor(() => {
          expect(screen.getByText(/no merged PRs/i)).toBeInTheDocument();
        });
      });
    });
  });
});
