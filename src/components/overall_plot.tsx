import * as React from "react";
import { GithubData } from "../github";
import * as Plotly from "plotly.js";
import { Typography } from "material-ui";
import { Section } from "./section";

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
      y: this.props.repositoryNames,
      x: this.getCommitsPerRepoFor(author),
      name: author,
      type: "bar",
      orientation: "h"
    };
  }

  private getTotalCommitCountAnnotations() {
    return this.props.reposData.map((repositoryData, index) => {
      const totalCommits = repositoryData.reduce(
        (sum, authorData) => sum + authorData.total,
        0
      );
      return {
        x: totalCommits,
        y: this.props.repositoryNames[index],
        text: totalCommits,
        xanchor: "left",
        yanchor: "center",
        showarrow: false
      };
    });
  }

  componentDidMount() {
    const data = this.getAuthors().map(author => this.getAuthorTrace(author));

    const layout = {
      title: "Overall",
      barmode: "stack",
      annotations: this.getTotalCommitCountAnnotations(),
      xaxis: {
        title: "commit count"
      },
      yaxis: {
        type: "category",
        dtick: 1,
        tick0: 0
      },
      margin: {
        l: 140
      }
    };

    Plotly.newPlot(this.divId, data as any, layout as any);
  }

  render() {
    return <div id={this.divId} />;
  }
}
