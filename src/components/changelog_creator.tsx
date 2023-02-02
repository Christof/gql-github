import { PullRequest } from "../pull_request";
import { Section } from "./section";
import { RepositorySelector } from "./repository_selector";
import { Markdown } from "./markdown";
import { Github, GithubTag, GithubCommit } from "../github";
import { filterPullRequestMergeCommits } from "../github_helper";
import * as React from "react";
import { DefaultGrid } from "./default_grid";
import { TriggeredAsyncSwitchFromLoadType } from "./triggered_async_switch";
import { TagRangeSelector } from "./tag_range_selector";
import { ReleaseNote } from "./release_note";
import { LinearProgress, Button, Typography, Grid } from "@material-ui/core";
import { groupBy, reverse } from "ramda";

/*
function PullRequests(props: {
  pullRequests: PullRequest[];
  update: (pullRequests: PullRequest[]) => void;
}) {
  if (props.pullRequests.length === 0) {
    return (
      <Typography variant="body1" color="error" align="right" display="inline">
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
*/

interface PullRequestWithLabels {
  id: number;
  title: string;
  body: string;
  bodyHTML: string;
  labels: { name: string; color: string }[];
}
interface State {
  pullRequests: Record<"bugfixes" | "features", PullRequestWithLabels[]>;
  releaseTag?: string;
  releaseNote: string;
  releaseCreated: boolean;
  Markdown?: typeof Markdown;
}

interface Props {
  github: Github;
  repo: string;
  lastMasterReleaseTag?: string;
  tags?: GithubTag[];
}

export class ChangeLogCreatorSections extends React.Component<Props, State> {
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

  async parseCommitsForPullRequests(
    commits: GithubCommit[],
    releaseTag: string
  ) {
    const pullRequests = filterPullRequestMergeCommits(commits).map(commit =>
      PullRequest.parseFrom(commit.commit.message)
    );
    const pullRequestsWithLabels: PullRequestWithLabels[] = await Promise.all(
      pullRequests.map(pr =>
        this.props.github.getPullRequestWithLabels(
          this.props.repo,
          parseInt(pr.id)
        )
      )
    );
    const filteredPullRequests = pullRequestsWithLabels.filter(
      pr => !pr.labels.some(label => label.name === "dependencies")
    );

    const groupedPullRequests = groupBy(
      pr =>
        pr.labels.some(label => label.name === "bugfix" || label.name === "bug")
          ? "bugfixes"
          : "features",
      reverse(filteredPullRequests)
    );

    this.setState({ pullRequests: groupedPullRequests, releaseTag });
    this.updateReleaseNote();
  }

  /*
  appendChangeCategory(category: ChangeCategory, releaseNote = "") {
    const pullRequests = this.state.pullRequests.filter(
      pullRequest => pullRequest.changeCategory === category
    );

    if (pullRequests.length === 0) return releaseNote;

    const innerText = pullRequests.join("\n");
    return `${releaseNote}**${category} Changes:**\n\n${innerText}\n\n`;
  }
  */

  updateReleaseNote() {
    // this.setState({ releaseNote });
  }

  renderPullRequestsSection() {
    if (this.state.pullRequests === undefined) return <section />;

    return (
      <Section heading="Read PRs">
        <div id="section-to-print">
          <h1>New features</h1>
          <ul>
            {this.state.pullRequests.features.map(pr =>
              this.renderPullRequest(pr)
            )}
          </ul>
          <h1>Bugfixes</h1>
          <ul>
            {this.state.pullRequests.features.map(pr =>
              this.renderPullRequest(pr)
            )}
          </ul>
        </div>
      </Section>
    );
  }

  renderPullRequest(pr: PullRequestWithLabels) {
    return (
      <li key={pr.id}>
        <span style={{ marginRight: "1rem", fontWeight: "bold" }}>
          {pr.title}
        </span>
        {this.createPRContent(pr.body)}
      </li>
    );
  }

  private descriptionIdentifier = "# Description";
  private descriptionRegex = new RegExp(
    `${this.descriptionIdentifier}(.*?)#`,
    "s"
  );

  createPRContent(body: string) {
    if (!body.trim().startsWith(this.descriptionIdentifier)) {
      console.log(body);
      return <Markdown source={body} />;
    }

    const match = body.match(this.descriptionRegex) || ["", ""];

    return <Markdown source={match[1]?.trim() || ""} />;
  }

  renderReleaseNoteSection() {
    if (
      this.state.releaseNote.length === 0 ||
      this.state.Markdown === undefined
    )
      return <section />;

    return (
      <Section heading="Changelog">
        <ReleaseNote {...this.props} {...(this.state as any)} />
      </Section>
    );
  }

  private renderButtonForSingleTag() {
    return (
      <Grid container alignItems="baseline" spacing={2}>
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
      </Grid>
    );
  }

  renderNoTagsNotice() {
    return (
      <Typography variant="body1" color="error" align="right" display="inline">
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
            defaultStartTag={this.props.lastMasterReleaseTag}
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

export function ChangelogCreator(props: { github: Github }) {
  return (
    <DefaultGrid small>
      <TriggeredAsyncSwitchFromLoadType<typeof props.github.loadTags>
        renderTrigger={callback => (
          <RepositorySelector
            {...props}
            onRepositorySelect={repository =>
              callback(props.github.loadTags(repository))
            }
          />
        )}
        renderTriggered={triggeredProps =>
          triggeredProps === undefined ? (
            <Section heading="Range">
              <LinearProgress />
            </Section>
          ) : (
            <ChangeLogCreatorSections {...triggeredProps} />
          )
        }
      />
    </DefaultGrid>
  );
}
