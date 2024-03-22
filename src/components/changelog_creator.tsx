import { PullRequest } from "../pull_request";
import { Section } from "./section";
import { RepositorySelector } from "./repository_selector";
import { Markdown } from "./markdown";
import { Github, GithubTag, GithubCommit } from "../github";
import {
  addLabelsToPullRequests,
  filterPullRequestMergeCommits,
  groupPullRequestsByLabels,
  PullRequestWithLabels
} from "../github_helper";
import * as React from "react";
import { DefaultGrid } from "./default_grid";
import { TriggeredAsyncSwitchFromLoadType } from "./triggered_async_switch";
import { TagRangeSelector } from "./tag_range_selector";
import { ReleaseNote } from "./release_note";
import { Button, LinearProgress, Typography } from "@material-ui/core";

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
    const pullRequestsWithLabels: PullRequestWithLabels[] =
      await addLabelsToPullRequests(
        pullRequests,
        this.props.github,
        this.props.repo
      );
    const filteredPullRequests = pullRequestsWithLabels.filter(
      pr =>
        !pr.labels.some(
          label =>
            label.name === "dependencies" ||
            label.name === "ignore-for-changelog"
        )
    );
    const pullRequestsReplacedImages = filteredPullRequests.map(pr => replaceImageLinks(pr));

    this.setState({
      pullRequests: groupPullRequestsByLabels(pullRequestsReplacedImages),
      startTag,
      releaseTag
    });
  }

  printDiv(divName: string) {
    const printContents = document.getElementById(divName).innerHTML;
    const tab = window.open("about:blank", "_blank");
    const link = tab.document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = "https://fonts.cdnfonts.com/css/gilroy-bold";

    const cssStyle = tab.document.createElement("style");
    cssStyle.textContent = `
body {
  font-family: gilroy-light;
  font-size: 12;
}
h1 {
  font-family: supermolot;
  font-size: 40pt;
}
h2 {
  font-family: supermolot;
  font-size: 25pt;
  color: #8cc8b4;
  margin-bottom: 0.5cm;
}
h3 {
  font-family: gilroy-bold;
  font-size: 16;
  margin-bottom: 0.25cm;
}
h4 {
  font-family: gilroy-bold;
  font-size: 25pt;
  color: #8cc8b4;
  margin-bottom: 0.5cm;
}
mark.brand {
  color: #8cc8b4;
  background: none;
  font-family: gilroy-bold;
}
mark.bold {
  background: none;
  font-family: gilroy-bold;
}
table {
  width: 19.5cm;
}
td {
  vertical-align: top;
}
@media print {
  * {
    -webkit-print-color-adjust: exact;
    color-adjust: exact;
  }
}

    `;
    tab.document.write(printContents);
    tab.document.head.appendChild(link);
    tab.document.head.appendChild(cssStyle);
  }

  createSection(name: string, pullRequests: PullRequestWithLabels[] = []) {
    if (pullRequests.length === 0) return "";

    return `## ${name}\n\n${pullRequests
      .map(pr => this.renderPullRequest(pr))
      .join("\n\n")}`;
  }

  renderPullRequestsSection() {
    if (this.state.pullRequests === undefined) return <section />;

    const str = `# Changelog for ${
      this.props.repo
    }\n\n The changelog is from version ${this.state.startTag} to ${
      this.state.releaseTag
    }\n\n${this.createSection("New features", this.state.pullRequests.features)}
    \n\n${this.createSection("Bugfixes", this.state.pullRequests.bugfixes)}
    `;

    return (
      <div>
        <textarea style={{ width: "100%" }} defaultValue={str}></textarea>
        <div>
          <Button onClick={() => this.printDiv("section-to-print")}>
            Print
          </Button>
        </div>
        <div id="section-to-print" style={{ contain: "content" }}>
          <Markdown fontFamily="gilroy-light" source={str} />
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

function replaceImageLinks(pr: PullRequestWithLabels): PullRequestWithLabels {
  const regex = /\(https:\/\/github\.com\/.*\/assets\/(.+?)\)/gm;

  // TODO remove after typescript update
  const matches = (pr.body as any).matchAll(regex);
  for (const match of matches) {
    const parts = match[1].split('/');
    const newUrlRegex = new RegExp(`href="(https://private-user-images\.githubusercontent\.com/${parts[0]}/.+?${parts[1]}.+?)"`);
    const newUrlMatch = pr.bodyHTML.match(newUrlRegex)

    if (newUrlMatch) {
      pr.body = pr.body.replace(match[0], `(${newUrlMatch[1]})`);
    }
  }

  return pr;
}
