import * as React from "react";
import {
  DetailedRepositorySelector,
  RepositoriesPerOwner
} from "./detailed_repository_selector";
import { Github, GithubAuthorData } from "../github";
import { Section } from "./section";
import { Typography, Grid, LinearProgress } from "material-ui";
import { OverallPlot } from "./overall_plot";
import { OverTimePlot } from "./over_time_plot";
import { runningAverage } from "../array_helper";
import { calculateWeeklyCommitsForAuthor } from "../stats_helper";

interface Props {
  github: Github;
}

interface Repo {
  name: string;
  data: GithubAuthorData;
}

interface State {
  repositoriesPerOwner?: RepositoriesPerOwner;
  author: string;
  data: Repo[];
  startedLoading: boolean;
  OverallPlot?: typeof OverallPlot;
  OverTimePlot?: typeof OverTimePlot;
  totalCommitCount?: number;
}

export class PersonalStats extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { author: "", data: [], startedLoading: false };

    this.props.github
      .getUser()
      .then(user => this.setState({ author: user.login }));

    import("./over_time_plot").then(module =>
      this.setState({ OverTimePlot: module.OverTimePlot })
    );
    import("./overall_plot").then(module =>
      this.setState({ OverallPlot: module.OverallPlot })
    );
  }

  async getAuthorData(github: Github, repo: string) {
    const stats = await github.getStats(repo);
    if (stats === undefined || stats.length === 0 || stats.find === undefined) {
      console.error("No stats found for", repo, stats);
      return undefined;
    }

    const authorData = stats.find(
      authorData => authorData.author.login === this.state.author
    );

    if (authorData === undefined) {
      return undefined;
    }

    return { name: repo, data: authorData };
  }

  async loadData(repositoriesPerOwner: RepositoriesPerOwner) {
    this.setState({ startedLoading: true });

    const data = [] as Repo[];
    for (let [owner, repositories] of repositoriesPerOwner.entries()) {
      const github = this.props.github.copyFor(owner);
      const authorDataForRepository = await Promise.all(
        repositories.map(async repo => await this.getAuthorData(github, repo))
      );
      data.push(...authorDataForRepository.filter(item => item !== undefined));
    }

    const totalCommitCount = data.reduce(
      (sum, repo) => sum + repo.data.total,
      0
    );

    this.setState({
      data: data.filter(item => item !== undefined),
      totalCommitCount
    });
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
  private calculateWeeklyCommits(): number[][] {
    const data = calculateWeeklyCommitsForAuthor(
      this.state.data.map(x => x.data)
    );

    return Array.from(data.entries()).sort((a, b) => a[0] - b[0]);
  }

  private traceForSum() {
    const sortedEntries = this.calculateWeeklyCommits();
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

  renderGraph() {
    const repositoryTimeline = this.state.data.map(repo =>
      this.traceForRepo(repo.name, repo.data)
    );

    repositoryTimeline.push(...this.traceForSum());

    const title = "Commits in Repositories";

    return <this.state.OverTimePlot title={title} data={repositoryTimeline} />;
  }

  renderRepositorySums() {
    const names = this.state.data.map(repo => repo.name);
    return (
      <this.state.OverallPlot
        reposData={this.state.data.map(repo => [repo.data])}
        repositoryNames={names}
      />
    );
  }

  renderStats() {
    if (
      this.state.data.length === 0 ||
      this.state.OverTimePlot === undefined ||
      this.state.OverallPlot === undefined
    )
      return <LinearProgress />;

    return (
      <div>
        <Typography paragraph>
          {`${this.state.totalCommitCount} total commit count in ${
            this.state.data.length
          } repositories`}
        </Typography>

        {this.renderGraph()}
        {this.renderRepositorySums()}
      </div>
    );
  }

  renderStatsSection() {
    if (!this.state.startedLoading) return null;

    return <Section heading="Stats">{this.renderStats()}</Section>;
  }

  render() {
    return (
      <Grid container spacing={24} justify="center">
        <Grid item xs={12}>
          <DetailedRepositorySelector
            github={this.props.github}
            onChange={repositoriesPerOwner =>
              this.loadData(repositoriesPerOwner)
            }
          />

          {this.renderStatsSection()}
        </Grid>
      </Grid>
    );
  }
}
