import {
  PullRequest,
  PullRequestComponent,
  ChangeCategory
} from "./pull_request";
import { Dropdown } from "./dropdown";
import { Github, GithubTag } from "../github";
import * as React from "react";
import * as ReactMarkdown from "react-markdown";
import { Button, Paper } from "material-ui";
import Typography from "material-ui/Typography/Typography";

interface State {
  repositoryNames: string[];
  owners: string[];
  github: Github;
  repo?: string;
  tags?: GithubTag[];
  startTag?: string;
  releaseTag?: string;
  pullRequests: PullRequest[];
  releaseNote: string;
}

interface Props {
  token: string;
}

export class ReleaseNotesCreator extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      owners: [],
      repositoryNames: [],
      github: new Github(this.props.token),
      pullRequests: [],
      releaseNote: ""
    };

    this.state.github.getOwners().then(owners => this.setState({ owners }));
  }

  async selectOwner(owner: string) {
    this.state.github.owner = owner;
    const repositoryNames = await this.state.github.getRepositoryNames();
    this.setState({ repositoryNames });
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

  renderRepositorySelection() {
    return (
      <Paper>
        <section>
          <Typography type="headline" paragraph>
            Repository
          </Typography>
          <Dropdown
            label="Owner"
            options={this.state.owners}
            onSelect={owner => this.selectOwner(owner)}
          />
          <Dropdown
            label="Repository"
            options={this.state.repositoryNames}
            onSelect={repo => this.selectRepository(repo)}
          />
        </section>
      </Paper>
    );
  }

  renderTagsSection() {
    if (!this.state.repo || !this.state.tags) return <section />;

    const releaseNames = this.state.tags.map(release => release.name);
    return (
      <Paper>
        <section>
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
        </section>
      </Paper>
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

  postRelease() {
    const release = {
      tag_name: this.state.releaseTag,
      target_commitish: "master",
      name: this.state.releaseTag,
      body: this.state.releaseNote,
      draft: false,
      prerelease: false
    };
    this.state.github.postRelease(this.state.repo, release);
  }

  renderPullRequestsSection() {
    if (this.state.pullRequests.length === 0) return <section />;

    return (
      <Paper>
        <section>
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
        </section>
      </Paper>
    );
  }

  renderReleaseNoteSection() {
    if (this.state.releaseNote.length === 0) return <section />;

    return (
      <Paper>
        <section>
          <Typography type="headline" paragraph>
            Release Note
          </Typography>
          <ReactMarkdown source={this.state.releaseNote} />
          <Button raised onClick={() => this.postRelease()}>
            Create Release
          </Button>
        </section>
      </Paper>
    );
  }

  render() {
    return (
      <div>
        {this.renderRepositorySelection()}
        {this.renderTagsSection()}
        {this.renderPullRequestsSection()}
        {this.renderReleaseNoteSection()}
      </div>
    );
  }
}
