import * as React from "react";
import { RepositorySelector } from "./repository_selector";
import { Markdown } from "./markdown";
import { Github, GithubRelease } from "../github";
import { Dropdown } from "./dropdown";
import { CopyToClipboard } from "./copy_to_clipboard";
import { Section } from "./section";
import { DefaultGrid } from "./default_grid";

interface State {
  repo?: string;
  releases?: GithubRelease[];
  release?: GithubRelease;
  releaseDescription?: string;
  Markdown?: typeof Markdown;
}

interface Props {
  github: Github;
}

export class ReleaseNotesRetriever extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};

    import("./markdown").then(module =>
      this.setState({ Markdown: module.Markdown })
    );
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
      <Section heading="Release Note">
        <Dropdown
          label="Release"
          options={this.state.releases.map(release => release.tagName)}
          onSelect={tagName => this.selectRelease(tagName)}
        />
      </Section>
    );
  }

  renderReleaseSection() {
    if (!this.state.releaseDescription || this.state.Markdown === undefined)
      return <section />;

    return (
      <ReleaseSection
        tagName={this.state.release.tagName}
        releaseDescription={this.state.releaseDescription}
        Markdown={this.state.Markdown}
      />
    );
  }

  render() {
    return (
      <DefaultGrid small>
        <RepositorySelector
          github={this.props.github}
          onRepositorySelect={repo => this.selectRepository(repo)}
        />
        {this.renderReleasesSection()}
        {this.renderReleaseSection()}
      </DefaultGrid>
    );
  }
}

function ReleaseSection(props: {
  releaseDescription: string;
  tagName: string;
  Markdown: typeof Markdown;
}) {
  return (
    <Section heading={props.tagName}>
      <props.Markdown source={props.releaseDescription} />
      <CopyToClipboard text={props.releaseDescription} />
    </Section>
  );
}
