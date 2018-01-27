import * as React from "react";
import {
  DetailedRepositorySelector,
  RepositoriesPerOwner
} from "./detailed_repository_selector";
import { Github, GithubAuthorData } from "../github";

interface Props {
  token: string;
}

interface State {
  github: Github;
  repositoriesPerOwner?: RepositoriesPerOwner;
  author: string;
  data: GithubAuthorData[];
}

export class PersonalStats extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const github = new Github(props.token);
    this.state = { github, author: "", data: [] };

    github.getUser().then(user => this.setState({ author: user.login }));
  }

  async loadData(repositoriesPerOwner: RepositoriesPerOwner) {
    const data = [] as GithubAuthorData[];
    for (let [owner, repositories] of repositoriesPerOwner.entries()) {
      const github = this.state.github.copyFor(owner);
      await Promise.all(
        repositories.map(async repo => {
          const stats = await github.getStats(repo);
          const authorData = stats.find(
            authorData => authorData.author.login === this.state.author
          );
          data.push(authorData);
        })
      );
    }

    this.setState({ data });
    console.log(data);
  }

  render() {
    return (
      <DetailedRepositorySelector
        github={this.state.github}
        onChange={repositoriesPerOwner => this.loadData(repositoriesPerOwner)}
      />
    );
  }
}
