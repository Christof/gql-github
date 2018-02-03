import * as React from "react";
import { RepositorySelector } from "./repository_selector";
import { Markdown } from "./markdown";
import { Github, GithubRelease } from "../github";
import { Dropdown } from "./dropdown";
import { CopyToClipboard } from "./copy_to_clipboard";
import { Grid, Typography } from "material-ui";
import { Section } from "./section";

interface State {
  repo?: string;
  releases?: GithubRelease[];
  release?: GithubRelease;
  releaseDescription?: string;
}

interface Props {
  github: Github;
}

export class ReleaseNotesRetriever extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  async selectRepository(repo: string) {
    const releases = await this.props.github.getReleases(repo);
    this.setState({ releases, repo });
  }

  async selectRelease(tagName: string) {
    const release = this.state.releases.find(x => x.tagName === tagName);

    const releaseDescription = `# ${release.tagName}\n\n${
      release.description
    }\n`;
    this.setState({ releaseDescription, release });
  }

  renderReleasesSection() {
    if (!this.state.repo || !this.state.releases) return <section />;

    return (
      <Section>
        <Typography type="headline" paragraph>
          Release Note
        </Typography>
        <Dropdown
          label="Release"
          options={this.state.releases.map(release => release.tagName)}
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
          {this.state.release.tagName}
        </Typography>
        <Markdown source={this.state.releaseDescription} />
        <CopyToClipboard text={this.state.releaseDescription} />
      </Section>
    );
  }

  render() {
    return (
      <Grid container spacing={24} justify="center">
        <Grid item xs={12} md={10} lg={8}>
          <RepositorySelector
            github={this.props.github}
            onRepositorySelect={repo => this.selectRepository(repo)}
          />
          {this.renderReleasesSection()}
          {this.renderReleaseSection()}
        </Grid>
      </Grid>
    );
  }
}
