import * as React from "react";
import { FormEvent, ChangeEvent } from "react";
import { getNamesOfOwnRepositories } from "../stats_helper";
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
    console.log("state", this.state);

    this.changeToken = this.changeToken.bind(this);
    this.changeOwner = this.changeOwner.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  setupGraph() {
    const layout = {
      title: "Commits",
      xaxis: {
        autorange: true,
        // range: ['2015-02-17', '2017-02-16'],
        rangeselector: {
          buttons: [
            {
              count: 1,
              label: "1m",
              step: "month",
              stepmode: "backward"
            },
            {
              count: 6,
              label: "6m",
              step: "month",
              stepmode: "backward"
            },
            { step: "all" }
          ]
        },
        rangeslider: { range: [new Date(2013), new Date(2017)] as any },
        type: "date"
      },
      yaxis: {
        autorange: true,
        // range: [86.8700008333, 138.870004167],
        type: "linear"
      }
    };

    Plotly.newPlot("graph", this.state.data, layout as any);
  }

  componentDidMount() {
    this.setupGraph();
  }
  getRequestGithub(path: string) {
    console.log("Get", path, this.state.token);
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
      console.log(own);
      this.setState({
        repos: own
      });
    } catch (error) {
      console.log(error);
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
  async handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await this.loadRepos();
    const stats = await this.getStatsFor(this.state.owner, this.state.repos[0]);
    console.log(stats);

    this.setState({
      data: stats.map((author: any) => this.traceForAuthor(author))
    });
    this.setupGraph();
  }

  changeToken(event: ChangeEvent<HTMLInputElement>) {
    this.setState({
      token: event.target.value
    });
  }

  changeOwner(event: ChangeEvent<HTMLInputElement>) {
    this.setState({
      owner: event.target.value
    });
  }
  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>
            TOKEN:
            <input
              type="text"
              value={this.state.token}
              onChange={this.changeToken}
            />
          </label>
          <label>
            Owner
            <input
              type="text"
              value={this.state.owner}
              onChange={this.changeOwner}
            />
          </label>
          <input type="submit" value="Submit" />
        </form>

        <h2>Own repositories</h2>
        <ul>{this.state.repos.map(item => <li key={item}>{item}</li>)}</ul>

        <div id="graph" />
      </div>
    );
  }
}
