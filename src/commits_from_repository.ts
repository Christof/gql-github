import { promisify } from "util";
import { exec } from "child_process";
const sh = promisify(exec);

export class CommitsFromRepository {
  constructor(private repo: string) {}
  async getCommitsBetweenTags(start: string, end: string) {
    const { stdout, stderr } = await sh(
      `cd ~/Documents/${this.repo} && \
    git log ${start}..${end} | \
    grep "Merge pull" --after-context=2`
    );

    if (stderr) throw new Error(stderr);

    return stdout.split("\n");
  }

  private noneWhitespaceLinesReduce(accumulator: string[], line: string) {
    if (/\S/.test(line) && line.indexOf("--") !== 0) accumulator.push(line);

    return accumulator;
  }

  private pullRequestCommitsReduce(
    accumulator: string[],
    line: string,
    index: number,
    array: string[]
  ) {
    const pullRequestNumberRegex = new RegExp(/#\d*/);
    if (index % 2 === 0) return accumulator;

    const pullRequestNumberMatch = array[index - 1].match(
      pullRequestNumberRegex
    );
    const result = `- ${line.trim()} (${pullRequestNumberMatch})`;
    accumulator.push(result);
    return accumulator;
  }

  async filterPullRequestCommits(lines: string[]) {
    const importantLines = lines.reduce(
      this.noneWhitespaceLinesReduce,
      [] as string[]
    );

    const pullRequests = importantLines.reduce(
      this.pullRequestCommitsReduce,
      [] as string[]
    );

    return pullRequests;
  }

  async getPullRequestCommitsBetween(start: string, end: string) {
    const commits = await this.getCommitsBetweenTags(start, end);
    return await this.filterPullRequestCommits(commits);
  }
}
