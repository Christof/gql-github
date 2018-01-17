import {
  PullRequest,
  PullRequestComponent,
  ChangeCategory
} from "./pull_request";
import { Dropdown } from "./dropdown";
import { postRelease, Github, GithubTag } from "../github";
import { Owner } from "./owner";
import * as React from "react";
import * as ReactMarkdown from "react-markdown";

interface State {
  token: string;
  repositoryNames: string[];
  owner: string;
  github?: Github;
  repo?: string;
  tags?: GithubTag[];
  startTag?: string;
  releaseTag?: string;
  pullRequests: PullRequest[];
  releaseNote: string;
}

export class ReleaseNotesCreator extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      owner: "skillslab",
      repositoryNames: [],
      token: JSON.parse(window.localStorage.github).access_token,
      pullRequests: [],
      releaseNote: ""
    };
  }

  async handleOwnerSubmit(owner: string) {
    const github = new Github(owner, this.state.token);
    const repositoryNames = await github.getRepositoryNames();
    this.setState({ owner, github, repositoryNames });
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
    if (this.state.repositoryNames.length === 0) {
      return <div />;
    }

    return (
      <Dropdown
        options={this.state.repositoryNames}
        onSelect={repo => this.selectRepository(repo)}
      />
    );
  }

  renderTagsSection() {
    if (!this.state.repo || !this.state.tags) return <section />;

    const releaseNames = this.state.tags.map(release => release.name);
    return (
      <section>
        <h3>Select range</h3>
        <div>
          <label>
            Start
            <Dropdown
              options={releaseNames}
              onSelect={tagName => this.setState({ startTag: tagName })}
            />
          </label>
        </div>
        <div>
          <label>
            End
            <Dropdown
              options={releaseNames}
              onSelect={tagName => this.setState({ releaseTag: tagName })}
            />
          </label>
        </div>
        <div>
          <button onClick={() => this.getCommits()}>
            Get merged PRs in range
          </button>
        </div>
      </section>
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
    postRelease(this.state.owner, this.state.repo, release, this.state.token);
  }

  renderPullRequestsSection() {
    if (this.state.pullRequests.length === 0) return <section />;

    return (
      <section>
        <h3>Adjust categories</h3>
        {this.state.pullRequests.map((pullRequest, index) => (
          <PullRequestComponent
            key={pullRequest.id}
            pullRequest={pullRequest}
            onChange={updatedPullRequest =>
              this.setPullRequest(updatedPullRequest, index)
            }
          />
        ))}
        <h3 className="pt2">Release Note</h3>
        <ReactMarkdown source={this.state.releaseNote} />
        <button onClick={() => this.postRelease()}>Create Release</button>
      </section>
    );
  }

  render() {
    return (
      <div>
        <Owner updateOwner={owner => this.handleOwnerSubmit(owner)} />
        {this.renderRepositorySelection()}
        {this.renderTagsSection()}
        {this.renderPullRequestsSection()}
      </div>
    );
  }
}
