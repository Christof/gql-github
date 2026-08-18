import * as React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { OrgStats } from "../../src/components/org_stats";
import { Github, GithubData } from "../../src/github";
import { waitImmediate } from "../helper";

jest.mock("../../src/github");

jest.mock("../../src/components/repositories_by_owner_selector", () => ({
  RepositoriesByOwnerSelector: ({ onLoad }: any) => (
    <button
      data-testid="repo-selector"
      onClick={() => onLoad({ owner: "owner", includeForks: true })}
    >
      Load Repos
    </button>
  )
}));

jest.mock("../../src/components/over_time_plot", () => ({
  OverTimePlot: jest.fn(({ title, data }: any) => (
    <div
      data-testid="over-time-plot"
      data-title={title}
      data-plotdata={JSON.stringify(data)}
    />
  ))
}));

describe("OrgStats", function () {
  let github: Github;

  beforeEach(function () {
    github = new Github("token", {} as any, undefined);
    (github.getOwnersWithAvatar as jest.Mock).mockReturnValue(
      Promise.resolve([
        { login: "author1", avatarUrl: "author1Url" },
        { login: "org1", avatarUrl: "org1Url" }
      ])
    );
  });

  it("shows a RepositoryByOwnerSelector", function () {
    render(<OrgStats github={github} />);
    expect(screen.getByTestId("repo-selector")).toBeInTheDocument();
  });

  describe("after owner selection", function () {
    const week1 = new Date(1969, 2, 1);
    const week2 = new Date(1970, 2, 1);
    const data: GithubData = [
      {
        author: { login: "author1" },
        total: 1000,
        weeks: [
          { w: week1.getTime() / 1000, a: 0, d: 0, c: 10 },
          { w: week1.getTime() / 1000, a: 0, d: 0, c: 20 },
          { w: week2.getTime() / 1000, a: 0, d: 0, c: 30 }
        ]
      },
      {
        author: { login: "author2" },
        total: 1000,
        weeks: [{ w: week2.getTime() / 1000, a: 0, d: 0, c: 30 }]
      }
    ];
    const reviewData = [
      { author: "author1", createdAt: week1, reviews: [] },
      {
        author: "author2",
        createdAt: week1,
        reviews: [
          { author: "author3", createdAt: week2 },
          { author: "author1", createdAt: week2 }
        ]
      }
    ];

    beforeEach(async function () {
      (github.getRepositoryNames as jest.Mock).mockReturnValue([
        "repo1",
        "repo"
      ]);
      (github.getPullRequestsWithReviews as jest.Mock).mockReturnValue(
        reviewData
      );
      (github.getStatsForRepositories as jest.Mock).mockReturnValueOnce([
        data,
        undefined
      ]);

      render(<OrgStats github={github} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId("repo-selector"));
        await waitImmediate();
      });
    });

    it("shows an OverTimePlot for commits", async function () {
      await waitFor(() => {
        const plots = screen.getAllByTestId("over-time-plot");
        expect(plots.length).toBeGreaterThanOrEqual(1);
        const plotData = JSON.parse(plots[0].getAttribute("data-plotdata")!);
        expect(plotData).toHaveLength(4);

        expect(plotData[0].name).toEqual("author1");
        expect(plotData[0].x).toEqual([week1.toISOString(), week2.toISOString()]);
        expect(plotData[0].y).toEqual([30, 30]);

        expect(plotData[1].name).toEqual("author1 Avg");
        expect(plotData[2].name).toEqual("author2");
        expect(plotData[2].x).toEqual([week2.toISOString()]);
        expect(plotData[2].y).toEqual([30]);
      });
    });

    it("shows an OverTimePlot for PullRequests", async function () {
      await waitFor(() => {
        const plots = screen.getAllByTestId("over-time-plot");
        expect(plots.length).toBeGreaterThanOrEqual(2);
        const plotData = JSON.parse(plots[1].getAttribute("data-plotdata")!);
        expect(plotData).toHaveLength(2);

        expect(plotData[0].name).toEqual("author1 PRs (2)");
        expect(plotData[1].name).toEqual("author2 PRs (2)");
      });
    });

    it("shows an OverTimePlot for Reviews", async function () {
      await waitFor(() => {
        const plots = screen.getAllByTestId("over-time-plot");
        expect(plots.length).toBeGreaterThanOrEqual(3);
        const plotData = JSON.parse(plots[2].getAttribute("data-plotdata")!);
        expect(plotData).toHaveLength(2);

        expect(plotData[0].name).toEqual("author3 Reviews (2)");
        expect(plotData[1].name).toEqual("author1 Reviews (2)");
      });
    });
  });
});
