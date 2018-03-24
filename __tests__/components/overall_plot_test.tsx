import * as React from "react";
import { OverallPlot } from "../../src/components/overall_plot";
import { shallow, ShallowWrapper } from "enzyme";
import { waitImmediate } from "../helper";
import { Github } from "../../src/github";
import { Layout } from "plotly.js";

describe("OverallPlot", function() {
  let wrapper: ShallowWrapper<any, any>;
  beforeEach(function() {
    const reposData = [
      [
        {
          author: { login: "author1" },
          total: 1000,
          weeks: [
            { w: new Date(1969, 2, 1).getTime() / 1000, a: 0, d: 0, c: 10 },
            { w: new Date(1969, 2, 1).getTime() / 1000, a: 0, d: 0, c: 20 },
            { w: new Date(1970, 2, 1).getTime() / 1000, a: 0, d: 0, c: 30 }
          ]
        },
        {
          author: { login: "author2" },
          total: 1000,
          weeks: [
            { w: new Date(1970, 2, 1).getTime() / 1000, a: 0, d: 0, c: 30 }
          ]
        }
      ],
      [
        {
          author: { login: "author2" },
          total: 1000,
          weeks: [
            { w: new Date(1971, 2, 1).getTime() / 1000, a: 0, d: 0, c: 40 }
          ]
        },
        {
          author: { login: "author3" },
          total: 1000,
          weeks: [
            { w: new Date(1972, 2, 1).getTime() / 1000, a: 0, d: 0, c: 50 }
          ]
        }
      ]
    ];

    const repoNames = ["repo1", "repo2"];

    wrapper = shallow(
      <OverallPlot reposData={reposData} repositoryNames={repoNames} />
    );
  });

  it("shows a PlotlyChart", function() {
    const chart = wrapper.find("PlotlyChart");
    expect(chart).toHaveLength(1);

    const layout = chart.prop("layout") as Partial<Layout>;
    expect(layout.title).toEqual("Overall");
    expect((layout as any).barmode).toEqual("stack");
  });
});
