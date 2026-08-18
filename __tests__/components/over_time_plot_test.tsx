import * as React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { OverTimePlot } from "../../src/components/over_time_plot";

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

describe("OverTimePlot", function () {
  it("renders plots with time as x axis", function () {
    const title = "my plot";
    const data = [
      {
        x: [new Date(1970, 0, 1), new Date(1970, 0, 2), new Date(1970, 0, 3)],
        y: [1, 2, 3]
      }
    ];
    render(<OverTimePlot title={title} data={data} />);

    const chart = screen.getByTestId("plotly-chart");
    const layout = JSON.parse(chart.getAttribute("data-layout")!);
    expect(layout.title.text).toEqual(title);
    expect(layout.xaxis.title).toEqual("time");
    expect(layout.yaxis.title).toEqual("commit count");

    const chartData = JSON.parse(chart.getAttribute("data-chart")!);
    expect(chartData).toHaveLength(1);
    expect(chartData[0].y).toEqual([1, 2, 3]);
  });

  it("renders plots with custom y axis title", function () {
    const title = "my plot";
    const data = [
      {
        x: [new Date(1970, 0, 1), new Date(1970, 0, 2)],
        y: [1, 2]
      }
    ];
    render(<OverTimePlot title={title} data={data} yaxisTitle="custom title" />);

    const chart = screen.getByTestId("plotly-chart");
    const layout = JSON.parse(chart.getAttribute("data-layout")!);
    expect(layout.title.text).toEqual(title);
    expect(layout.xaxis.title).toEqual("time");
    expect(layout.yaxis.title).toEqual("custom title");
  });
});
