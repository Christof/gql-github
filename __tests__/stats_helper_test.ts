import {
  getCommitsPerAuthorInDateRange,
  calculateWeeklyCommits,
  calculateWeeklyCommitsForAuthor
} from "../src/stats_helper";
import { GithubData, GithubAuthorData } from "../src/github";

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

describe("calculateWeeklyCommitsForAuthor", function() {
  it("returns the weekly commits for an author", function() {
    const week1 = new Date(1969, 2, 1).getTime() / 1000;
    const week2 = new Date(1970, 2, 1).getTime() / 1000;
    const data: GithubAuthorData[] = [
      {
        author: { login: "author1" },
        total: 1000,
        weeks: [
          { w: week1, a: 0, d: 0, c: 10 },
          { w: week2, a: 0, d: 0, c: 20 }
        ]
      },
      {
        author: { login: "author1" },
        total: 1000,
        weeks: [{ w: week2, a: 0, d: 0, c: 40 }]
      }
    ];

    const expected = new Map<number, number>();
    expected.set(week1, 10);
    expected.set(week2, 60);
    expect(calculateWeeklyCommitsForAuthor(data)).toEqual(expected);
  });
});

describe("calculateWeeklyCommits", function() {
  it("returns the weekly commits per author", function() {
    const week1 = new Date(1969, 2, 1).getTime() / 1000;
    const week2 = new Date(1970, 2, 1).getTime() / 1000;
    const week3 = new Date(1971, 2, 1).getTime() / 1000;
    const data: GithubData[] = [
      [
        {
          author: { login: "author1" },
          total: 1000,
          weeks: [
            { w: week1, a: 0, d: 0, c: 10 },
            { w: week2, a: 0, d: 0, c: 20 }
          ]
        },
        {
          author: { login: "author2" },
          total: 1000,
          weeks: [{ w: week2, a: 0, d: 0, c: 30 }]
        }
      ],
      [
        {
          author: { login: "author1" },
          total: 1000,
          weeks: [{ w: week3, a: 0, d: 0, c: 40 }]
        },
        {
          author: undefined,
          total: 1000,
          weeks: [{ w: week2, a: 0, d: 0, c: 50 }]
        },
        {
          author: { login: undefined },
          total: 1000,
          weeks: [{ w: week2, a: 0, d: 0, c: 10 }]
        }
      ],
      undefined
    ];

    const expected = new Map<string, number[][]>();
    expected.set("author1", [[week1, 10], [week2, 20], [week3, 40]]);
    expected.set("author2", [[week2, 30]]);
    expected.set("deleted", [[week2, 60]]);

    expect(calculateWeeklyCommits(data)).toEqual(expected);
  });
});
