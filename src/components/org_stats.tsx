import * as React from "react";
import { Github, GithubData, GithubAuthorData } from "../github";
import { Grid, Typography, LinearProgress } from "material-ui";
import { Section } from "./section";
import { Dropdown } from "./dropdown";
import { ScatterData, Layout } from "plotly.js";
import PlotlyChart from "react-plotlyjs-ts";

interface Props {
  token: string;
}

interface State {
  owners: string[];
  github: Github;
  repositoryNames: string[];
  data: GithubData[];
  startedLoading: boolean;
  traces?: Partial<ScatterData>[];
  layout?: Partial<Layout>;
}

export class OrgStats extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      github: new Github(this.props.token),
      owners: [],
      repositoryNames: [],
      data: [],
      startedLoading: false
    };

    this.state.github.getOwners().then(owners => this.setState({ owners }));
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
      result.set(
        authorResult[0],
        Array.from(authorResult[1].entries()).sort((a, b) => a[0] - b[0])
      );
    }

    return result;
  }

  async selectOwner(owner: string) {
    this.setState({ startedLoading: true });

    this.state.github.owner = owner;
    const repositoryNames = await this.state.github.getRepositoryNames();

    const data = await Promise.all(
      repositoryNames.map(repo => this.state.github.getStats(repo))
    );

    const weeklyCommitsPerAuthor = this.calculateWeeklyCommits(data);

    console.log(weeklyCommitsPerAuthor);

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
    }

    const layout: Partial<Layout> = {
      title: "Commits per Author",
      xaxis: {
        title: "time",
        autorange: true,
        rangeselector: {
          buttons: [
            {
              count: 6,
              label: "6m",
              step: "month",
              stepmode: "backward"
            },
            {
              count: 1,
              label: "1y",
              step: "year",
              stepmode: "backward"
            },
            { step: "all" }
          ]
        },
        type: "date"
      },
      yaxis: {
        title: "commit count",
        autorange: true,
        type: "linear"
      }
    };

    console.log(traces);

    this.setState({ data, repositoryNames, traces, layout });
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
          <PlotlyChart data={this.state.traces} layout={this.state.layout} />
        )}
      </Section>
    );
  }

  renderRepositorySelection() {
    return (
      <Section>
        <Typography type="headline" paragraph>
          Repository
        </Typography>
        <Dropdown
          label="Owner"
          options={this.state.owners}
          onSelect={owner => this.selectOwner(owner)}
        />
      </Section>
    );
  }

  render() {
    return (
      <Grid container spacing={24} justify="center">
        <Grid item xs={12}>
          {this.renderRepositorySelection()}
          {this.renderStatsSection()}
        </Grid>
      </Grid>
    );
  }
}
