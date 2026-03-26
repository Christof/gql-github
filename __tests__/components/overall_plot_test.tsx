import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { OverallPlot } from "../../src/components/overall_plot";
import { GithubAuthorData } from "../../src/github";
import { waitImmediate } from "../helper";

jest.mock("react-plotly.js", () => ({
  __esModule: true,
  default: ({ layout, data }: any) => (
    <div
      data-testid="plotly-chart"
      data-layout={JSON.stringify(layout)}
      data-chart={JSON.stringify(data)}
    />
  )
}));

describe("OverallPlot", function () {
  const repoNames = ["repo1", "repo2"];
  const reposData: GithubAuthorData[][] = [
    [
      { author: { login: "author1" }, total: 1000, weeks: [] },
      { author: { login: "author2" }, total: 2000, weeks: [] }
    ],
    [
      { author: { login: "author2" }, total: 3000, weeks: [] },
      { author: { login: "author3" }, total: 4000, weeks: [] }
    ],
    undefined
  ];

  it("shows a PlotlyChart with Overall title", function () {
    render(<OverallPlot reposData={reposData} repositoryNames={repoNames} />);

    const chart = screen.getByTestId("plotly-chart");
    const layout = JSON.parse(chart.getAttribute("data-layout")!);
    expect(layout.title.text).toEqual("Overall");
    expect(layout.barmode).toEqual("stack");
  });

  it("shows one trace per author with commits per repository", function () {
    render(<OverallPlot reposData={reposData} repositoryNames={repoNames} />);

    const chart = screen.getByTestId("plotly-chart");
    const data = JSON.parse(chart.getAttribute("data-chart")!);
    expect(data).toHaveLength(3);

    expect(data[0].name).toEqual("author1");
    expect(data[0].x).toEqual([1000, 0, 0]);
    expect(data[0].y).toEqual(repoNames);

    expect(data[1].name).toEqual("author2");
    expect(data[1].x).toEqual([2000, 3000, 0]);
    expect(data[1].y).toEqual(repoNames);

    expect(data[2].name).toEqual("author3");
    expect(data[2].x).toEqual([0, 4000, 0]);
    expect(data[2].y).toEqual(repoNames);
  });

  describe("componentDidUpdate", function () {
    it("does nothing if repository names don't change", function () {
      const { rerender } = render(
        <OverallPlot reposData={reposData} repositoryNames={repoNames} />
      );

      rerender(
        <OverallPlot reposData={reposData} repositoryNames={repoNames} />
      );

      expect(screen.getByTestId("plotly-chart")).toBeInTheDocument();
    });

    it("updates the plot for new data", async function () {
      const { rerender } = render(
        <OverallPlot reposData={reposData} repositoryNames={repoNames} />
      );

      const repositoryNames = [...repoNames, "newRepo"];
      const newData = [
        ...reposData,
        [
          {
            author: { login: "author4" },
            total: 5000,
            weeks: []
          }
        ]
      ];

      rerender(
        <OverallPlot
          reposData={newData as any}
          repositoryNames={repositoryNames}
        />
      );

      await waitImmediate();
      await waitImmediate();

      await waitFor(() => {
        const chart = screen.getByTestId("plotly-chart");
        const data = JSON.parse(chart.getAttribute("data-chart")!);
        expect(data).toHaveLength(4);

        expect(data[0].name).toEqual("author1");
        expect(data[0].x).toEqual([1000, 0, 0, 0]);
        expect(data[0].y).toEqual(repositoryNames);

        expect(data[1].name).toEqual("author2");
        expect(data[1].x).toEqual([2000, 3000, 0, 0]);

        expect(data[2].name).toEqual("author3");
        expect(data[2].x).toEqual([0, 4000, 0, 0]);

        expect(data[3].name).toEqual("author4");
        expect(data[3].x).toEqual([0, 0, 0, 5000]);
        expect(data[3].y).toEqual(repositoryNames);
      });
    });
  });
});
