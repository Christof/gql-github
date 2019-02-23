import { PullRequest, ChangeCategory } from "../pull_request";
import { PullRequestChangeCategorySelector } from "./pull_request_change_category_selector";
import { Section } from "./section";
import { RepositorySelector } from "./repository_selector";
import { Markdown } from "./markdown";
import { Github } from "../github";
import * as React from "react";
import { DefaultGrid } from "./default_grid";
import { TagRangeSelector } from "./tag_range_selector";
import { ReleaseNote } from "./release_note";
import { LinearProgress } from "@material-ui/core";
import { unstable_createResource } from "react-cache";

function PullRequests(props: {
  pullRequests: PullRequest[];
  update: (pullRequests: PullRequest[]) => void;
}) {
  return (
    <>
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
    </>
  );
}

const tagsResource = unstable_createResource(
  (input: { repository: string; github: Github }) =>
    loadTags(input.repository, input.github)
);

interface State {
  pullRequests: PullRequest[];
  releaseTag?: string;
  releaseNote: string;
  releaseCreated: boolean;
  Markdown?: typeof Markdown;
}

interface Props {
  github: Github;
  repo: string;
}

export class ReleaseNotesCreatorSections extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      pullRequests: [],
      releaseNote: "",
      releaseCreated: false
    };

    import("./markdown").then(module =>
      this.setState({ Markdown: module.Markdown })
    );
  }

  async getCommits(startTag: string, releaseTag: string) {
    const result = await this.props.github.compare(
      this.props.repo,
      startTag,
      releaseTag
    );

    const pullRequestRegex = new RegExp(/Merge pull request/);
    const pullRequestMerges = result.commits.filter(commit =>
      commit.commit.message.match(pullRequestRegex)
    );
    const pullRequests = pullRequestMerges.map(commit =>
      PullRequest.parseFrom(commit.commit.message)
    );

    this.setState({ pullRequests, releaseTag });
    this.updateReleaseNote();
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

  renderSections() {
    const tagsData = tagsResource.read({
      repository: this.props.repo,
      github: this.props.github
    });

    return (
      <>
        <TagRangeSelector
          tags={tagsData.tags}
          defaultStartTag={tagsData.defaultStartTag}
          onSelect={(startTag: string, releaseTag: string) =>
            this.getCommits(startTag, releaseTag)
          }
        />
        {this.renderPullRequestsSection()}
        {this.renderReleaseNoteSection()}
      </>
    );
  }

  render() {
    return (
      <React.Suspense
        fallback={
          <Section heading="Range">
            <LinearProgress />
          </Section>
        }
      >
        {this.renderSections()}
      </React.Suspense>
    );
  }
}

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
  const [repository, setRepository] = React.useState(undefined as string);
  return (
    <DefaultGrid small>
      <RepositorySelector {...props} onRepositorySelect={setRepository} />
      <div>Repo {repository}</div>
      {repository && (
        <ReleaseNotesCreatorSections github={props.github} repo={repository} />
      )}
    </DefaultGrid>
  );
}
