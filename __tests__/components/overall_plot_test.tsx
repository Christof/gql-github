import * as React from "react";
import { OverallPlot } from "../../src/components/overall_plot";
import { shallow, ShallowWrapper } from "enzyme";
import { waitImmediate } from "../helper";
import { Github } from "../../src/github";

describe("OverallPlot", function() {
  it("shows a PlotlyChart", function() {
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

    const wrapper = shallow(
      <OverallPlot reposData={reposData} repositoryNames={repoNames} />
    );

    expect(wrapper.find("PlotlyChart")).toHaveLength(1);
  });
});
