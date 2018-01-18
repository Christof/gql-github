import * as React from "react";
import * as ReactMarkdown from "react-markdown";
import { Owner } from "./owner";
import { Github, GithubRelease } from "../github";
import { Dropdown } from "./dropdown";
import { CopyToClipboard } from "./copy_to_clipboard";

interface State {
  token: string;
  repositoryNames: string[];
  owner: string;
  github?: Github;
  repo?: string;
  releases?: GithubRelease[];
  release?: GithubRelease;
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

  async handleOwnerSubmit(owner: string) {
    const github = new Github(owner, this.state.token);
    const repositoryNames = await github.getRepositoryNames();
    this.setState({ owner, github, repositoryNames });
  }

  async selectRepository(repo: string) {
    const releases = await this.state.github.getReleases(repo);
    this.setState({ releases, repo });
  }

  renderRepositorySection() {
    if (!this.state.repo) return <section />;

    return (
      <section>
        <h1>{this.state.repo}</h1>
      </section>
    );
  }

  async selectRelease(tagName: string) {
    const release = this.state.releases.find(x => x.tag_name === tagName);

    this.setState({ releaseDescription: release.body, release });
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
        <Owner updateOwner={owner => this.handleOwnerSubmit(owner)} />
        {this.renderRepositorySelection()}
        {this.renderRepositorySection()}
        {this.renderReleasesSection()}
        {this.renderReleaseSection()}
      </div>
    );
  }
}
