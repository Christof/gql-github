import * as React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  DetailedRepositorySelector,
  RepositoriesPerOwner
} from "../../src/components/detailed_repository_selector";
import { Github } from "../../src/github";

jest.mock("../../src/github");

describe("DetailedRepositorySelector", function () {
  describe("before data loaded", function () {
    it("shows a progress bar", function () {
      const github = new Github("token", {} as any, undefined);
      github.getOwners = jest.fn(() => new Promise(_resolve => {}));

      render(<DetailedRepositorySelector github={github} onChange={() => {}} />);

      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });
  });

  describe("after data loaded", function () {
    let github: Github;
    const owner1 = "owner1";
    const owner2 = "owner2";
    let repositoriesPerOwner: RepositoriesPerOwner;

    beforeEach(async function () {
      github = new Github("token", {} as any, undefined);
      github.getOwners = jest.fn(() => Promise.resolve([owner1, owner2]));
      (github.copyFor as jest.Mock<Github>).mockReturnValue(github);
      github.getRepositoryNames = jest
        .fn()
        .mockReturnValueOnce(["repo1", "repo2"])
        .mockReturnValueOnce(["repo3"]);

      render(
        <DetailedRepositorySelector
          github={github}
          onChange={data => (repositoriesPerOwner = data)}
        />
      );

      await waitFor(() => screen.getByText(owner1));
    });

    it("hides the progress bar after loading", function () {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    it("shows checkboxes for all owners", function () {
      expect(
        screen.getByRole("checkbox", { name: owner1 })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("checkbox", { name: owner2 })
      ).toBeInTheDocument();
    });

    it("shows checkboxes for all repositories if owner is checked", async function () {
      fireEvent.click(screen.getByRole("checkbox", { name: owner1 }));

      await waitFor(() => {
        expect(
          screen.getByRole("checkbox", { name: "repo1" })
        ).toBeInTheDocument();
        expect(
          screen.getByRole("checkbox", { name: "repo2" })
        ).toBeInTheDocument();
      });
    });

    it("passes selected repositories per owner to callback on Accept click", async function () {
      fireEvent.click(screen.getByRole("checkbox", { name: owner1 }));

      await waitFor(() => screen.getByRole("checkbox", { name: "repo1" }));

      fireEvent.click(screen.getByRole("button", { name: /Accept/i }));

      const expected = new Map<string, string[]>();
      expected.set(owner1, ["repo1", "repo2"]);
      expect(repositoriesPerOwner).toEqual(expected);
    });

    it("allows deselecting repositories", async function () {
      fireEvent.click(screen.getByRole("checkbox", { name: owner1 }));

      await waitFor(() => screen.getByRole("checkbox", { name: "repo1" }));

      fireEvent.click(screen.getByRole("checkbox", { name: "repo1" }));

      fireEvent.click(screen.getByRole("button", { name: /Accept/i }));

      const expected = new Map<string, string[]>();
      expected.set(owner1, ["repo2"]);
      expect(repositoriesPerOwner).toEqual(expected);
    });

    it("allows deselecting and reselecting repositories", async function () {
      fireEvent.click(screen.getByRole("checkbox", { name: owner1 }));

      await waitFor(() => screen.getByRole("checkbox", { name: "repo2" }));

      const repo2Checkbox = screen.getByRole("checkbox", { name: "repo2" });
      fireEvent.click(repo2Checkbox); // deselect

      expect(repo2Checkbox).not.toBeChecked();

      fireEvent.click(repo2Checkbox); // reselect

      fireEvent.click(screen.getByRole("button", { name: /Accept/i }));

      const expected = new Map<string, string[]>();
      expected.set(owner1, ["repo1", "repo2"]);
      expect(repositoriesPerOwner).toEqual(expected);
    });
  });
});
