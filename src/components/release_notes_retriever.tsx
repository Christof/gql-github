import * as React from "react";
import * as ReactMarkdown from "react-markdown";
import { RepositorySelector } from "./repository_selector";
import { Github, GithubRelease } from "../github";
import { Dropdown } from "./dropdown";
import { CopyToClipboard } from "./copy_to_clipboard";
import { Grid } from "material-ui";

interface State {
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
      github: new Github(this.props.token)
    };
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

  render() {
    return (
      <Grid container spacing={24} justify="center">
        <Grid item xs={12} md={10} lg={8}>
          <RepositorySelector
            github={this.state.github}
            onRepositorySelect={repo => this.selectRepository(repo)}
          />
          {this.renderRepositorySection()}
          {this.renderReleasesSection()}
          {this.renderReleaseSection()}
        </Grid>
      </Grid>
    );
  }
}
