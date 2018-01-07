import * as React from "react";
import * as ReactMarkdown from "react-markdown";
import { Owner } from "./owner";
import { getRequestGithub, getRepositoryNames } from "../github";

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
    this.loadRepos(owner);
  }

  async loadRepos(owner: string) {
    try {
      const repositoryNames = await getRepositoryNames(owner, this.state.token);
      this.setState({
        repositoryNames
      });
    } catch (error) {
      console.error(error);
    }
  }

  async loadReleases(repo: string) {
    const response = await getRequestGithub(
      `repos/${this.state.owner}/${repo}/releases`,
      this.state.token
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
    const response = await getRequestGithub(
      `repos/${this.state.owner}/${this.state.repo}/releases/${release.id}`,
      this.state.token
    );

    const releaseData = await response.json();

    this.setState({ releaseDescription: releaseData.body, release });
  }

  renderRelease(release: any) {
    return (
      <li key={release.id}>
        <button onClick={() => this.selectRelease(release)}>
          {release.tag_name}
        </button>
      </li>
    );
  }

  renderReleasesSection() {
    if (!this.state.repo || !this.state.releases) return <section />;

    return (
      <section>
        <ul>
          {this.state.releases.map(release => this.renderRelease(release))}
        </ul>
      </section>
    );
  }

  renderReleaseSection() {
    if (!this.state.releaseDescription) return <section />;

    return (
      <section>
        <h1>{this.state.release.tag_name}</h1>
        <ReactMarkdown source={this.state.releaseDescription} />
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
