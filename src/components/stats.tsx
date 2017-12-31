import * as React from "react";
import { FormEvent, ChangeEvent } from "react";
import { getNamesOfOwnRepositories } from "../stats_helper";

interface State {
  error: any;
  token: string;
  owner: string;
  repos: any[];
}

export class Stats extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      error: null,
      token: JSON.parse(window.localStorage.github).access_token,
      owner: "skillslab",
      repos: []
    };
    console.log("state", this.state);

    this.changeToken = this.changeToken.bind(this);
    this.changeOwner = this.changeOwner.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
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

  async handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await this.loadRepos();
    const stats = await this.getStatsFor(this.state.owner, this.state.repos[0]);
    console.log(stats);
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
      </div>
    );
  }
}
