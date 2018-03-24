import * as React from "react";
import { OverallPlot } from "../../src/components/overall_plot";
import { shallow, ShallowWrapper } from "enzyme";
import { waitImmediate } from "../helper";
import { Github } from "../../src/github";
import { Layout } from "plotly.js";

describe("OverallPlot", function() {
  const repoNames = ["repo1", "repo2"];
  const reposData = [
    [
      {
        author: { login: "author1" },
        total: 1000,
        weeks: []
      },
      {
        author: { login: "author2" },
        total: 2000,
        weeks: []
      }
    ],
    [
      {
        author: { login: "author2" },
        total: 3000,
        weeks: []
      },
      {
        author: { login: "author3" },
        total: 4000,
        weeks: []
      }
    ]
  ];
  let wrapper: ShallowWrapper<any, any>;

  beforeEach(function() {
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

  it("shows one trace per author with commits per repository", function() {
    const chart = wrapper.find("PlotlyChart");

    const data = chart.prop("data") as any;
    expect(data).toHaveLength(3);

    expect(data[0].name).toEqual("author1");
    expect(data[0].x).toEqual([1000, 0]);
    expect(data[0].y).toEqual(repoNames);

    expect(data[1].name).toEqual("author2");
    expect(data[1].x).toEqual([2000, 3000]);
    expect(data[1].y).toEqual(repoNames);

    expect(data[2].name).toEqual("author3");
    expect(data[2].x).toEqual([0, 4000]);
    expect(data[2].y).toEqual(repoNames);
  });

  describe("componentDidUpdate", function() {
    it("does nothing if repository names don't change", function() {
      wrapper.setProps({ repositoryNames: repoNames });

      expect(wrapper.find("PlotlyChart")).toHaveLength(1);
    });

    it("updates the plot for new data", async function() {
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

      wrapper.setProps({
        repositoryNames,
        reposData: newData
      });

      await waitImmediate();
      wrapper = wrapper.update();
      await waitImmediate();

      const chart = wrapper.find("PlotlyChart");
      const data = chart.prop("data") as any;
      expect(data).toHaveLength(4);

      expect(data[0].name).toEqual("author1");
      expect(data[0].x).toEqual([1000, 0, 0]);
      expect(data[0].y).toEqual(repositoryNames);

      expect(data[1].name).toEqual("author2");
      expect(data[1].x).toEqual([2000, 3000, 0]);
      expect(data[1].y).toEqual(repositoryNames);

      expect(data[2].name).toEqual("author3");
      expect(data[2].x).toEqual([0, 4000, 0]);
      expect(data[2].y).toEqual(repositoryNames);

      expect(data[3].name).toEqual("author4");
      expect(data[3].x).toEqual([0, 0, 5000]);
      expect(data[3].y).toEqual(repositoryNames);
    });
  });
});
