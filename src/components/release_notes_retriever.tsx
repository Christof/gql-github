import * as React from "react";
import { Owner } from "./owner";
import { getNamesOfOwnRepositories } from "../stats_helper";

interface State {
  token: string;
  repositoryNames: string[];
  owner: string;
  selectedRepository?: string;
}

export class ReleaseNotesRetriever extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      owner: "skillslab",
      repositoryNames: [],
      token: JSON.parse(window.localStorage.github).access_token
    };
  }

  handleSubmit(owner: string) {
    this.setState({ owner });
    this.loadRepos();
  }

  getRequestGithub(path: string) {
    const params: RequestInit = {
      method: "GET",
      mode: "cors",
      headers: [["Authorization", `token ${this.state.token}`]]
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
        repositoryNames: own
      });
    } catch (error) {
      console.error(error);
    }
  }

  renderRepo(repo: string) {
    return (
      <li key={repo}>
        <button onClick={() => this.setState({ selectedRepository: repo })}>
          {repo}
        </button>
      </li>
    );
  }

  renderRepositorySection() {
    if (!this.state.selectedRepository) return <section />;

    return (
      <section>
        <h1>{this.state.selectedRepository}</h1>
      </section>
    );
  }
  render() {
    return (
      <div>
        <Owner updateOwner={owner => this.handleSubmit(owner)} />
        <ul>{this.state.repositoryNames.map(repo => this.renderRepo(repo))}</ul>
        {this.renderRepositorySection()}
      </div>
    );
  }
}
