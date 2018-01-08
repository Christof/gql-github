import * as React from "react";
import * as ReactMarkdown from "react-markdown";
import { Owner } from "./owner";
import { getRequestGithub, getRepositoryNames } from "../github";
import { Dropdown } from "./dropdown";
import { CopyToClipboard } from "./copy_to_clipboard";

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

  renderRepositorySection() {
    if (!this.state.repo) return <section />;

    return (
      <section>
        <h1>{this.state.repo}</h1>
      </section>
    );
  }

  async getRelease(release: any) {
    const response = await getRequestGithub(
      `repos/${this.state.owner}/${this.state.repo}/releases/${release.id}`,
      this.state.token
    );

    const releaseData = await response.json();

    this.setState({ releaseDescription: releaseData.body, release });
  }

  selectRelease(tagName: string) {
    const release = this.state.releases.find(x => x.tag_name === tagName);
    this.getRelease(release);
  }

  renderReleasesSection() {
    if (!this.state.repo || !this.state.releases) return <section />;

    return (
      <section>
        <Dropdown
          options={this.state.releases.map(release => release.tag_name)}
          onSelect={tagName => this.selectRelease(tagName)}
        />
      </section>
    );
  }

  renderReleaseSection() {
    if (!this.state.releaseDescription) return <section />;

    return (
      <section>
        <h1>{this.state.release.tag_name}</h1>
        <CopyToClipboard text={this.state.releaseDescription} />
        <ReactMarkdown source={this.state.releaseDescription} />
      </section>
    );
  }

  renderRepositorySelection() {
    if (this.state.repositoryNames.length === 0) {
      return <div />;
    }

    return (
      <Dropdown
        options={this.state.repositoryNames}
        onSelect={repo => this.selectRepository(repo)}
      />
    );
  }

  render() {
    return (
      <div>
        <Owner updateOwner={owner => this.handleSubmit(owner)} />
        {this.renderRepositorySelection()}
        {this.renderRepositorySection()}
        {this.renderReleasesSection()}
        {this.renderReleaseSection()}
      </div>
    );
  }
}
