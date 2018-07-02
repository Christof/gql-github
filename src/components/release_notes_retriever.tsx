import * as React from "react";
import { RepositorySelector } from "./repository_selector";
import { Markdown } from "./markdown";
import { Github, GithubRelease } from "../github";
import { Dropdown } from "./dropdown";
import { CopyToClipboard } from "./copy_to_clipboard";
import { Section } from "./section";
import { DefaultGrid } from "./default_grid";
import {
  container,
  triggeredAsyncSwitch,
  awaitAllProperties,
  progressToContentSwitch
} from "./triggered_async_switch";

interface State {
  release?: GithubRelease;
  releaseDescription?: string;
}

interface Props {
  github: Github;
  Markdown: typeof Markdown;
  releases: GithubRelease[];
}

export class ReleasesSelectorAndView extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  async selectRelease(tagName: string) {
    const release = this.props.releases.find(x => x.tagName === tagName);

    const releaseDescription = `# ${release.tagName}\n\n${
      release.description
    }\n`;
    this.setState({ releaseDescription, release });
  }

  renderReleasesSection() {
    return (
      <ReleaseSelector
        label="Release"
        options={this.props.releases.map(release => release.tagName)}
        onSelect={tagName => this.selectRelease(tagName)}
      />
    );
  }

  renderReleaseSection() {
    if (!this.state.releaseDescription) return <section />;

    return (
      <ReleaseSection
        tagName={this.state.release.tagName}
        releaseDescription={this.state.releaseDescription}
        Markdown={this.props.Markdown}
      />
    );
  }

  render() {
    return (
      <>
        {this.renderReleasesSection()}
        {this.renderReleaseSection()}
      </>
    );
  }
}

const ReleaseSelector = container(
  Section,
  { heading: "ReleaseNote" },
  Dropdown
);

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

const RepsitorySelectionToReleasesSelectorAndView = triggeredAsyncSwitch(
  RepositorySelector,
  "onRepositorySelect",
  progressToContentSwitch(ReleasesSelectorAndView)
);

function loadReleasesForRepo(github: Github, repository: string) {
  const releases = github.getReleases(repository);
  const Markdown = import("./markdown").then(module => module.Markdown);

  return awaitAllProperties({ releases, Markdown, github });
}

export function ReleaseNotesRetriever(props: { github: Github }) {
  return (
    <DefaultGrid small>
      <RepsitorySelectionToReleasesSelectorAndView
        github={props.github}
        onLoad={(repository: string) =>
          loadReleasesForRepo(props.github, repository)
        }
      />
    </DefaultGrid>
  );
}
