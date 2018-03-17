import { getCommitsPerAuthorInDateRange } from "../src/stats_helper";
import { GithubData } from "../src/github";

describe("getCommitsPerAuthorInDateRange", function() {
  const data: GithubData = [
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
      weeks: [{ w: new Date(1970, 2, 1).getTime() / 1000, a: 0, d: 0, c: 30 }]
    }
  ];

  it("returns commit count per author in date range", function() {
    const result = getCommitsPerAuthorInDateRange(
      data,
      new Date(1969, 0, 1),
      new Date(1969, 11, 31)
    );

    expect(result).toEqual({
      author1: 30,
      author2: 0
    });
  });

  it("uses the current date as default end date", function() {
    const result = getCommitsPerAuthorInDateRange(data, new Date(1969, 0, 1));

    expect(result).toEqual({
      author1: 60,
      author2: 30
    });
  });
});
