import * as React from "react";
import { GithubData } from "../github";
import PlotlyChart from "react-plotlyjs-ts";
import { ScatterData, Layout, Annotations } from "plotly.js";
import { unique, flatten, sum } from "../array_helper";

interface Props {
  reposData: GithubData[];
  repositoryNames: string[];
}

interface State {
  data: Partial<ScatterData>[];
  layout: Partial<Layout>;
}

export class OverallPlot extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = this.getPlotData();
  }

  getPlotData() {
    const data = this.getAuthors().map(author => this.getAuthorTrace(author));

    const layout: Partial<Layout> & { barmode: string } = {
      title: "Overall",
      barmode: "stack" as any,
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

    return { data, layout };
  }
  private getAuthors() {
    const authorsForRepos = this.props.reposData.map(repoData =>
      repoData !== undefined
        ? repoData.map(authorData => authorData.author.login)
        : []
    );

    return unique(flatten(authorsForRepos));
  }

  private getCommitsPerRepoFor(author: string) {
    return this.props.reposData.map(repo => {
      if (repo === undefined) return 0;

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
    } as Partial<ScatterData>;
  }

  private getTotalCommitCountAnnotations(): Partial<Annotations>[] {
    return this.props.reposData.map((repositoryData, index) => {
      const totalCommits =
        repositoryData !== undefined
          ? sum(repositoryData.map(authorData => authorData.total))
          : 0;

      const annotation: Partial<Annotations> = {
        x: totalCommits,
        y: this.props.repositoryNames[index],
        text: totalCommits.toString(),
        xanchor: "left",
        yanchor: "middle",
        showarrow: false
      };

      return annotation;
    });
  }

  componentDidUpdate(prevProps: Props) {
    if (
      prevProps.repositoryNames.length === this.props.repositoryNames.length &&
      prevProps.repositoryNames.every(
        (name, index) => name === this.props.repositoryNames[index]
      )
    ) {
      return;
    }

    this.setState(this.getPlotData());
  }

  render() {
    return (
      <PlotlyChart data={this.state.data} layout={this.state.layout as any} />
    );
  }
}
