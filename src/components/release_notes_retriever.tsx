import * as React from "react";
import { RepositorySelector } from "./repository_selector";
import { Markdown } from "./markdown";
import { Github, GithubRelease } from "../github";
import { Dropdown } from "./dropdown";
import { CopyToClipboard } from "./copy_to_clipboard";
import { Section } from "./section";
import { DefaultGrid } from "./default_grid";
import {
  triggeredAsyncSwitch,
  awaitAllProperties,
  progressToContentSwitch,
  TriggeredAsyncSwitchFromLoadType
} from "./triggered_async_switch";
import { LinearProgress } from "material-ui";

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

function Release(props: {
  releaseDescription: string;
  Markdown: typeof Markdown;
}) {
  return (
    <>
      <props.Markdown source={props.releaseDescription} />
      <CopyToClipboard text={props.releaseDescription} />
    </>
  );
}

const ReleasesToRelease = triggeredAsyncSwitch(
  Dropdown,
  "onSelect",
  progressToContentSwitch(Release)
);

function loadReleasesForRepo(github: Github, repository: string) {
  const releases = github.getReleases(repository);
  const Markdown = import("./markdown").then(module => module.Markdown);

  return awaitAllProperties({ releases, Markdown });
}

export function ReleaseNotesRetriever(props: { github: Github }) {
  return (
    <DefaultGrid small>
      <TriggeredAsyncSwitchFromLoadType<typeof loadReleasesForRepo>
        renderTrigger={triggerCallback => (
          <RepositorySelector
            github={props.github}
            onRepositorySelect={repository =>
              triggerCallback(loadReleasesForRepo(props.github, repository))
            }
          />
        )}
        renderTriggered={loadedProps => (
          <Section heading="Releases">
            {loadedProps === undefined ? (
              <LinearProgress />
            ) : (
              <ReleasesSelectorAndView github={props.github} {...loadedProps} />
            )}
          </Section>
        )}
      />
    </DefaultGrid>
  );
}
