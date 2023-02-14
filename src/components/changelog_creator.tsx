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
import { LinearProgress, Typography } from "@material-ui/core";
import { groupBy, reverse } from "ramda";

interface PullRequestWithLabels {
  id: number;
  title: string;
  body: string;
  bodyHTML: string;
  labels: { name: string; color: string }[];
}
interface State {
  pullRequests: Record<"bugfixes" | "features", PullRequestWithLabels[]>;
  startTag?: string;
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
    startTag: string,
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

    this.setState({ pullRequests: groupedPullRequests, startTag, releaseTag });
  }

  renderPullRequestsSection() {
    if (this.state.pullRequests === undefined) return <section />;

    const str = `# Changelog for ${
      this.props.repo
    }\n\n The changelog is from version ${this.state.startTag} to ${
      this.state.releaseTag
    }\n\n## New features\n\n${this.state.pullRequests.features
      .map(pr => this.renderPullRequest(pr))
      .join("\n\n")}`;

    return (
      <div>
        <textarea style={{ width: "100%" }} defaultValue={str}></textarea>
        <div id="section-to-print" style={{ contain: "content" }}>
          <Markdown source={str} />
        </div>
      </div>
    );
  }

  renderPullRequest(pr: PullRequestWithLabels) {
    return `### ${pr.title}\n\n${this.createPRContent(pr.body)}`;
  }

  private descriptionIdentifier = "# Description";
  private descriptionRegex = new RegExp(
    `${this.descriptionIdentifier}(.*?)#`,
    "s"
  );

  createPRContent(body: string) {
    const filtered = body
      .replace(/^- \[[xX ]\].*\n?$/gm, "")
      .replace(
        /(?<!\]\()https:\/\/jira.anton-paar.com\/browse\/(.*?)(\s|$)/gs,
        "[$1](https://jira.anton-paar.com/browse/$1)"
      );
    if (!filtered.trim().startsWith(this.descriptionIdentifier)) {
      return filtered;
    }

    const match = filtered.match(this.descriptionRegex) || ["", ""];

    return match[1]?.trim() || "";
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
      <Typography variant="body1" color="error" align="right" display="inline">
        There is only one tag in this repository. They are multiple tags
        required to create a changelog.
      </Typography>
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
      <>
        <Section heading="Range">
          {this.props.tags !== undefined && this.props.tags.length > 1 ? (
            <TagRangeSelector
              tags={this.props.tags}
              defaultEndTag={this.props.lastMasterReleaseTag}
              onSelect={async (startTag: string, releaseTag: string) => {
                const commits = await this.compare(startTag, releaseTag);
                this.parseCommitsForPullRequests(commits, startTag, releaseTag);
              }}
            />
          ) : this.props.tags === undefined || this.props.tags.length === 0 ? (
            this.renderNoTagsNotice()
          ) : (
            this.renderButtonForSingleTag()
          )}
        </Section>
        {this.renderPullRequestsSection()}
      </>
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
