import * as React from "react";

export enum ChangeCategory {
  Basic,
  Training,
  Breaking
}

export class PullRequest {
  text: string;
  id: string;
  changeCategory: ChangeCategory;

  constructor(commitMessage: string) {
    const pullRequestPartsRegex = new RegExp(
      /Merge pull request #(\d*) .*?\n\n(.*)/
    );
    const match = commitMessage.match(pullRequestPartsRegex);

    this.text = match[2];
    this.id = match[1];
    this.changeCategory = ChangeCategory.Basic;
  }
}

interface Props {
  pullRequest: PullRequest;
}

interface State {
  changeCategory: ChangeCategory;
}

export class PullRequestComponent extends React.Component<Props, State> {
  render() {
    return (
      <div>
        <span>{this.props.pullRequest.text}</span>
        <span>{this.props.pullRequest.id}</span>
      </div>
    );
  }
}
