import { GithubAuthorData } from "./github";

export function getCommitsPerAuthorInDateRange(
  data: GithubAuthorData[],
  startTime: Date,
  endTime = new Date()
) {
  const unixStartTime = Math.round(startTime.getTime() / 1000);
  const unixEndTime = Math.round(endTime.getTime() / 1000);
  return data.reduce(
    (acc, userEntry) => {
      const weeksInRange = userEntry.weeks.filter(
        week => week.w > unixStartTime && week.w <= unixEndTime
      );
      const commits = weeksInRange.reduce((sum, week) => sum + week.c, 0);
      acc[userEntry.author.login] = commits;
      return acc;
    },
    {} as { [author: string]: number }
  );
}

function accumulateWeeklyCommits(
  authorData: GithubAuthorData,
  accumulator: Map<number, number>
) {
  authorData.weeks.forEach(week => {
    const commits = accumulator.get(week.w);
    const sum = week.c + (commits === undefined ? 0 : commits);
    accumulator.set(week.w, sum);
  });
}

/**
 * Calculates sum of commits per week.
 *
 * @returns Map<week, commitsInWeek>
 */
export function calculateWeeklyCommitsForAuthor(data: GithubAuthorData[]) {
  const accumulator = new Map<number, number>();
  for (const authorData of data) {
    accumulateWeeklyCommits(authorData, accumulator);
  }

  return accumulator;
}

export function calculateWeeklyCommits(
  githubData: GithubAuthorData[][]
): Map<string, number[][]> {
  const collector = new Map<string, Map<number, number>>();
  for (const repoData of githubData) {
    if (repoData === undefined) continue;

    for (const authorData of repoData) {
      const authorResult =
        collector.get(authorData.author.login) || new Map<number, number>();
      accumulateWeeklyCommits(authorData, authorResult);

      collector.set(authorData.author.login, authorResult);
    }
  }

  const result = new Map<string, number[][]>();
  for (const authorResult of collector.entries()) {
    const author = authorResult[0];
    const sortedEntries = Array.from(authorResult[1].entries()).sort(
      (a, b) => a[0] - b[0]
    );
    result.set(author, sortedEntries);
  }

  return result;
}
