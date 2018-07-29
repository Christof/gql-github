import * as React from "react";
import { PersonalStats } from "../../src/components/personal_stats";
import { mount, ReactWrapper } from "enzyme";
import { waitImmediate } from "../helper";
import { Github, GithubData } from "../../src/github";
import { Section } from "../../src/components/section";
import { DetailedRepositorySelector } from "../../src/components/detailed_repository_selector";
import { LinearProgress } from "material-ui";
import { OverallPlot } from "../../src/components/overall_plot";
import { OverTimePlot } from "../../src/components/over_time_plot";

jest.mock("../../src/github");

describe("PersonalStats", function() {
  let github: Github;
  let wrapper: ReactWrapper<any, any>;

  beforeEach(function() {
    github = new Github("token", {} as any, undefined);
    (github.getOwners as jest.Mock).mockReturnValue(Promise.resolve(["user"]));
    (github.copyFor as jest.Mock).mockReturnValue(github);
    (github.getRepositoryNames as jest.Mock).mockReturnValue(
      Promise.resolve(["repo1", "repo2"])
    );
    (github.getUser as jest.Mock).mockReturnValue(
      Promise.resolve({ login: "user" })
    );

    wrapper = mount(<PersonalStats github={github} />);
  });

  it("shows a DetailedRepositorySelector", async function() {
    expect(wrapper.find(DetailedRepositorySelector)).toHaveLength(1);
  });

  describe("repository selection", function() {
    let repositoriesByOwner: Map<string, string[]>;

    beforeEach(async function() {
      const repositorySelector = wrapper.find(DetailedRepositorySelector);

      (github.copyFor as jest.Mock).mockReturnValue(github);
      (github.getStats as jest.Mock).mockReturnValueOnce(new Promise(() => {}));

      repositoriesByOwner = new Map<string, string[]>();
      repositoriesByOwner.set("user", ["repo1", "repo2"]);
      repositoriesByOwner.set("org", ["repo3", "repo4"]);

      (repositorySelector.prop("onChange") as any)(repositoriesByOwner);

      await waitImmediate();
      wrapper.update();
    });

    it("shows a heading and progress bar", async function() {
      const heading = wrapper.find(Section);

      expect(heading).toHaveLength(2);
      expect(heading.at(1).prop("heading")).toEqual("Stats");

      expect(wrapper.find(LinearProgress)).toHaveLength(1);
    });
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
      const repositorySelector = wrapper.find(DetailedRepositorySelector);

      (github.copyFor as jest.Mock).mockReturnValue(github);
      (github.getStats as jest.Mock).mockReturnValueOnce(data);
      (github.getStats as jest.Mock).mockReturnValueOnce(undefined);
      (github.getStats as jest.Mock).mockReturnValueOnce([data[1]]);
      (github.getStats as jest.Mock).mockReturnValueOnce([data[0]]);

      const repositoriesByOwner = new Map<string, string[]>();
      repositoriesByOwner.set("user", ["repo1", "repo2"]);
      repositoriesByOwner.set("org", ["repo3", "repo4"]);

      (repositorySelector.prop("onChange") as any)(repositoriesByOwner);

      await waitImmediate();
      wrapper.update();
    });

    it("renders OverTimePlot", async function() {
      const overTimePlot = wrapper.find(OverTimePlot);

      expect(overTimePlot).toHaveLength(1);
      expect(overTimePlot.prop("title")).toEqual("Commits in Repositories");
      const plotData = overTimePlot.prop("data") as any;
      expect(plotData).toHaveLength(4);
      expect(plotData[0].name).toEqual("repo1");
      expect(plotData[0].y).toEqual([10, 20, 30]);

      expect(plotData[1].name).toEqual("repo4");
      expect(plotData[1].y).toEqual([10, 20, 30]);

      expect(plotData[2].name).toEqual("Sum");
      expect(plotData[2].y).toEqual([20, 40, 60]);

      expect(plotData[3].name).toEqual("Trend");
      expect(plotData[3].y).toEqual([40, 40, 40]);

      for (let index = 0; index < 4; ++index) {
        expect(plotData[index].x).toEqual([week1, week2, week3]);
        expect(plotData[index].type).toEqual("scatter");
        expect(plotData[index].mode).toEqual("lines");
      }
    });

    it("renders OverallPlot with sums", async function() {
      const overallPlot = wrapper.find(OverallPlot);

      expect(overallPlot).toHaveLength(1);
      expect(overallPlot.prop("repositoryNames")).toEqual(["repo1", "repo4"]);

      const reposData = overallPlot.prop("reposData");
      expect(reposData).toHaveLength(2);
      expect(reposData[0]).toEqual([data[0]]);
      expect(reposData[1]).toEqual([data[0]]);
    });
  });
});
