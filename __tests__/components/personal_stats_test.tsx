import * as React from "react";
import { PersonalStats } from "../../src/components/personal_stats";
import { shallow, ShallowWrapper } from "enzyme";
import { waitImmediate } from "../helper";
import { Github, GithubData } from "../../src/github";

jest.mock("../../src/github");

describe("PersonalStats", function() {
  let github: Github;
  let wrapper: ShallowWrapper<any, any>;

  beforeEach(function() {
    github = new Github("token", {} as any);
    (github.getUser as jest.Mock).mockReturnValue(
      Promise.resolve({ login: "user" })
    );

    wrapper = shallow(<PersonalStats github={github} />);
  });

  it("shows a DetailedRepositorySelector", function() {
    expect(wrapper.find("DetailedRepositorySelector")).toHaveLength(1);
  });

  describe("repository selection", function() {
    let repositoriesByOwner: Map<string, string[]>;
    let resolveForGetStats: Function;

    beforeEach(async function() {
      const repositorySelector = wrapper.find("DetailedRepositorySelector");

      (github.copyFor as jest.Mock).mockReturnValue(github);
      (github.getStats as jest.Mock).mockReturnValue(
        new Promise(resolve => {
          resolveForGetStats = resolve;
        })
      );

      repositoriesByOwner = new Map<string, string[]>();
      repositoriesByOwner.set("user", ["repo1", "repo2"]);
      repositoriesByOwner.set("org", ["repo3"]);

      (repositorySelector.prop("onChange") as any)(repositoriesByOwner);

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
      beforeEach(async function() {
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

        resolveForGetStats(data);

        await waitImmediate();
        wrapper.update();
      });

      it("renders CommitsOverTimePlot", function() {
        const commitsOverTimePlot = wrapper.find("CommitsOverTimePlot");

        expect(commitsOverTimePlot).toHaveLength(1);
        expect(commitsOverTimePlot.prop("title")).toEqual(
          "Commits in Repositories"
        );
        const plotData = commitsOverTimePlot.prop("data") as any;
        expect(plotData).toHaveLength(5);
        expect(plotData[0].name).toEqual("repo1");
        expect(plotData[0].y).toEqual([10, 20, 30]);

        expect(plotData[1].name).toEqual("repo2");
        expect(plotData[1].y).toEqual([10, 20, 30]);

        expect(plotData[2].name).toEqual("repo3");
        expect(plotData[2].y).toEqual([10, 20, 30]);

        expect(plotData[3].name).toEqual("Sum");
        expect(plotData[3].y).toEqual([30, 60, 90]);

        expect(plotData[4].name).toEqual("Trend");
        expect(plotData[4].y).toEqual([60, 60, 60]);

        for (let index = 0; index < 5; ++index) {
          expect(plotData[index].x).toEqual([week1, week2, week3]);
          expect(plotData[index].type).toEqual("scatter");
          expect(plotData[index].mode).toEqual("lines");
        }
      });
    });
  });
});
