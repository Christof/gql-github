import { PullRequest, ChangeCategory } from "../pull_request";
import { PullRequestChangeCategorySelector } from "./pull_request_change_category_selector";
import { Dropdown } from "./dropdown";
import { Section } from "./section";
import { RepositorySelector } from "./repository_selector";
import { Markdown } from "./markdown";
import { Github, GithubTag } from "../github";
import * as React from "react";
import { Button, Snackbar, Slide } from "material-ui";
import { SlideProps } from "material-ui/transitions";
import { DefaultGrid } from "./default_grid";
import {
  progressToContentSwitch,
  triggeredAsyncSwitch
} from "./triggered_async_switch";

export function TransitionLeft(props: SlideProps) {
  return <Slide direction="left" {...props} />;
}

function withSnackbar<P extends Object>(
  Component: React.ComponentType<P>,
  asyncTrigger: keyof P
) {
  return class ComponentWithSnackbar extends React.Component<
    P,
    { showSnackbar: boolean }
  > {
    constructor(props: P) {
      super(props);
      this.state = { showSnackbar: false };
    }

    render() {
      const props = Object.assign({}, this.props, {
        [asyncTrigger]: (...params: any[]) => {
          (this.props[asyncTrigger] as any)(params).then((result: any) => {
            this.setState({ showSnackbar: true });
            return result;
          });
        }
      });

      return (
        <div>
          <Component {...props} />
          <Snackbar
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            autoHideDuration={2000}
            TransitionComponent={TransitionLeft}
            onClose={() => this.setState({ showSnackbar: false })}
            open={this.state.showSnackbar}
            message={<span>Release created</span>}
          />
        </div>
      );
    }
  };
}

const ButtonWithSnackbar = withSnackbar(Button, "onClick");

function PullRequests(props: {
  pullRequests: PullRequest[];
  update: (pullRequests: PullRequest[]) => void;
}) {
  return (
    <div>
      {props.pullRequests.map((pullRequest, index) => (
        <PullRequestChangeCategorySelector
          key={pullRequest.id}
          pullRequest={pullRequest}
          onChange={updatedPullRequest => {
            const pullRequests = [...props.pullRequests];
            pullRequests[index] = updatedPullRequest;
            props.update(pullRequests);
          }}
        />
      ))}
    </div>
  );
}

interface ReleaseNoteProps {
  releaseNote: string;
  Markdown: typeof Markdown;
  releaseTag: string;
  repo: string;
  github: Github;
}

class ReleaseNote extends React.Component<ReleaseNoteProps, {}> {
  async postRelease() {
    const release = {
      tag_name: this.props.releaseTag,
      target_commitish: "master",
      name: this.props.releaseTag,
      body: this.props.releaseNote,
      draft: false,
      prerelease: false
    };

    const response = await this.props.github.postRelease(
      this.props.repo,
      release
    );

    if (!response.ok) {
      throw Error(
        `Release could not be posted: status code ${
          response.status
        }, status text ${response.statusText}`
      );
    }
  }

  render() {
    return (
      <div>
        <this.props.Markdown source={this.props.releaseNote} />
        <ButtonWithSnackbar variant="raised" onClick={() => this.postRelease()}>
          Create Release
        </ButtonWithSnackbar>
      </div>
    );
  }
}

interface State {
  repositoryNames: string[];
  startTag?: string;
  releaseTag?: string;
  pullRequests: PullRequest[];
  releaseNote: string;
  releaseCreated: boolean;
  Markdown?: typeof Markdown;
}

interface Props {
  github: Github;
  repo: string;
  repositoryNames: string[];
  defaultStartTag?: string;
  tags?: GithubTag[];
}

