import { PullRequest, ChangeCategory } from "../pull_request";
import { PullRequestChangeCategorySelector } from "./pull_request_change_category_selector";
import { Section } from "./section";
import { RepositorySelector } from "./repository_selector";
import { Markdown } from "./markdown";
import { Github, GithubTag, GithubCommit } from "../github";
import * as React from "react";
import { DefaultGrid } from "./default_grid";
import { TriggeredAsyncSwitchFromLoadType } from "./triggered_async_switch";
import { TagRangeSelector } from "./tag_range_selector";
import { ReleaseNote } from "./release_note";
import { LinearProgress, Button, Typography, Grid } from "@material-ui/core";

function PullRequests(props: {
  pullRequests: PullRequest[];
  update: (pullRequests: PullRequest[]) => void;
}) {
  if (props.pullRequests.length === 0) {
    return (
      <Typography variant="body1" color="error" align="right" inline>
        There are no merged PRs between the selected tags or the release tag is
        before the start tag.
      </Typography>
    );
  }

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
  defaultStartTag?: string;
  tags?: GithubTag[];
}

export class ReleaseNotesCreatorSections extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      pullRequests: undefined,
      releaseNote: "",
      releaseCreated: false
    };

    import("./markdown").then(module =>
      this.setState({ Markdown: module.Markdown })
    );
  }

  async compare(startTag: string, releaseTag: string) {
    const result = await this.props.github.compare(
      this.props.repo,
      startTag,
      releaseTag
    );

    return result.commits;
  }

  async getCommits() {
    return await this.props.github.getCommits(this.props.repo);
  }

  parseCommitsForPullRequests(commits: GithubCommit[], releaseTag: string) {
    const pullRequestRegex = new RegExp(/Merge pull request/);
    const pullRequestMerges = commits.filter(commit =>
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
    if (this.state.pullRequests === undefined) return <section />;

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

  private renderButtonForSingleTag() {
    return (
      <Grid container alignItems="baseline" spacing={16}>
        <Grid item>
          <Button
            variant="contained"
            onClick={async () => {
              const commits = await this.getCommits();
              this.parseCommitsForPullRequests(
                commits,
                this.props.tags[0].name
              );
            }}
          >
            Get merged PRs
          </Button>
        </Grid>
        <Grid item>
          <Typography
            variant="body1"
            color="textSecondary"
            align="right"
            inline
          >
            Uses only last 100 commits up to the only tag
          </Typography>
        </Grid>
      </Grid>
    );
  }

  renderNoTagsNotice() {
    return (
      <Typography variant="body1" color="error" align="right" inline>
        There are no existing tags in this repository. They are required to
        create release notes.
      </Typography>
    );
  }

  render() {
    return (
      <Section heading="Range">
        {this.props.tags !== undefined && this.props.tags.length > 1 ? (
          <TagRangeSelector
            tags={this.props.tags}
            defaultStartTag={this.props.defaultStartTag}
            onSelect={async (startTag: string, releaseTag: string) => {
              const commits = await this.compare(startTag, releaseTag);
              this.parseCommitsForPullRequests(commits, releaseTag);
            }}
          />
        ) : this.props.tags === undefined || this.props.tags.length === 0 ? (
          this.renderNoTagsNotice()
        ) : (
          this.renderButtonForSingleTag()
        )}

        {this.renderPullRequestsSection()}
        {this.renderReleaseNoteSection()}
      </Section>
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
  return (
    <DefaultGrid small>
      <TriggeredAsyncSwitchFromLoadType<typeof loadTags>
        renderTrigger={callback => (
          <RepositorySelector
            {...props}
            onRepositorySelect={repository =>
              callback(loadTags(repository, props.github))
            }
          />
        )}
        renderTriggered={triggeredProps =>
          triggeredProps === undefined ? (
            <Section heading="Range">
              <LinearProgress />
            </Section>
          ) : (
            <ReleaseNotesCreatorSections {...triggeredProps} />
          )
        }
      />
    </DefaultGrid>
  );
}
