import { groupBy, reverse } from "ramda";
import { Github } from "./github";
import { GithubCommit } from "./github_types";
import { PullRequest } from "./pull_request";

export interface PullRequestWithLabels {
  id: number;
  title: string;
  body: string;
  bodyHTML: string;
  labels: { name: string; color: string }[];
}

export function filterPullRequestMergeCommits(
  commits: GithubCommit[]
): GithubCommit[] {
  const pullRequestRegex = new RegExp(/Merge pull request/);
  return commits.filter(commit =>
    commit.commit.message.match(pullRequestRegex)
  );
}

export function addLabelsToPullRequests(
  pullRequests: PullRequest[],
  github: Github,
  repo: string
) {
  return Promise.all(
    pullRequests.map(pr =>
      github.getPullRequestWithLabels(repo, parseInt(pr.id))
    )
  );
}

export function groupPullRequestsByLabels(
  pullRequests: PullRequestWithLabels[]
) {
  return groupBy(
    pr =>
      pr.labels.some(label => label.name === "bugfix" || label.name === "bug")
        ? "bugfixes"
        : "features",
    reverse(pullRequests)
  );
}
