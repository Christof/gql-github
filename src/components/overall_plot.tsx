import * as React from "react";
import { GithubData } from "../github_data";
import * as Plotly from "plotly.js";

interface Props {
  reposData: GithubData[];
  repositoryNames: string[];
}

function flatten<T>(arrayOfArrays: T[][]): T[] {
  return [].concat.apply([], arrayOfArrays);
}

function unique<T>(arrayWithDuplicates: T[]): T[] {
  return [...new Set(arrayWithDuplicates)];
}

export class OverallPlot extends React.Component<Props, {}> {
  private readonly divId = "overall";

  private getAuthors() {
    const authorsForRepos = this.props.reposData.map(repoData =>
      repoData.map(authorData => authorData.author.login)
    );
    return unique(flatten(authorsForRepos));
  }

  private getCommitsPerRepoFor(author: string) {
    return this.props.reposData.map(repo => {
      const dataForAuthor = repo.find(
        authorData => authorData.author.login === author
      );
      return dataForAuthor === undefined ? 0 : dataForAuthor.total;
    });
  }

  private getAuthorTrace(author: string) {
    return {
      x: this.props.repositoryNames,
      y: this.getCommitsPerRepoFor(author),
      name: author,
      type: "bar"
    };
  }

  componentDidMount() {
    const data = this.getAuthors().map(author => this.getAuthorTrace(author));

    const layout = {
      title: "Overall",
      barmode: "stack"
    };

    Plotly.newPlot(this.divId, data as any, layout as any);
  }

  render() {
    return (
      <div>
        <h1>Overall</h1>
        <div id={this.divId} />
      </div>
    );
  }
}
