import * as React from "react";
import { Stats } from "../../src/components/stats";
import { shallow, ShallowWrapper } from "enzyme";
import { waitImmediate } from "../helper";
import { Github, GithubData } from "../../src/github";

jest.mock("../../src/github");

describe("Stats", function() {
  let github: Github;
  let wrapper: ShallowWrapper<any, any>;

  beforeEach(function() {
    github = new Github("token", {} as any);
    wrapper = shallow(<Stats github={github} />);
  });

  it("shows a RepositoriesByOwnerSelector", function() {
    expect(wrapper.find("RepositoriesByOwnerSelector")).toHaveLength(1);
  });

  describe("repository selection", function() {
    const repositoryNames = ["repo1", "repo2"];
    let repositoriesByOwner: Map<string, string[]>;
    let resolveForGetStats: Function;

    beforeEach(async function() {
      const repositorySelector = wrapper.find("RepositoriesByOwnerSelector");

      (github.getRepositoryNames as jest.Mock).mockReturnValue(
        Promise.resolve(repositoryNames)
      );
      (github.getStats as jest.Mock).mockReturnValue(
        new Promise(resolve => {
          resolveForGetStats = resolve;
        })
      );

      (repositorySelector.prop(
        "onLoad"
      ) as any)({ owner: "owner", includeForks: true });

      await waitImmediate();
      wrapper.update();
    });

    it("shows a heading and progress bar", function() {
      const heading = wrapper.find("WithStyles(Typography)");

      expect(heading).toHaveLength(1);
      expect(heading.prop("children")).toEqual("Stats");

      expect(wrapper.find("WithStyles(LinearProgress)")).toHaveLength(1);
    });

    describe("after loading data", function() {
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

      beforeEach(async function() {
        resolveForGetStats(data);

        await waitImmediate();
        wrapper.update();
      });

      it("shows an OverallPlot", function() {
        const overallPlot = wrapper.find("OverallPlot");

        expect(overallPlot).toHaveLength(1);
        expect(overallPlot.prop("repositoryNames")).toEqual(repositoryNames);
        expect(overallPlot.prop("reposData")).toEqual([data, data]);
      });

      function checkDataForCommitsOverTimePlot(data: any) {
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

      it("shows CommitsOverTimePlots for each repository", function() {
        const commitsOverTimePlot = wrapper.find("CommitsOverTimePlot");

        expect(commitsOverTimePlot).toHaveLength(2);
        expect(commitsOverTimePlot.at(0).prop("title")).toEqual("repo1");

        const data0 = commitsOverTimePlot.at(0).prop("data") as any;
        checkDataForCommitsOverTimePlot(data0);

        expect(commitsOverTimePlot.at(1).prop("title")).toEqual("repo2");

        const data1 = commitsOverTimePlot.at(1).prop("data") as any;
        checkDataForCommitsOverTimePlot(data1);
      });
    });
  });
});
