import * as React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Stats } from "../../src/components/stats";
import { Github, GithubData } from "../../src/github";
import { waitImmediate } from "../helper";

jest.mock("../../src/github");

// Mock child components
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

jest.mock("react-plotly.js", () => ({
  __esModule: true,
  default: jest.fn(({ data, layout }: any) => (
    <div
      data-testid="plotly-chart"
      data-layout={JSON.stringify(layout)}
      data-chart={JSON.stringify(data)}
    />
  ))
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

describe("Stats", function () {
  beforeAll(() => jest.setTimeout(10000));
  afterAll(() => jest.setTimeout(undefined));

  let github: Github;

  beforeEach(function () {
    github = new Github("token", {} as any, undefined);
    (github.getOwnersWithAvatar as jest.Mock).mockReturnValue(
      Promise.resolve([{ login: "user", avatarUrl: "user-url" }])
    );
  });

  it("shows a RepositoriesByOwnerSelector", function () {
    render(<Stats github={github} />);
    expect(screen.getByTestId("repo-selector")).toBeInTheDocument();
  });

  describe("repository selection", function () {
    const repositoryNames = ["repo1", "repo2"];
    let resolveForGetStats: Function;

    beforeEach(async function () {
      (github.getRepositoryNames as jest.Mock).mockReturnValue(
        Promise.resolve(repositoryNames)
      );
      (github.getStatsForRepositories as jest.Mock).mockReturnValue(
        new Promise(resolve => {
          resolveForGetStats = resolve;
        })
      );

      render(<Stats github={github} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId("repo-selector"));
        await waitImmediate();
      });
    });

    it("shows a progress bar", async function () {
      await waitFor(() => {
        expect(screen.getByRole("progressbar")).toBeInTheDocument();
      });
    });

    describe("after loading data", function () {
      const week1 = new Date(2014, 2, 1);
      const week2 = new Date(2015, 2, 1);
      const week3 = new Date(2017, 2, 1);
      const data: GithubData = [
        {
          author: { login: "user" },
          total: 60,
          weeks: [
            { w: week1.getTime() / 1000, a: 0, d: 0, c: 10 },
            { w: week2.getTime() / 1000, a: 0, d: 0, c: 20 },
            { w: week3.getTime() / 1000, a: 0, d: 0, c: 30 }
          ]
        },
        {
          author: { login: "user2" },
          total: 30,
          weeks: [{ w: week2.getTime() / 1000, a: 0, d: 0, c: 30 }]
        }
      ];

      beforeEach(async function () {
        await act(async () => {
          resolveForGetStats([data, data]);
          await waitImmediate();
        });
      });

      it("shows an OverallPlot", async function () {
        await waitFor(() => {
          const overall = screen.getByTestId("overall-plot");
          expect(overall).toBeInTheDocument();
          const repos = JSON.parse(overall.getAttribute("data-repos")!);
          expect(repos).toEqual(repositoryNames);
          const reposData = JSON.parse(overall.getAttribute("data-reposdata")!);
          expect(reposData).toHaveLength(2);
        });
      });

      it("shows OverTimePlots for each repository", async function () {
        await waitFor(() => {
          const plots = screen.getAllByTestId("over-time-plot");
          expect(plots).toHaveLength(2);
          expect(plots[0].getAttribute("data-title")).toEqual("repo1");
          expect(plots[1].getAttribute("data-title")).toEqual("repo2");
        });
      });

      it("shows OverTimePlots with correct author data", async function () {
        await waitFor(() => {
          const plots = screen.getAllByTestId("over-time-plot");
          const data0 = JSON.parse(plots[0].getAttribute("data-plotdata")!);
          expect(data0).toHaveLength(2);
          expect(data0[0].name).toEqual("user");
          expect(data0[0].mode).toEqual("lines");
          expect(data0[0].y).toEqual([10, 20, 30]);

          expect(data0[1].name).toEqual("user2");
          expect(data0[1].y).toEqual([30]);
        });
      });

      it("shows year graphs (PlotlyChart) for each repository", async function () {
        await waitFor(() => {
          const charts = screen.getAllByTestId("plotly-chart");
          expect(charts.length).toBeGreaterThanOrEqual(2);

          const yearChart = charts.find(c => {
            const layout = JSON.parse(c.getAttribute("data-layout")!);
            return layout && layout.title && layout.title.text && layout.title.text.includes("Yearly commits");
          });
          expect(yearChart).toBeTruthy();

          const layout = JSON.parse(yearChart!.getAttribute("data-layout")!);
          expect(layout.title.text).toContain("Yearly commits in repo1");
          expect(layout.xaxis.title).toEqual("time");
          expect(layout.yaxis.title).toEqual("commit count");
        });
      });
    });
  });
});
