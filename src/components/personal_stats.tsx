import * as React from "react";
import {
  DetailedRepositorySelector,
  RepositoriesPerOwner
} from "./detailed_repository_selector";
import { Github, GithubAuthorData } from "../github";
import { Section } from "./section";
import { Grid, LinearProgress } from "material-ui";
import { OverallPlot } from "./overall_plot";
import { OverTimePlot } from "./over_time_plot";
import { runningAverage } from "../array_helper";
import { calculateWeeklyCommitsForAuthor } from "../stats_helper";
import { ScatterData } from "plotly.js";
import { PersonalStatsPlots } from "./personal_stats_plots";

interface Props {
  github: Github;
}

interface Repo {
  name: string;
  data: GithubAuthorData;
}

interface State {
  repositoriesPerOwner?: RepositoriesPerOwner;
  data: Repo[];
  startedLoading: boolean;
  OverallPlot?: typeof OverallPlot;
  OverTimePlot?: typeof OverTimePlot;
  totalCommitCount?: number;
  repositoryTimeline?: Partial<ScatterData>[];
}

export class PersonalStats extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { data: [], startedLoading: false };
  }

  async getAuthorData(author: string, github: Github, repo: string) {
    const stats = await github.getStats(repo);
    if (stats === undefined || stats.length === 0 || stats.find === undefined) {
      console.error("No stats found for", repo, stats);
      return undefined;
    }

    const authorData = stats.find(
      authorData => authorData.author.login === author
    );

    if (authorData === undefined) {
      return undefined;
    }

    return { name: repo, data: authorData };
  }

  async loadData(github: Github, repositoriesPerOwner: RepositoriesPerOwner) {
    const author = await github.getUser().then(user => user.login);

    const overTimePlotPromise = import("./over_time_plot").then(
      module => module.OverTimePlot
    );
    const overallPlotPromise = import("./overall_plot").then(
      module => module.OverallPlot
    );

    const data = [] as Repo[];
    for (let [owner, repositories] of repositoriesPerOwner.entries()) {
      const githubForOwner = github.copyFor(owner);
      const authorDataForRepository = await Promise.all(
        repositories.map(
          async repo => await this.getAuthorData(author, githubForOwner, repo)
        )
      );
      data.push(...authorDataForRepository.filter(item => item !== undefined));
    }

    const totalCommitCount = data.reduce(
      (sum, repo) => sum + repo.data.total,
      0
    );

    const repositoryTimeline = data.map(repo =>
      this.traceForRepo(repo.name, repo.data)
    );
    repositoryTimeline.push(...this.traceForSum(data));

    const [OverTimePlot, OverallPlot] = await Promise.all([
      overTimePlotPromise,
      overallPlotPromise
    ]);

    return {
      data,
      totalCommitCount,
      repositoryTimeline,
      OverTimePlot,
      OverallPlot
    };
  }

  private traceForRepo(name: string, data: GithubAuthorData) {
    return {
      type: "scatter" as any, // any to prevent type error with ScatterData
      mode: "lines" as any, // any to prevent type error with ScatterData
      name,
      x: data.weeks.map((week: any) => new Date(week.w * 1000)),
      y: data.weeks.map((week: any) => week.c)
    };
  }

  /**
   * Calculates sum of commits per week.
   *
   * @returns Array of [week, commitsInWeek]
   */
  private calculateWeeklyCommits(data: Repo[]): number[][] {
    const weeklyCommitsForAuthor = calculateWeeklyCommitsForAuthor(
      data.map(x => x.data)
    );

    return Array.from(weeklyCommitsForAuthor.entries()).sort(
      (a, b) => a[0] - b[0]
    );
  }

  private traceForSum(data: Repo[]) {
    const sortedEntries = this.calculateWeeklyCommits(data);
    const x = sortedEntries.map(entry => new Date(entry[0] * 1000));

    return [
      {
        type: "scatter",
        mode: "lines",
        name: "Sum",
        x,
        y: sortedEntries.map(entry => entry[1])
      },
      {
        type: "scatter",
        mode: "lines",
        name: "Trend",
        x,
        y: runningAverage(sortedEntries.map(entry => entry[1]), 2)
      }
    ];
  }

  render() {
    return (
      <Grid container spacing={24} justify="center">
        <Grid item xs={12}>
          <DetailedRepositorySelector
            github={this.props.github}
            onChange={repositoriesPerOwner => {
              this.setState({ startedLoading: true });
              this.loadData(this.props.github, repositoriesPerOwner).then(
                loaded => this.setState(loaded)
              );
            }}
          />

          {this.state.startedLoading && (
            <Section heading="Stats">
              {this.state.data.length === 0 ||
              this.state.OverTimePlot === undefined ||
              this.state.OverallPlot === undefined ? (
                <LinearProgress />
              ) : (
                <PersonalStatsPlots {...this.state as any} />
              )}
            </Section>
          )}
        </Grid>
      </Grid>
    );
  }
}
