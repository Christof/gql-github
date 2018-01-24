import {
  PullRequest,
  PullRequestComponent,
  ChangeCategory
} from "./pull_request";
import { Dropdown } from "./dropdown";
import { Section } from "./section";
import { RepositorySelector } from "./repository_selector";
import { Github, GithubTag } from "../github";
import * as React from "react";
import * as ReactMarkdown from "react-markdown";
import { Button, Grid, Snackbar, Slide, Typography } from "material-ui";
import { SlideProps } from "material-ui/transitions";

function TransitionLeft(props: SlideProps) {
  return <Slide direction="left" {...props} />;
}

interface State {
  repositoryNames: string[];
  github: Github;
  repo?: string;
  tags?: GithubTag[];
  startTag?: string;
  releaseTag?: string;
  pullRequests: PullRequest[];
  releaseNote: string;
  releaseCreated: boolean;
}

interface Props {
  token: string;
}

export class ReleaseNotesCreator extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      repositoryNames: [],
      github: new Github(this.props.token),
      pullRequests: [],
      releaseNote: "",
      releaseCreated: false
    };
  }

  async getCommits() {
    const result = await this.state.github.compare(
      this.state.repo,
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

  async loadTags(repo: string) {
    const tags = await this.state.github.getTags(repo);

    this.setState({ tags });
  }

  selectRepository(repo: string) {
    this.setState({ repo: repo });
    return this.loadTags(repo);
  }

  renderTagsSection() {
    if (!this.state.repo || !this.state.tags) return <section />;

    const releaseNames = this.state.tags.map(release => release.name);
    return (
      <Section>
        <Typography type="headline" paragraph>
          Range
        </Typography>
        <Dropdown
          label="Start Tag"
          options={releaseNames}
          onSelect={tagName => this.setState({ startTag: tagName })}
        />
        <Dropdown
          label="End Tag"
          options={releaseNames}
          onSelect={tagName => this.setState({ releaseTag: tagName })}
        />
        <Button raised onClick={() => this.getCommits()}>
          Get merged PRs in range
        </Button>
      </Section>
    );
  }

  setPullRequest(pullRequest: PullRequest, index: number) {
    const pullRequests = [...this.state.pullRequests];
    pullRequests[index] = pullRequest;
    this.setState({ pullRequests }, () => this.updateReleaseNote());
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

  async postRelease() {
    const release = {
      tag_name: this.state.releaseTag,
      target_commitish: "master",
      name: this.state.releaseTag,
      body: this.state.releaseNote,
      draft: false,
      prerelease: false
    };

    const response = await this.state.github.postRelease(
      this.state.repo,
      release
    );
    if (response.ok) {
      this.setState({ releaseCreated: true });
    }
  }

  renderPullRequestsSection() {
    if (this.state.pullRequests.length === 0) return <section />;

    return (
      <Section>
        <Typography type="headline" paragraph>
          Adjust Categories
        </Typography>
        {this.state.pullRequests.map((pullRequest, index) => (
          <PullRequestComponent
            key={pullRequest.id}
            pullRequest={pullRequest}
            onChange={updatedPullRequest =>
              this.setPullRequest(updatedPullRequest, index)
            }
          />
        ))}
      </Section>
    );
  }

  renderReleaseNoteSection() {
    if (this.state.releaseNote.length === 0) return <section />;

    return (
      <Section>
        <Typography type="headline" paragraph>
          Release Note
        </Typography>
        <div style={{ fontFamily: "Roboto, Helvetica, Arial, sans-serif" }}>
          <ReactMarkdown source={this.state.releaseNote} />
        </div>
        <Button raised onClick={() => this.postRelease()}>
          Create Release
        </Button>
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          autoHideDuration={2000}
          transition={TransitionLeft}
          onClose={() => this.setState({ releaseCreated: false })}
          open={this.state.releaseCreated}
          message={<span>Release created</span>}
        />
      </Section>
    );
  }

  render() {
    return (
      <Grid container spacing={24} justify="center">
        <Grid item xs={12} md={10} lg={8}>
          <RepositorySelector
            github={this.state.github}
            onRepositorySelect={repo => this.selectRepository(repo)}
          />
          {this.renderTagsSection()}
          {this.renderPullRequestsSection()}
          {this.renderReleaseNoteSection()}
        </Grid>
      </Grid>
    );
  }
}
