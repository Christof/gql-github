import { OverallPlot } from "./overall_plot";
import * as React from "react";
import { getCommitsPerAuthorInDateRange } from "../stats_helper";
import { Layout } from "plotly.js";
import PlotlyChart from "react-plotlyjs-ts";
import { OverTimePlot } from "./over_time_plot";
import { GithubData, GithubAuthorData, Github } from "../github";
import { Section } from "./section";
import { RepositoriesByOwnerSelector } from "./repositories_by_owner_selector";
import { DefaultGrid } from "./default_grid";
import { sum } from "../array_helper";
import { min, reduce, max, findLast, zipObj } from "ramda";
import {
  triggeredAsyncSwitch,
  container,
  progressToContentSwitch
} from "./triggered_async_switch";

interface StatsPlotsProps {
  repositoryNames: string[];
  PlotlyChart?: typeof PlotlyChart;
  OverTimePlot?: typeof OverTimePlot;
  data: GithubData[];
}

class StatsPlots extends React.Component<StatsPlotsProps, {}> {
  render() {
    return (
      <div>
        <Section heading="Overall">
          <OverallPlot
            reposData={this.props.data}
            repositoryNames={this.props.repositoryNames}
          />
        </Section>
        {this.props.repositoryNames.map((item, index) =>
          this.renderRepoGraphs(item, index)
        )}
      </div>
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
        name: `${author} ${authorSum}`
      };
    });

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

type UnpromisifiedObject<T> = { [k in keyof T]: Unpromisify<T[k]> };
type Unpromisify<T> = T extends Promise<infer U> ? U : T;

async function awaitAllProperties<T extends { [key: string]: Promise<any> }>(
  obj: T
): Promise<UnpromisifiedObject<T>> {
  const results = await Promise.all(Object.values(obj));

  return zipObj(Object.keys(obj), results) as UnpromisifiedObject<T>;
}

async function loadData(
  github: Github,
  options: { owner?: string; includeForks: boolean }
) {
  const plots = {
    PlotlyChart: import("react-plotlyjs-ts").then(module => module.default),
    OverTimePlot: import("./over_time_plot").then(module => module.OverTimePlot)
  };

  github.owner = options.owner;
  const repositoryNames = await github.getRepositoryNames({
    includeForks: options.includeForks
  });

  const data = github.getStatsForRepositories(repositoryNames);

  return awaitAllProperties({
    data,
    repositoryNames: Promise.resolve(repositoryNames),
    ...plots
  });
}

const TriggeredStatsPlots = triggeredAsyncSwitch(
  RepositoriesByOwnerSelector,
  "onLoad",
  container(Section, { heading: "Stats" }, progressToContentSwitch(StatsPlots))
);

export function Stats(props: { github: Github }) {
  return (
    <DefaultGrid>
      <TriggeredStatsPlots
        github={props.github}
        onLoad={(options: { owner?: string; includeForks: boolean }) =>
          loadData(props.github, options)
        }
      />
    </DefaultGrid>
  );
}
