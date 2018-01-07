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

  async getRelease(release: any) {
    const response = await getRequestGithub(
      `repos/${this.state.owner}/${this.state.repo}/releases/${release.id}`,
      this.state.token
    );

    const releaseData = await response.json();

    this.setState({ releaseDescription: releaseData.body, release });
  }

  selectRelease(event: React.ChangeEvent<HTMLSelectElement>) {
    event.preventDefault();

    this.getRelease(this.state.releases[Number(event.target.value)]);
  }

  renderRelease(release: any, index: number) {
    return (
      <option key={index} value={index}>
        {release.tag_name}
      </option>
    );
  }

  renderReleasesSection() {
    if (!this.state.repo || !this.state.releases) return <section />;

    return (
      <section>
        <select
          style={{ width: "100px" }}
          onChange={event => this.selectRelease(event)}
        >
          {this.state.releases.map((release, index) =>
            this.renderRelease(release, index)
          )}
        </select>
      </section>
    );
  }

  copyToClipboard() {
    const range = document.createRange();
    const selection = document.getSelection();
    const copyText = document.getElementById("textToCopy");
    range.selectNode(copyText);
    selection.addRange(range);
    document.execCommand("Copy");
  }

  renderReleaseSection() {
    if (!this.state.releaseDescription) return <section />;

    return (
      <section>
        <h1>{this.state.release.tag_name}</h1>
        <span
          style={{
            userSelect: "text",
            whiteSpace: "pre",
            position: "absolute",
            clip: "rect(0, 0, 0, 0)"
          }}
          id="textToCopy"
        >
          {this.state.releaseDescription}
        </span>
        <button onClick={() => this.copyToClipboard()}>Copy</button>
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
