import { Owner } from "./owner";
import { OverallPlot } from "./overall_plot";
import * as React from "react";
import { getCommitsPerAuthorInDateRange } from "../stats_helper";
import * as Plotly from "plotly.js";
import { GithubData, GithubAuthorData, Github } from "../github";

interface State {
  error: any;
  token: string;
  owner: string;
  github?: Github;
  repositoryNames: string[];
  data: GithubData[];
}

function sum(array: number[]) {
  return array.reduce((sum, value) => sum + value, 0);
}

export class Stats extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      error: null,
      token: JSON.parse(window.localStorage.github).access_token,
      owner: "skillslab",
      repositoryNames: [],
      data: []
    };
  }

  setupGraph(title: string, data: GithubData) {
    if (data === undefined || data.map === undefined) {
      console.error("No data for", title, data);
      return;
    }
    const authorTimeLine = data.map(author => this.traceForAuthor(author));
    const layout = {
      title,
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
        rangeslider: { autorange: true },
        type: "date"
      },
      yaxis: {
        title: "commit count",
        autorange: true,
        type: "linear"
      }
    };

    Plotly.newPlot(title + "-all", authorTimeLine as any, layout as any);
  }

  private getYearsArray() {
    const startYear = 2013;
    const endYear = new Date().getFullYear();
    return Array.from(new Array(endYear - startYear), (_, i) => i + startYear);
  }

  setupYearGraph(title: string, data: GithubData) {
    const years = this.getYearsArray();
    const statsPerYear = years.map(year =>
      getCommitsPerAuthorInDateRange(
        data,
        new Date(year, 0),
        new Date(year + 1, 0)
      )
    );

    const authors = Object.keys(statsPerYear[0]);
    const x = years.map((year, index) => {
      const commitsInYear = sum(Object.values(statsPerYear[index]));
      return `${year} (${commitsInYear})`;
    });

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

    const overallCommitCount = sum(data.map(authorData => authorData.total));

    const layout: Partial<Plotly.Layout> = {
      title: `Yearly commits in ${title} ${overallCommitCount}`,
      xaxis: {
        title: "time"
      },
      yaxis: {
        title: "commit count"
      }
    };

    Plotly.newPlot(title + "-perYear", traces as any, layout);
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

  async handleSubmit(owner: string) {
    const github = new Github(owner, this.state.token);
    const repositoryNames = await github.getRepositoryNames();
    this.setState({ owner, github, repositoryNames });

    const data = await Promise.all(
      this.state.repositoryNames.map(async repo => {
        const stats = await github.getStats(repo);
        this.setupGraph(repo, stats);
        this.setupYearGraph(repo, stats);
        return stats;
      })
    );

    this.setState({ data });
  }

  renderRepoGraph(repo: string) {
    return (
      <div key={repo}>
        <h1>{repo}</h1>
        <div id={repo + "-all"} />
        <div id={repo + "-perYear"} />
      </div>
    );
  }

  render() {
    return (
      <div>
        <Owner updateOwner={owner => this.handleSubmit(owner)} />
        <h2>Own repositories</h2>
        {this.state.data.length > 0 && (
          <OverallPlot
            reposData={this.state.data}
            repositoryNames={this.state.repositoryNames}
          />
        )}
        <div>
          {this.state.repositoryNames.map(item => this.renderRepoGraph(item))}
        </div>
      </div>
    );
  }
}
