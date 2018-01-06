import * as React from "react";
import { Owner } from "./owner";
import { getNamesOfOwnRepositories } from "../stats_helper";

interface State {
  token: string;
  repositoryNames: string[];
  owner: string;
  repo?: string;
  releases?: any[];
  release?: any;
  releaseDescription?: string;
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

  async loadReleases(repo: string) {
    const response = await this.getRequestGithub(
      `repos/${this.state.owner}/${repo}/releases`
    );
    const result = await response.json();
    this.setState({ releases: result });
  }

  selectRepository(repo: string) {
    this.setState({ repo: repo });
    return this.loadReleases(repo);
  }

  renderRepo(repo: string) {
    return (
      <li key={repo}>
        <button onClick={() => this.selectRepository(repo)}>{repo}</button>
      </li>
    );
  }

  renderRepositorySection() {
    if (!this.state.repo) return <section />;

    return (
      <section>
        <h1>{this.state.repo}</h1>
      </section>
    );
  }

  async selectRelease(release: any) {
    const response = await this.getRequestGithub(
      `repos/${this.state.owner}/${this.state.repo}/releases/${release.id}`
    );

    const releaseData = await response.json();

    this.setState({ releaseDescription: releaseData.body, release });
  }

  renderReleasesSection() {
    if (!this.state.repo || !this.state.releases) return <section />;

    return (
      <section>
        <ul>
          {this.state.releases.map(release => (
            <li key={release.id}>
              <button onClick={() => this.selectRelease(release)}>
                {release.tag_name}
              </button>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  renderReleaseSection() {
    if (!this.state.releaseDescription) return <section />;

    return (
      <section>
        <h1>{this.state.release.tag_name}</h1>
        <div>{this.state.releaseDescription}</div>
      </section>
    );
  }

  render() {
    return (
      <div>
        <Owner updateOwner={owner => this.handleSubmit(owner)} />
        <ul>{this.state.repositoryNames.map(repo => this.renderRepo(repo))}</ul>
        {this.renderRepositorySection()}
        {this.renderReleasesSection()}
        {this.renderReleaseSection()}
      </div>
    );
  }
}
