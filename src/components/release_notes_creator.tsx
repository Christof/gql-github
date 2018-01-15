import {
  PullRequest,
  PullRequestComponent,
  ChangeCategory
} from "./pull_request";
import { Dropdown } from "./dropdown";
import {
  getRepositoryNames,
  getRequestGithub,
  GithubCompareResult,
  postRelease
} from "../github";
import { Owner } from "./owner";
import * as React from "react";
import * as ReactMarkdown from "react-markdown";

interface State {
  token: string;
  repositoryNames: string[];
  owner: string;
  repo?: string;
  releases?: any[];
  startRelease?: string;
  endRelease?: string;
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

  handleOwnerSubmit(owner: string) {
    this.setState({ owner });
    this.loadRepos(owner);
  }

  async loadRepos(owner: string) {
    try {
      const repositoryNames = await getRepositoryNames(owner, this.state.token);
      this.setState({
        repositoryNames
      });
    } catch (error) {
      console.error(error);
    }
  }

  async getCommits() {
    const response = await getRequestGithub(
      `repos/${this.state.owner}/${this.state.repo}/compare/${
        this.state.startRelease
      }...${this.state.endRelease}`,
      this.state.token
    );

    const result = (await response.json()) as GithubCompareResult;

    const pullRequestRegex = new RegExp(/Merge pull request/);
    const pullRequestMerges = result.commits.filter(commit =>
      commit.commit.message.match(pullRequestRegex)
    );
    this.setState({
      pullRequests: pullRequestMerges.map(commit =>
        PullRequest.parseFrom(commit.commit.message)
      )
    });
    this.updateReleaseNote();
  }

  async loadTags(repo: string) {
    const response = await getRequestGithub(
      `repos/${this.state.owner}/${repo}/tags`,
      this.state.token
    );
    const result = await response.json();

    this.setState({ releases: result });
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

  renderReleasesSection() {
    if (!this.state.repo || !this.state.releases) return <section />;

    const releaseNames = this.state.releases.map(release => release.name);
    return (
      <section>
        <h3>Select range</h3>
        <label>
          Start
          <Dropdown
            options={releaseNames}
            onSelect={tagName => this.setState({ startRelease: tagName })}
          />
        </label>
        <label className="ph2">
          End
          <Dropdown
            options={releaseNames}
            onSelect={tagName => this.setState({ endRelease: tagName })}
          />
        </label>
        <button onClick={() => this.getCommits()}>
          Get merged PRs in range
        </button>
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
      tag_name: this.state.endRelease,
      target_commitish: "master",
      name: this.state.endRelease,
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
        {this.renderReleasesSection()}
        {this.renderPullRequestsSection()}
      </div>
    );
  }
}
