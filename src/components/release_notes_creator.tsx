import { Dropdown } from "./dropdown";
import { getRepositoryNames, getRequestGithub } from "../github";
import { Owner } from "./owner";
import * as React from "react";

interface State {
  token: string;
  repositoryNames: string[];
  owner: string;
  repo?: string;
  releases?: any[];
  startRelease?: any;
  endRelease?: any;
}

export class ReleaseNotesCreator extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      owner: "skillslab",
      repositoryNames: [],
      token: JSON.parse(window.localStorage.github).access_token
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

  async loadReleases(repo: string) {
    const response = await getRequestGithub(
      `repos/${this.state.owner}/${repo}/releases`,
      this.state.token
    );
    const result = await response.json();
    this.setState({ releases: result });
  }

  selectRepository(repo: string) {
    this.setState({ repo: repo });
    return this.loadReleases(repo);
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

  render() {
    return (
      <div>
        <Owner updateOwner={owner => this.handleOwnerSubmit(owner)} />
        {this.renderRepositorySelection()}
      </div>
    );
  }
}
