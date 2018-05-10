import * as React from "react";
import { Stats } from "../../src/components/stats";
import { shallow, ShallowWrapper } from "enzyme";
import { waitImmediate } from "../helper";
import { Github, GithubData } from "../../src/github";
import { Section } from "../../src/components/section";
import { RepositoriesByOwnerSelector } from "../../src/components/repositories_by_owner_selector";
import { LinearProgress } from "material-ui";
import { OverallPlot } from "../../src/components/overall_plot";
import { OverTimePlot } from "../../src/components/over_time_plot";
import PlotlyChart from "react-plotlyjs-ts";

jest.mock("../../src/github");

describe("Stats", function() {
  let github: Github;
  let wrapper: ShallowWrapper<any, any>;

  beforeEach(function() {
    github = new Github("token", {} as any, undefined);
    wrapper = shallow(<Stats github={github} />);
  });

  it("shows a RepositoriesByOwnerSelector", function() {
    expect(wrapper.find(RepositoriesByOwnerSelector)).toHaveLength(1);
  });

  describe("repository selection", function() {
    const repositoryNames = ["repo1", "repo2"];
    let repositoriesByOwner: Map<string, string[]>;
    let resolveForGetStats: Function;

    beforeEach(async function() {
      const repositorySelector = wrapper.find(RepositoriesByOwnerSelector);

      (github.getRepositoryNames as jest.Mock).mockReturnValue(
        Promise.resolve(repositoryNames)
      );
      (github.getStatsForRepositories as jest.Mock).mockReturnValue(
        new Promise(resolve => {
          resolveForGetStats = resolve;
        })
      );

      (repositorySelector.prop("onLoad") as any)({
        owner: "owner",
        includeForks: true
      });

      await waitImmediate();
      wrapper.update();
    });

    it("shows a heading and progress bar", function() {
      const heading = wrapper.find(Section);

      expect(heading).toHaveLength(1);
      expect(heading.prop("heading")).toEqual("Stats");

      expect(wrapper.find(LinearProgress)).toHaveLength(1);
    });

    describe("after loading data", function() {
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

      beforeEach(async function() {
        resolveForGetStats([data, data]);

        await waitImmediate();
        wrapper.update();
      });

      it("shows an OverallPlot", function() {
        const overallPlot = wrapper.find(OverallPlot);

        expect(overallPlot).toHaveLength(1);
        expect(overallPlot.prop("repositoryNames")).toEqual(repositoryNames);
        expect(overallPlot.prop("reposData")).toEqual([data, data]);
      });

      function checkDataForOverTimePlot(data: any) {
        expect(data).toHaveLength(2);
        expect(data[0].name).toEqual("user");
        expect(data[0].mode).toEqual("lines");
        expect(data[0].x).toEqual([week1, week2, week3]);
        expect(data[0].y).toEqual([10, 20, 30]);

        expect(data[1].name).toEqual("user2");
        expect(data[1].mode).toEqual("lines");
        expect(data[1].x).toEqual([week2]);
        expect(data[1].y).toEqual([30]);
      }

      it("shows OverTimePlots for each repository", function() {
        const overTimePlot = wrapper.find(OverTimePlot);

        expect(overTimePlot).toHaveLength(2);
        expect(overTimePlot.at(0).prop("title")).toEqual("repo1");

        const data0 = overTimePlot.at(0).prop("data") as any;
        checkDataForOverTimePlot(data0);

        expect(overTimePlot.at(1).prop("title")).toEqual("repo2");

        const data1 = overTimePlot.at(1).prop("data") as any;
        checkDataForOverTimePlot(data1);
      });

      function checkDataForYearPlot(data: any) {
        expect(data).toHaveLength(2);
        expect(data[0].x).toEqual([
          "2014 (10)",
          "2015 (50)",
          "2016 (0)",
          "2017 (30)"
        ]);
        expect(data[0].y).toEqual([10, 20, 0, 30]);

        expect(data[1].x).toEqual([
          "2014 (10)",
          "2015 (50)",
          "2016 (0)",
          "2017 (30)"
        ]);
        expect(data[1].y).toEqual([0, 30, 0, 0]);
      }

      it("shows a year graph for each repository", function() {
        const yearPlot = wrapper.find(PlotlyChart);

        expect(yearPlot).toHaveLength(2);

        const data0 = yearPlot.at(0).prop("data") as any;
        checkDataForYearPlot(data0);
        const layout0 = yearPlot.at(0).prop("layout") as any;
        expect(layout0.title).toEqual("Yearly commits in repo1 90");
        expect(layout0.xaxis.title).toEqual("time");
        expect(layout0.yaxis.title).toEqual("commit count");

        const data1 = yearPlot.at(0).prop("data") as any;
        checkDataForYearPlot(data1);
        const layout1 = yearPlot.at(1).prop("layout") as any;
        expect(layout1.title).toEqual("Yearly commits in repo2 90");
        expect(layout1.xaxis.title).toEqual("time");
        expect(layout1.yaxis.title).toEqual("commit count");
      });
    });
  });
});
