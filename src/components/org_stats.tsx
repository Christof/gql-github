import * as React from "react";
import {
  Github,
  GithubData,
  GithubAuthorData,
  GithubPullRequest
} from "../github";
import { Typography, LinearProgress } from "material-ui";
import { Section } from "./section";
import { RepositoriesByOwnerSelector } from "./repositories_by_owner_selector";
import { ScatterData } from "plotly.js";
import { OverTimePlot } from "./over_time_plot";
import { runningAverage } from "../array_helper";
import { DefaultGrid } from "./default_grid";
import { calculateWeeklyCommits } from "../stats_helper";
import { flatten, groupBy, values, mapObjIndexed, map } from "ramda";

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
          name: author + " PRs",
          x: pullRequests.map(pullRequest => new Date(pullRequest.createdAt)),
          y: pullRequests.map(pullRequest => pullRequest.reviews.length)
        }),
        pullRequestsByAuthor
      )
    );
  }

  createReviewTraces(pullRequests: GithubPullRequest[]) {
    const reviews = flatten(
      map(pullRequest => pullRequest.reviews, pullRequests)
    );
    const reviewsByAuthor = groupBy((review: any) => review.author, reviews);

    return values(
      mapObjIndexed(
        (reviews: any[], author: string) => ({
          type: "scatter" as any,
          mode: "markers" as any,
          name: author + " PRs",
          x: reviews.map(review => new Date(review.createdAt)),
          y: reviews.map(_review => 1)
        }),
        reviewsByAuthor
      )
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
      <Section>
        <Typography variant="headline" paragraph>
          Stats
        </Typography>
        {this.state.data.length === 0 ? (
          <LinearProgress />
        ) : (
          <div>
            <this.state.OverTimePlot
              title="Commits per Author"
              data={this.state.traces}
            />
            <this.state.OverTimePlot
              title="Pull Requests per Author"
              yaxisTitle="review count"
              data={this.state.pullRequestsTraces}
            />
            <this.state.OverTimePlot
              title="Reviews per Author"
              yaxisTitle="review count"
              data={this.state.reviewsTraces}
            />
          </div>
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
