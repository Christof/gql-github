import * as React from "react";
import { OrgStats } from "../../src/components/org_stats";
import { mount, ReactWrapper } from "enzyme";
import { waitImmediate } from "../helper";
import { Github, GithubData } from "../../src/github";
import { RepositoriesByOwnerSelector } from "../../src/components/repositories_by_owner_selector";
import { OverTimePlot } from "../../src/components/over_time_plot";

jest.mock("../../src/github");

describe("OrgStats", function () {
  let github: Github;
  let wrapper: ReactWrapper<any, any>;

  beforeEach(function () {
    github = new Github("token", {} as any, undefined);
    (github.getOwnersWithAvatar as jest.Mock).mockReturnValue(
      Promise.resolve([
        { login: "author1", avatarUrl: "author1Url" },
        { login: "org1", avatarUrl: "org1Url" }
      ])
    );

    wrapper = mount(<OrgStats github={github} />);
  });

  it("shows a RepositoryByOwnerSelector", function () {
    expect(wrapper.find(RepositoriesByOwnerSelector)).toHaveLength(1);
  });

  describe("after owner selection", function () {
    const week1 = new Date(1969, 2, 1);
    const week2 = new Date(1970, 2, 1);
    const data: GithubData = [
      {
        author: { login: "author1" },
        total: 1000,
        weeks: [
          { w: week1.getTime() / 1000, a: 0, d: 0, c: 10 },
          { w: week1.getTime() / 1000, a: 0, d: 0, c: 20 },
          { w: week2.getTime() / 1000, a: 0, d: 0, c: 30 }
        ]
      },
      {
        author: { login: "author2" },
        total: 1000,
        weeks: [{ w: week2.getTime() / 1000, a: 0, d: 0, c: 30 }]
      }
    ];
    const reviewData = [
      { author: "author1", createdAt: week1, reviews: [] },
      {
        author: "author2",
        createdAt: week1,
        reviews: [
          { author: "author3", createdAt: week2 },
          { author: "author1", createdAt: week2 }
        ]
      }
    ];

    beforeEach(async function () {
      (github.getRepositoryNames as jest.Mock).mockReturnValue([
        "repo1",
        "repo"
      ]);

      (github.getPullRequestsWithReviews as jest.Mock).mockReturnValue(
        reviewData
      );

      (github.getStatsForRepositories as jest.Mock).mockReturnValueOnce([
        data,
        undefined
      ]);

      const owner = "owner";
      const includeForks = true;

      const selector = wrapper.find(RepositoriesByOwnerSelector);
      (selector.prop("onLoad") as any)({ owner, includeForks });

      await waitImmediate();
      wrapper.update();
    });

    it("shows an OverTimePlot for commits", async function () {
      const plot = wrapper.find(OverTimePlot);
      expect(plot).toHaveLength(3);
      const plotData = plot.at(0).prop("data") as any;
      expect(plotData).toHaveLength(4);

      expect(plotData[0].name).toEqual("author1");
      expect(plotData[0].x).toEqual([week1, week2]);
      expect(plotData[0].y).toEqual([30, 30]);

      expect(plotData[1].name).toEqual("author1 Avg");
      expect(plotData[1].x).toEqual([week1, week2]);
      expect(plotData[1].y).toEqual([30, 30]);

      expect(plotData[2].name).toEqual("author2");
      expect(plotData[2].x).toEqual([week2]);
      expect(plotData[2].y).toEqual([30]);

      expect(plotData[3].name).toEqual("author2 Avg");
      expect(plotData[3].x).toEqual([week2]);
      expect(plotData[3].y).toEqual([30]);
    });

    it("shows an OverTimePlot for PullRequests", function () {
      const plot = wrapper.find(OverTimePlot);
      expect(plot).toHaveLength(3);
      const plotData = plot.at(1).prop("data") as any;
      expect(plotData).toHaveLength(2);

      expect(plotData[0].name).toEqual("author1 PRs (2)");
      expect(plotData[0].x).toEqual([week1, week1]);
      expect(plotData[0].y).toEqual([0, 0]);

      expect(plotData[1].name).toEqual("author2 PRs (2)");
      expect(plotData[1].x).toEqual([week1, week1]);
      expect(plotData[1].y).toEqual([2, 2]);
    });

    it("shows an OverTimePlot for Reviews", function () {
      const plot = wrapper.find(OverTimePlot);
      expect(plot).toHaveLength(3);
      const plotData = plot.at(2).prop("data") as any;
      expect(plotData).toHaveLength(2);

      expect(plotData[0].name).toEqual("author3 Reviews (2)");
      expect(plotData[0].x).toEqual([week2.valueOf()]);
      expect(plotData[0].y).toEqual([2]);

      expect(plotData[1].name).toEqual("author1 Reviews (2)");
      expect(plotData[1].x).toEqual([week2.valueOf()]);
      expect(plotData[1].y).toEqual([2]);
    });
  });
});
