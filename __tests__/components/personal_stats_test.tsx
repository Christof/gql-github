import * as React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { PersonalStats } from "../../src/components/personal_stats";
import { Github, GithubData } from "../../src/github";
import { waitImmediate } from "../helper";

jest.mock("../../src/github");

jest.mock("../../src/components/detailed_repository_selector", () => ({
  DetailedRepositorySelector: ({ onChange }: any) => (
    <button
      data-testid="detailed-repo-selector"
      onClick={() => {
        const repos = new Map<string, string[]>();
        repos.set("user", ["repo1", "repo2"]);
        repos.set("org", ["repo3", "repo4"]);
        onChange(repos);
      }}
    >
      Select Repositories
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

jest.mock("../../src/components/overall_plot", () => ({
  OverallPlot: jest.fn(({ repositoryNames, reposData }: any) => (
    <div
      data-testid="overall-plot"
      data-repos={JSON.stringify(repositoryNames)}
      data-reposdata={JSON.stringify(reposData)}
    />
  ))
}));

describe("PersonalStats", function () {
  let github: Github;

  beforeEach(function () {
    github = new Github("token", {} as any, undefined);
    (github.getOwners as jest.Mock).mockReturnValue(Promise.resolve(["user"]));
    (github.copyFor as jest.Mock).mockReturnValue(github);
    (github.getRepositoryNames as jest.Mock).mockReturnValue(
      Promise.resolve(["repo1", "repo2"])
    );
    (github.getUser as jest.Mock).mockReturnValue(
      Promise.resolve({ login: "user" })
    );
  });

  it("shows a DetailedRepositorySelector", function () {
    render(<PersonalStats github={github} />);
    expect(screen.getByTestId("detailed-repo-selector")).toBeInTheDocument();
  });

  describe("repository selection - loading", function () {
    beforeEach(async function () {
      (github.getStats as jest.Mock).mockReturnValue(new Promise(() => {}));

      render(<PersonalStats github={github} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId("detailed-repo-selector"));
        await waitImmediate();
      });
    });

    it("shows a progress bar while loading", async function () {
      await waitFor(() => {
        expect(screen.getByRole("progressbar")).toBeInTheDocument();
      });
    });
  });

  describe("after loading data", function () {
    const week1 = new Date(1969, 2, 1);
    const week2 = new Date(1970, 2, 1);
    const week3 = new Date(1971, 2, 1);
    const data: GithubData = [
      {
        author: { login: "user" },
        total: 1000,
        weeks: [
          { w: week1.getTime() / 1000, a: 0, d: 0, c: 10 },
          { w: week2.getTime() / 1000, a: 0, d: 0, c: 20 },
          { w: week3.getTime() / 1000, a: 0, d: 0, c: 30 }
        ]
      },
      {
        author: { login: "user2" },
        total: 1000,
        weeks: [{ w: week2.getTime() / 1000, a: 0, d: 0, c: 30 }]
      }
    ];

    beforeEach(async function () {
      (github.getStats as jest.Mock)
        .mockReturnValueOnce(data)
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce([data[1]])
        .mockReturnValueOnce([data[0]]);

      render(<PersonalStats github={github} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId("detailed-repo-selector"));
        await waitImmediate();
      });
    });

    it("renders OverTimePlot for commits in repositories", async function () {
      await waitFor(() => {
        const plot = screen.getByTestId("over-time-plot");
        expect(plot).toBeInTheDocument();
        expect(plot.getAttribute("data-title")).toEqual(
          "Commits in Repositories"
        );
        const plotData = JSON.parse(plot.getAttribute("data-plotdata")!);
        expect(plotData).toHaveLength(4);
        expect(plotData[0].name).toEqual("repo1");
        expect(plotData[0].y).toEqual([10, 20, 30]);
        expect(plotData[2].name).toEqual("Sum");
        expect(plotData[3].name).toEqual("Trend");
      });
    });

    it("renders OverallPlot with repository names", async function () {
      await waitFor(() => {
        const overall = screen.getByTestId("overall-plot");
        expect(overall).toBeInTheDocument();
        const repos = JSON.parse(overall.getAttribute("data-repos")!);
        expect(repos).toEqual(["repo1", "repo4"]);
      });
    });
  });
});
