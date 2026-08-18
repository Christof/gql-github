import * as React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  within
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { ReleaseNotesRetriever } from "../../src/components/release_notes_retriever";
import { Github } from "../../src/github";
import { waitImmediate } from "../helper";

jest.mock("../../src/github");

jest.mock("../../src/components/repository_selector", () => ({
  RepositorySelector: ({ onRepositorySelect }: any) => (
    <button
      data-testid="repo-selector"
      onClick={() => onRepositorySelect("myRepo")}
    >
      Select Repository
    </button>
  )
}));

describe("ReleaseNotesRetriever", function () {
  it("shows RepositorySelector initially", function () {
    const github = new Github("token", {} as any, undefined);
    (github.getOwnersWithAvatar as jest.Mock).mockReturnValue(
      Promise.resolve([{ login: "user", avatarUrl: "avatar" }])
    );
    github.getReleases = jest.fn(() => Promise.resolve([]));

    render(<ReleaseNotesRetriever github={github} />);

    expect(screen.getByTestId("repo-selector")).toBeInTheDocument();
  });

  it("shows releases dropdown after repository selection", async function () {
    const github = new Github("token", {} as any, undefined);
    (github.getOwnersWithAvatar as jest.Mock).mockReturnValue(
      Promise.resolve([{ login: "user", avatarUrl: "avatar" }])
    );
    github.getReleases = jest.fn(() =>
      Promise.resolve([
        { tagName: "v0.0.1", description: "description 1" },
        { tagName: "v0.0.2", description: "description 2" }
      ])
    );

    render(<ReleaseNotesRetriever github={github} />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("repo-selector"));
      await waitImmediate();
    });

    // Wait for the releases section with a Select to appear
    await waitFor(() => {
      expect(screen.getByText("Releases")).toBeInTheDocument();
    });
  });

  it("shows selected release note when a release is chosen", async function () {
    const github = new Github("token", {} as any, undefined);
    (github.getOwnersWithAvatar as jest.Mock).mockReturnValue(
      Promise.resolve([{ login: "user", avatarUrl: "avatar" }])
    );
    github.getReleases = jest.fn(() =>
      Promise.resolve([
        { tagName: "v0.0.1", description: "description 1" },
        { tagName: "v0.0.2", description: "description 2" }
      ])
    );

    render(<ReleaseNotesRetriever github={github} />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("repo-selector"));
      await waitImmediate();
    });

    // Wait for releases dropdown
    await waitFor(() => screen.getByText("Releases"));

    // Open the releases Select dropdown
    const selectButton = screen.getByRole("combobox");
    fireEvent.mouseDown(selectButton);

    const listbox = await screen.findByRole("listbox");
    fireEvent.click(within(listbox).getByText("v0.0.1"));

    await act(async () => {
      await waitImmediate();
    });

    // The release note should display the tag name heading
    await waitFor(() => {
      expect(screen.getByText("v0.0.1")).toBeInTheDocument();
    });
  });
});
