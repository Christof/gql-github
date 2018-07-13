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

interface Props {
  github: Github;
  Markdown: typeof Markdown;
  releases: GithubRelease[];
}

export class ReleasesSelectorAndView extends React.Component<Props> {
  async selectRelease(tagName: string) {
    const release = this.props.releases.find(x => x.tagName === tagName);

    const releaseDescription = `# ${release.tagName}\n\n${
      release.description
    }\n`;
    return { releaseDescription, release, Markdown: this.props.Markdown };
  }

  render() {
    return (
      <ReleasesToRelease
        label="Release"
        options={this.props.releases.map(release => release.tagName)}
        onLoad={(tagName: string) => this.selectRelease(tagName)}
      />
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

const ReleasesToRelease = triggeredAsyncSwitch(
  ReleaseSelector,
  "onSelect",
  progressToContentSwitch(ReleaseSection)
);

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
