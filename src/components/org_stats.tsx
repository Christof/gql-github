import * as React from "react";
import {
  Github,
  GithubAuthorData,
  GithubPullRequest,
  GithubReview
} from "../github";
import { RepositoriesByOwnerSelector } from "./repositories_by_owner_selector";
import { runningAverage } from "../array_helper";
import { DefaultGrid } from "./default_grid";
import { calculateWeeklyCommits } from "../stats_helper";
import { flatten, groupBy, values, mapObjIndexed, map, keys } from "ramda";
import { discardTimeFromDate } from "../utils";
import { OrgStatsPlots } from "./org_stats_plots";
import { triggeredAsyncSwitch } from "./triggered_async_switch";

function createTraces(data: GithubAuthorData[][]) {
  const weeklyCommitsPerAuthor = calculateWeeklyCommits(data);

  const traces = [];
  for (const authorData of weeklyCommitsPerAuthor.entries()) {
    const weeks = authorData[1];
    traces.push({
      type: "scatter" as any,
      mode: "lines" as any,
      name: authorData[0],
      x: weeks.map(week => new Date(week[0] * 1000)),
      y: weeks.map(week => week[1])
    });

    traces.push({
      type: "scatter" as any,
      mode: "lines" as any,
      name: `${authorData[0]} Avg`,
      x: weeks.map(week => new Date(week[0] * 1000)),
      y: runningAverage(weeks.map(week => week[1]), 2)
    });
  }

  return traces;
}

async function getPullRequests(github: Github, repositoryNames: string[]) {
  return flatten<GithubPullRequest>(
    await Promise.all(
      repositoryNames.map(repo => github.getPullRequestsWithReviews(repo))
    )
  );
}

function createPullRequestTraces(pullRequests: GithubPullRequest[]) {
  const pullRequestsByAuthor = groupBy(
    pullRequest => pullRequest.author,
    pullRequests
  );

  return values(
    mapObjIndexed(
      (pullRequests: GithubPullRequest[], author: string) => ({
        type: "scatter" as any,
        mode: "markers" as any,
        name: `${author} PRs (${pullRequests.length})`,
        x: pullRequests.map(pullRequest => new Date(pullRequest.createdAt)),
        y: pullRequests.map(pullRequest => pullRequest.reviews.length)
      }),
      pullRequestsByAuthor
    )
  );
}

function getReviewsByAuthorPerDay(pullRequests: GithubPullRequest[]) {
  const reviews = flatten<GithubReview>(
    map(pullRequest => pullRequest.reviews, pullRequests)
  );

  const reviewsPerDay = map(
    review => ({
      ...review,
      createdAt: discardTimeFromDate(review.createdAt)
    }),
    reviews
  );

  return groupBy(review => review.author, reviewsPerDay);
}

function createReviewTraces(pullRequests: GithubPullRequest[]) {
  return values(
    mapObjIndexed((reviews: GithubReview[], author: string) => {
      const groupedByDate = groupBy(
        review => review.createdAt.valueOf().toString(),
        reviews
      );
      return {
        type: "scatter" as any,
        mode: "markers" as any,
        name: `${author} Reviews (${reviews.length})`,
        x: map(dateString => parseFloat(dateString), keys(groupedByDate)),
        y: map(reviews => reviews.length, values(groupedByDate))
      };
    }, getReviewsByAuthorPerDay(pullRequests))
  );
}

async function loadData(
  github: Github,
  options: { owner?: string; includeForks: boolean }
) {
  const overTimePlotPromise = import("./over_time_plot").then(
    module => module.OverTimePlot
  );

  github.owner = options.owner;
  const repositoryNames = await github.getRepositoryNames(options);

  const data = await github.getStatsForRepositories(repositoryNames);

  const pullRequests = await getPullRequests(github, repositoryNames);
  const pullRequestsTraces = createPullRequestTraces(pullRequests);
  const reviewsTraces = createReviewTraces(pullRequests);

  const traces = createTraces(data);

  const OverTimePlot = await overTimePlotPromise;

  return { data, traces, pullRequestsTraces, reviewsTraces, OverTimePlot };
}

interface Props {
  github: Github;
}

export class OrgStats extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const Triggered = triggeredAsyncSwitch(
      RepositoriesByOwnerSelector,
      "onLoad",
      OrgStatsPlots
    );

    return (
      <DefaultGrid>
        <Triggered
          github={this.props.github}
          onLoad={(options: { owner?: string; includeForks: boolean }) =>
            loadData(this.props.github, options)
          }
        />
      </DefaultGrid>
    );
  }
}
