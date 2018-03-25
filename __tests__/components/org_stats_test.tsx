import * as React from "react";
import { OrgStats } from "../../src/components/org_stats";
import { shallow, ShallowWrapper } from "enzyme";
import { waitImmediate } from "../helper";
import { Github, GithubData } from "../../src/github";

jest.mock("../../src/github");

describe("OrgStats", function() {
  let github: Github;
  let wrapper: ShallowWrapper<any, any>;

  beforeEach(function() {
    github = new Github("token", {} as any);

    wrapper = shallow(<OrgStats github={github} />);
  });

  it("shows a RepositoryByOwnerSelector", function() {
    expect(wrapper.find("RepositoriesByOwnerSelector")).toHaveLength(1);
  });

  describe("after owner selection", function() {
    it("shows a CommitsOverTimePlot", async function() {
      const owner = "owner";
      const includeForks = true;

      (github.getRepositoryNames as jest.Mock).mockReturnValue([
        "repo1",
        "repo"
      ]);

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
      (github.getStats as jest.Mock).mockReturnValue(data);

      const selector = wrapper.find("RepositoriesByOwnerSelector");
      (selector.prop("onLoad") as any)({ owner, includeForks });

      await waitImmediate();
      wrapper.update();

      const plot = wrapper.find("CommitsOverTimePlot");
      expect(plot).toHaveLength(1);
      const plotData = plot.prop("data") as any;
      expect(plotData).toHaveLength(4);

      expect(plotData[0].name).toEqual("author1");
      expect(plotData[0].x).toEqual([week1, week2]);
      expect(plotData[0].y).toEqual([60, 60]);

      expect(plotData[1].name).toEqual("author1 Avg");
      expect(plotData[1].x).toEqual([week1, week2]);
      expect(plotData[1].y).toEqual([60, 60]);

      expect(plotData[2].name).toEqual("author2");
      expect(plotData[2].x).toEqual([week2]);
      expect(plotData[2].y).toEqual([60]);

      expect(plotData[3].name).toEqual("author2 Avg");
      expect(plotData[3].x).toEqual([week2]);
      expect(plotData[3].y).toEqual([60]);
    });

    it("doesn't load anything on undefined owner selection", function() {
      const selector = wrapper.find("RepositoriesByOwnerSelector");
      (selector.prop("onLoad") as any)({
        owner: undefined,
        includeForks: false
      });

      expect(github.getRepositoryNames as jest.Mock).toHaveBeenCalledTimes(0);
    });
  });
});
