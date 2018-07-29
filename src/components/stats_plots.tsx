import * as React from "react";
import PlotlyChart from "react-plotlyjs-ts";
import { OverTimePlot } from "./over_time_plot";
import { GithubData, GithubAuthorData } from "../github_types";
import { Section } from "./section";
import { OverallPlot } from "./overall_plot";
import { sum } from "../array_helper";
import { getCommitsPerAuthorInDateRange } from "../stats_helper";
import { Layout } from "plotly.js";
import { findLast, reduce, min, max } from "ramda";

export interface StatsPlotsProps {
  repositoryNames: string[];
  PlotlyChart: typeof PlotlyChart;
  OverTimePlot: typeof OverTimePlot;
  OverallPlot: typeof OverallPlot;
  data: GithubData[];
}

export class StatsPlots extends React.Component<StatsPlotsProps, {}> {
  render() {
    return (
      <>
        <Section heading="Overall">
          <this.props.OverallPlot
            reposData={this.props.data}
            repositoryNames={this.props.repositoryNames}
          />
        </Section>
        {this.props.repositoryNames.map((item, index) =>
          this.renderRepoGraphs(item, index)
        )}
      </>
    );
  }

  renderRepoGraphs(repo: string, index: number) {
    const data = this.props.data[index];

    if (!data) return null;

    return (
      <Section key={repo} heading={repo}>
        {this.renderGraph(repo, data)}
        {this.renderYearGraph(repo, data)}
      </Section>
    );
  }

  renderGraph(title: string, data: GithubData) {
    const authorTimeLine = data.map(author => this.traceForAuthor(author));

    return (
      <this.props.OverTimePlot title={title} data={authorTimeLine as any} />
    );
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
        type: "bar" as any,
        textposition: "outside",
        text: yValues.map(value => value.toString()),
        hoverinfo: "name" as any,
        name: `${author} ${authorSum}`,
        authorSum
      };
    });

    traces.sort(t => t.authorSum);

    const layout = this.getYearGraphLayout(title, data);
    return <this.props.PlotlyChart data={traces} layout={layout as any} />;
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
}
