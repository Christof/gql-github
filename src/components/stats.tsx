import { Owner } from "./owner";
import * as React from "react";
import {
  getNamesOfOwnRepositories,
  getCommitsPerAuthorInDateRange
} from "../stats_helper";
import * as Plotly from "plotly.js";

interface State {
  error: any;
  token: string;
  owner: string;
  repos: any[];
  data: any[];
}

export class Stats extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      error: null,
      token: JSON.parse(window.localStorage.github).access_token,
      owner: "skillslab",
      repos: [],
      data: []
    };
  }

  setupGraph(title: string, data: any) {
    const layout = {
      title,
      xaxis: {
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
        autorange: true,
        type: "linear"
      }
    };

    Plotly.newPlot(title + "-all", data, layout as any);
  }

  private getYearsArray() {
    const startYear = 2013;
    const endYear = new Date().getFullYear();
    return Array.from(new Array(endYear - startYear), (_, i) => i + startYear);
  }

  setupYearGraph(title: string, data: any) {
    const years = this.getYearsArray();
    const statsPerYear = years.map(year =>
      getCommitsPerAuthorInDateRange(
        data,
        new Date(year, 0),
        new Date(year + 1, 0)
      )
    );

    const authors = Object.keys(statsPerYear[0]);

    const traces = authors.map((author: string) => {
      const yValues = statsPerYear.map(year => year[author]);
      return {
        x: years,
        y: yValues,
        type: "bar",
        textposition: "outside",
        text: yValues,
        hoverinfo: "name",
        name: author
      };
    });

    var layout = {
      title: `Yearly commits in ${title}`
    };

    Plotly.newPlot(title + "-perYear", traces as any, layout);
  }

  getRequestGithub(path: string) {
    const params: RequestInit = {
      method: "GET",
      mode: "cors",
      headers: [
        ["User-Agent", this.state.owner],
        ["Authorization", `token ${this.state.token}`]
      ]
    };

    return fetch(`https://api.github.com/${path}`, params);
  }

  async loadRepos() {
    try {
      let res = await this.getRequestGithub(`orgs/${this.state.owner}/repos`);
      if (res.status === 404) {
        res = await this.getRequestGithub(`users/${this.state.owner}/repos`);
      }
      const result = await res.json();
      const own = getNamesOfOwnRepositories(result);
      this.setState({
        repos: own
      });
    } catch (error) {
      console.error(error);
      this.setState({
        error
      });
    }
  }

  async getStatsFor(owner: string, repo: string) {
    const response = await this.getRequestGithub(
      `repos/${owner}/${repo}/stats/contributors`
    );

    return response.json();
  }

  private traceForAuthor(statsForAuthor: any) {
    return {
      type: "scatter",
      mode: "lines",
      name: statsForAuthor.author.login,
      x: statsForAuthor.weeks.map((week: any) => new Date(week.w * 1000)),
      y: statsForAuthor.weeks.map((week: any) => week.c)
    };
  }

  async handleSubmit(owner: string) {
    this.setState({ owner });
    await this.loadRepos();

    this.state.repos.map(async repo => {
      const stats = await this.getStatsFor(this.state.owner, repo);
      const data = stats.map((author: any) => this.traceForAuthor(author));
      this.setupGraph(repo, data);
      this.setupYearGraph(repo, stats);
    });
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
        <div>{this.state.repos.map(item => this.renderRepoGraph(item))}</div>
      </div>
    );
  }
}
