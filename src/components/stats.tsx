import { OverallPlot } from "./overall_plot";
import * as React from "react";
import { getCommitsPerAuthorInDateRange } from "../stats_helper";
import { Layout } from "plotly.js";
import PlotlyChart from "react-plotlyjs-ts";
import { OverTimePlot } from "./over_time_plot";
import { GithubData, GithubAuthorData, Github } from "../github";
import { Section } from "./section";
import LinearProgress from "material-ui/Progress/LinearProgress";
import { RepositoriesByOwnerSelector } from "./repositories_by_owner_selector";
import { DefaultGrid } from "./default_grid";
import { sum } from "../array_helper";
import { min, reduce, max, findLast } from "ramda";

interface Props {
  github: Github;
}

interface State {
  error: any;
  repositoryNames: string[];
  data: GithubData[];
  startedLoading: boolean;
  PlotlyChart?: typeof PlotlyChart;
  OverTimePlot?: typeof OverTimePlot;
}

export class Stats extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      error: null,
      repositoryNames: [],
      data: [],
      startedLoading: false
    };

    import("react-plotlyjs-ts").then(module =>
      this.setState({ PlotlyChart: module.default })
    );

    import("./over_time_plot").then(module =>
      this.setState({ OverTimePlot: module.OverTimePlot })
    );
  }

  renderGraph(title: string, data: GithubData) {
    const authorTimeLine = data.map(author => this.traceForAuthor(author));

    return (
      <this.state.OverTimePlot title={title} data={authorTimeLine as any} />
    );
  }

  private getYearsArray(data: GithubData) {
    const startWeeks = data.map(d => new Date(d.weeks[0].w * 1000));
    const endWeeks = data.map(
      d => new Date(findLast<any>(w => w.c !== 0)(d.weeks).w * 1000)
    );

    const startYear = reduce(min, new Date(), startWeeks).getFullYear();
    const endYear = reduce(max, new Date(2000, 0), endWeeks).getFullYear();
    if (startYear > endYear) return [];

    return Array.from(
      new Array(endYear - startYear + 1),
      (_, i) => i + startYear
    );
  }

  private getStatsPerYear(years: number[], data: GithubData) {
    return years.map(year =>
      getCommitsPerAuthorInDateRange(
        data,
        new Date(year, 0),
        new Date(year + 1, 0)
      )
    );
  }

  private getYearGraphLayout(title: string, data: GithubData): Partial<Layout> {
    const overallCommitCount = sum(data.map(authorData => authorData.total));

    return {
      title: `Yearly commits in ${title} ${overallCommitCount}`,
      xaxis: {
        title: "time"
      },
      yaxis: {
        title: "commit count"
      }
    };
  }

  renderYearGraph(title: string, data: GithubData) {
    const years = this.getYearsArray(data);
    const statsPerYear = this.getStatsPerYear(years, data);

    const x = years.map((year, index) => {
      const commitsInYear = sum(Object.values(statsPerYear[index]));
      return `${year} (${commitsInYear})`;
    });

    const authors = years.length > 0 ? Object.keys(statsPerYear[0]) : [];
    const traces = authors.map((author: string) => {
      const yValues = statsPerYear.map(year => year[author]);
      const authorSum = data.find(d => d.author.login === author).total;
      return {
        x,
        y: yValues,
        type: "bar",
        textposition: "outside",
        text: yValues,
        hoverinfo: "name",
        name: `${author} ${authorSum}`
      };
    });

    const layout = this.getYearGraphLayout(title, data);
    return <this.state.PlotlyChart data={traces} layout={layout} />;
  }

  private traceForAuthor(statsForAuthor: GithubAuthorData) {
    return {
      type: "scatter",
      mode: "lines",
      name: statsForAuthor.author.login,
      x: statsForAuthor.weeks.map((week: any) => new Date(week.w * 1000)),
      y: statsForAuthor.weeks.map((week: any) => week.c)
    };
  }

  async selectOwner(options: { owner?: string; includeForks: boolean }) {
    if (options.owner === undefined) return;

    this.setState({ startedLoading: true });

    this.props.github.owner = options.owner;
    const repositoryNames = await this.props.github.getRepositoryNames({
      includeForks: options.includeForks
    });

    const data = await this.props.github.getStatsForRepositories(
      repositoryNames
    );

    this.setState({ data, repositoryNames });
  }

  renderRepoGraphs(repo: string, index: number) {
    const data = this.state.data[index];

    if (!data) return null;

    return (
      <Section key={repo} heading={repo}>
        {this.renderGraph(repo, data)}
        {this.renderYearGraph(repo, data)}
      </Section>
    );
  }

  renderRepositorySelection() {
    return (
      <RepositoriesByOwnerSelector
        github={this.props.github}
        onLoad={options => this.selectOwner(options)}
      />
    );
  }

  renderStatsSection() {
    if (!this.state.startedLoading) return null;

    if (
      this.state.data.length === 0 ||
      this.state.PlotlyChart === undefined ||
      this.state.OverTimePlot === undefined
    )
      return (
        <Section heading="Stats">
          <LinearProgress />
        </Section>
      );

    return (
      <div>
        <Section heading="Overall">
          <OverallPlot
            reposData={this.state.data}
            repositoryNames={this.state.repositoryNames}
          />
        </Section>
        {this.state.repositoryNames.map((item, index) =>
          this.renderRepoGraphs(item, index)
        )}
      </div>
    );
  }

  render() {
    return (
      <DefaultGrid>
        {this.renderRepositorySelection()}
        {this.renderStatsSection()}
      </DefaultGrid>
    );
  }
}
