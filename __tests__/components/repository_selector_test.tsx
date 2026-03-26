import * as React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { RepositorySelector } from "../../src/components/repository_selector";

jest.mock("../../src/components/owner_dropdown", () => ({
  OwnerDropdown: ({ onSelect }: any) => (
    <button
      data-testid="owner-select"
      onClick={() => onSelect("selectedOwner")}
    >
      Select Owner
    </button>
  )
}));

jest.mock("../../src/components/dropdown", () => ({
  Dropdown: ({ options, onSelect }: any) => (
    <div data-testid="repo-dropdown">
      {(options || []).map((opt: string) => (
        <button
          key={opt}
          data-testid={`repo-option-${opt}`}
          onClick={() => onSelect(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}));

describe("RepositorySelector", function () {
  it("calls onRepositorySelect after owner and repo selection", async function () {
    const github = {
      owner: "defaultOwner",
      getRepositoryNames: jest.fn().mockResolvedValue(["repo1", "repo2", "repo3"])
    } as any;

    let selectedRepository: string;

    render(
      <RepositorySelector
        github={github}
        onRepositorySelect={repo => (selectedRepository = repo)}
      />
    );

    fireEvent.click(screen.getByTestId("owner-select"));

    expect(github.owner).toEqual("selectedOwner");

    await waitFor(() => screen.getByTestId("repo-option-repo2"));

    fireEvent.click(screen.getByTestId("repo-option-repo2"));

    expect(selectedRepository).toEqual("repo2");
  });
});
