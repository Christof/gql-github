import * as React from "react";
import {
  Github,
  GithubData,
  GithubAuthorData,
  GithubPullRequest,
  GithubReview
} from "../github";
import { LinearProgress } from "material-ui";
import { Section } from "./section";
import { RepositoriesByOwnerSelector } from "./repositories_by_owner_selector";
import { ScatterData } from "plotly.js";
import { OverTimePlot } from "./over_time_plot";
import { runningAverage } from "../array_helper";
import { DefaultGrid } from "./default_grid";
import { calculateWeeklyCommits } from "../stats_helper";
import { flatten, groupBy, values, mapObjIndexed, map, keys } from "ramda";
import { discardTimeFromDate } from "../utils";
import { OrgStatsPlots } from "./org_stats_plots";

interface Props {
  github: Github;
}

interface State {
  data: GithubData[];
  startedLoading: boolean;
  traces?: Partial<ScatterData>[];
  pullRequestsTraces?: Partial<ScatterData>[];
  reviewsTraces?: Partial<ScatterData>[];
  OverTimePlot?: typeof OverTimePlot;
}

export class OrgStats extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      data: [],
      startedLoading: false
    };

    import("./over_time_plot").then(module =>
      this.setState({ OverTimePlot: module.OverTimePlot })
    );
  }

  createTraces(data: GithubAuthorData[][]) {
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

  async getPullRequests(repositoryNames: string[]) {
    return flatten<GithubPullRequest>(
      await Promise.all(
        repositoryNames.map(repo =>
          this.props.github.getPullRequestsWithReviews(repo)
        )
      )
    );
  }

  createPullRequestTraces(pullRequests: GithubPullRequest[]) {
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

  private getReviewsByAuthorPerDay(pullRequests: GithubPullRequest[]) {
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

  createReviewTraces(pullRequests: GithubPullRequest[]) {
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
      }, this.getReviewsByAuthorPerDay(pullRequests))
    );
  }

  async selectOwner(options: { owner?: string; includeForks: boolean }) {
    if (options.owner === undefined) return;

    this.setState({ startedLoading: true });

    this.props.github.owner = options.owner;
    const repositoryNames = await this.props.github.getRepositoryNames(options);

    const data = await this.props.github.getStatsForRepositories(
      repositoryNames
    );

    const pullRequests = await this.getPullRequests(repositoryNames);
    const pullRequestsTraces = this.createPullRequestTraces(pullRequests);
    const reviewsTraces = this.createReviewTraces(pullRequests);

    const traces = this.createTraces(data);

    this.setState({ data, traces, pullRequestsTraces, reviewsTraces });
  }

  renderStatsSection() {
    if (!this.state.startedLoading || this.state.OverTimePlot === undefined)
      return null;

    return (
      <Section heading="Stats">
        {this.state.data.length === 0 ? (
          <LinearProgress />
        ) : (
          <OrgStatsPlots
            OverTimePlot={this.state.OverTimePlot}
            traces={this.state.traces}
            pullRequestsTraces={this.state.pullRequestsTraces}
            reviewsTraces={this.state.reviewsTraces}
          />
        )}
      </Section>
    );
  }

  render() {
    return (
      <DefaultGrid>
        <RepositoriesByOwnerSelector
          github={this.props.github}
          onLoad={options => this.selectOwner(options)}
        />
        {this.renderStatsSection()}
      </DefaultGrid>
    );
  }
}
