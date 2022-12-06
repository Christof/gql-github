import { GithubCommit } from "./github_types";

export function filterPullRequestMergeCommits(
  commits: GithubCommit[]
): GithubCommit[] {
  const pullRequestRegex = new RegExp(/Merge pull request/);
  return commits.filter(commit =>
    commit.commit.message.match(pullRequestRegex)
  );
}