export class ReleaseNotesCreatorSections extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      repositoryNames: [],
      pullRequests: [],
      startTag: props.defaultStartTag,
      releaseNote: "",
      releaseCreated: false
    };

    import("./markdown").then(module =>
      this.setState({ Markdown: module.Markdown })
    );
  }

  async getCommits() {
    const result = await this.props.github.compare(
      this.props.repo,
      this.state.startTag,
      this.state.releaseTag
    );

    const pullRequestRegex = new RegExp(/Merge pull request/);
    const pullRequestMerges = result.commits.filter(commit =>
      commit.commit.message.match(pullRequestRegex)
    );
    const pullRequests = pullRequestMerges.map(commit =>
      PullRequest.parseFrom(commit.commit.message)
    );

    this.setState({ pullRequests });
    this.updateReleaseNote();
  }

  renderTagsSection() {
    const tagNames = this.props.tags.map(tag => tag.name);
    const disabledGetPRsButton =
      this.state.startTag === undefined || this.state.releaseTag === undefined;
    return (
      <Section heading="Range">
        <Dropdown
          label="Start Tag"
          options={tagNames}
          initialSelection={this.props.defaultStartTag}
          onSelect={tagName => this.setState({ startTag: tagName })}
        />
        <Dropdown
          label="End Tag"
          options={tagNames}
          onSelect={tagName => this.setState({ releaseTag: tagName })}
        />
        <Button
          variant="raised"
          onClick={() => this.getCommits()}
          disabled={disabledGetPRsButton}
        >
          Get merged PRs in range
        </Button>
      </Section>
    );
  }
  appendChangeCategory(category: ChangeCategory, releaseNote = "") {
    const pullRequests = this.state.pullRequests.filter(
      pullRequest => pullRequest.changeCategory === category
    );

    if (pullRequests.length === 0) return releaseNote;

    const innerText = pullRequests.join("\n");
    return `${releaseNote}**${category} Changes:**\n\n${innerText}\n\n`;
  }

  updateReleaseNote() {
    let releaseNote = this.appendChangeCategory(ChangeCategory.Breaking);
    releaseNote = this.appendChangeCategory(ChangeCategory.Basic, releaseNote);
    releaseNote = this.appendChangeCategory(
      ChangeCategory.Training,
      releaseNote
    );
    this.setState({ releaseNote });
  }

  renderPullRequestsSection() {
    if (this.state.pullRequests.length === 0) return <section />;

    return (
      <Section heading="Adjust Categories">
        <PullRequests
          pullRequests={this.state.pullRequests}
          update={(pullRequests: PullRequest[]) =>
            this.setState({ pullRequests }, () => this.updateReleaseNote())
          }
        />
      </Section>
    );
  }

  renderReleaseNoteSection() {
    if (
      this.state.releaseNote.length === 0 ||
      this.state.Markdown === undefined
    )
      return <section />;

    return (
      <Section heading="Release Note">
        <ReleaseNote {...this.props} {...this.state as any} />
      </Section>
    );
  }

  render() {
    return (
      <div>
        {this.renderTagsSection()}
        {this.renderPullRequestsSection()}
        {this.renderReleaseNoteSection()}
      </div>
    );
  }
}

const TriggeredReleaseNotesCreatorSections = triggeredAsyncSwitch(
  RepositorySelector,
  "onRepositorySelect",
  progressToContentSwitch(ReleaseNotesCreatorSections)
);

async function loadTags(repo: string, github: Github) {
  const tags = await github.getTags(repo);
  const releases = await github.getReleases(repo);
  const firstMasterRelease = releases.find(
    release => !release.tagName.includes("_")
  );

  const defaultStartTag = firstMasterRelease
    ? firstMasterRelease.tagName
    : undefined;

  return {
    repo,
    tags,
    defaultStartTag,
    github
  };
}

export function ReleaseNotesCreator(props: { github: Github }) {
  return (
    <DefaultGrid small>
      <TriggeredReleaseNotesCreatorSections
        github={props.github}
        onLoad={(repository: string) => loadTags(repository, props.github)}
      />
    </DefaultGrid>
  );
}
