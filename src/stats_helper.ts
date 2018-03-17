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
