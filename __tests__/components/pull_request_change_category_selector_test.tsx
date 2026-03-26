import * as React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { PullRequestChangeCategorySelector } from "../../src/components/pull_request_change_category_selector";
import { PullRequest, ChangeCategory } from "../../src/pull_request";

// Mock Dropdown to make selection straightforward
jest.mock("../../src/components/dropdown", () => ({
  Dropdown: ({ options, onSelect }: any) => (
    <select
      data-testid="category-dropdown"
      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
        onSelect(e.target.value)
      }
    >
      {(options || []).map((opt: string) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  )
}));

describe("PullRequestChangeCategorySelector", function () {
  const pullRequest = new PullRequest(
    "PR Description",
    "123",
    ChangeCategory.Breaking
  );

  it("renders PullRequest text", function () {
    render(
      <PullRequestChangeCategorySelector
        pullRequest={pullRequest}
        onChange={() => {}}
      />
    );
    expect(screen.getByText(pullRequest.toText())).toBeInTheDocument();
  });

  it("contains a Dropdown to change the ChangeCategory", async function () {
    let changedPullRequest: PullRequest;

    render(
      <PullRequestChangeCategorySelector
        pullRequest={pullRequest}
        onChange={pr => {
          changedPullRequest = pr;
        }}
      />
    );

    fireEvent.change(screen.getByTestId("category-dropdown"), {
      target: { value: "Training" }
    });

    expect(changedPullRequest).toBeDefined();
    expect(changedPullRequest.changeCategory).toEqual(ChangeCategory.Training);
  });
});
