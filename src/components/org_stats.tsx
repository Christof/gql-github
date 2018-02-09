import * as React from "react";
import { Github, GithubData, GithubAuthorData } from "../github";
import { Typography, LinearProgress } from "material-ui";
import { Section } from "./section";
import { RepositoriesByOwnerSelector } from "./repositories_by_owner_selector";
import { ScatterData } from "plotly.js";
import { CommitsOverTimePlot } from "./commits_over_time_plot";
import { runningAverage } from "./personal_stats";
import { DefaultGrid } from "./default_grid";

interface Props {
  github: Github;
}

interface State {
  data: GithubData[];
  startedLoading: boolean;
  traces?: Partial<ScatterData>[];
}

export class OrgStats extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      data: [],
      startedLoading: false
    };
  }

  private calculateWeeklyCommits(
    githubData: GithubAuthorData[][]
  ): Map<string, number[][]> {
    const collector = new Map<string, Map<number, number>>();
    for (const repoData of githubData) {
      for (const authorData of repoData) {
        const authorResult =
          collector.get(authorData.author.login) || new Map<number, number>();
        authorData.weeks.forEach(week => {
          const commits = authorResult.get(week.w);
          const sum = week.c + (commits === undefined ? 0 : commits);
          authorResult.set(week.w, sum);
        });

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

  createTraces(data: GithubAuthorData[][]) {
    const weeklyCommitsPerAuthor = this.calculateWeeklyCommits(data);

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

  async selectOwner(options: { owner?: string; includeForks: boolean }) {
    if (options.owner === undefined) return;

    this.setState({ startedLoading: true });

    this.props.github.owner = options.owner;
    const repositoryNames = await this.props.github.getRepositoryNames(options);

    const data = await Promise.all(
      repositoryNames.map(repo => this.props.github.getStats(repo))
    );

    const traces = this.createTraces(data);

    this.setState({ data, traces });
  }

  renderStatsSection() {
    if (!this.state.startedLoading) return null;

    return (
      <Section>
        <Typography type="headline" paragraph>
          Stats
        </Typography>
        {this.state.data.length === 0 ? (
          <LinearProgress />
        ) : (
          <CommitsOverTimePlot
            title="Commits per Author"
            data={this.state.traces}
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
