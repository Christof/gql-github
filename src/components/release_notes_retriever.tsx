import * as React from "react";
import * as ReactMarkdown from "react-markdown";
import { Github, GithubRelease } from "../github";
import { Dropdown } from "./dropdown";
import { CopyToClipboard } from "./copy_to_clipboard";

interface State {
  repositoryNames: string[];
  owners: string[];
  github: Github;
  repo?: string;
  releases?: GithubRelease[];
  release?: GithubRelease;
  releaseDescription?: string;
}

interface Props {
  token: string;
}

export class ReleaseNotesRetriever extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      owners: [],
      repositoryNames: [],
      github: new Github(this.props.token)
    };

    this.state.github.getOwners().then(owners => this.setState({ owners }));
  }

  async selectOwner(owner: string) {
    this.state.github.owner = owner;
    const repositoryNames = await this.state.github.getRepositoryNames();
    this.setState({ repositoryNames });
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
          label="Release"
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
        label="Repository"
        options={this.state.repositoryNames}
        onSelect={repo => this.selectRepository(repo)}
      />
    );
  }

  render() {
    return (
      <div>
        <Dropdown
          label="Owner"
          options={this.state.owners}
          onSelect={owner => this.selectOwner(owner)}
        />
        {this.renderRepositorySelection()}
        {this.renderRepositorySection()}
        {this.renderReleasesSection()}
        {this.renderReleaseSection()}
      </div>
    );
  }
}
