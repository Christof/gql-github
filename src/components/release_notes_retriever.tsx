import * as React from "react";
import * as ReactMarkdown from "react-markdown";
import { RepositorySelector } from "./repository_selector";
import { Github, GithubRelease } from "../github";
import { Dropdown } from "./dropdown";
import { CopyToClipboard } from "./copy_to_clipboard";
import { Grid, Typography } from "material-ui";
import { Section } from "./section";

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

  async selectRelease(tagName: string) {
    const release = this.state.releases.find(x => x.tag_name === tagName);

    this.setState({ releaseDescription: release.body, release });
  }

  renderReleasesSection() {
    if (!this.state.repo || !this.state.releases) return <section />;

    return (
      <Section>
        <Typography type="headline" paragraph>
          {this.state.repo}
        </Typography>
        <Dropdown
          label="Release"
          options={this.state.releases.map(release => release.tag_name)}
          onSelect={tagName => this.selectRelease(tagName)}
        />
      </Section>
    );
  }

  renderReleaseSection() {
    if (!this.state.releaseDescription) return <section />;

    return (
      <Section>
        <Typography type="headline" paragraph>
          {this.state.release.tag_name}
        </Typography>
        <div style={{ fontFamily: "Roboto, Helvetica, Arial, sans-serif" }}>
          <ReactMarkdown source={this.state.releaseDescription} />
        </div>
        <CopyToClipboard text={this.state.releaseDescription} />
      </Section>
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
          {this.renderReleasesSection()}
          {this.renderReleaseSection()}
        </Grid>
      </Grid>
    );
  }
}
