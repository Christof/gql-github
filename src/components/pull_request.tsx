import * as React from "react";
import { Dropdown } from "./dropdown";

export enum ChangeCategory {
  Basic = "Basic",
  Training = "Training",
  Breaking = "Breaking"
}

export class PullRequest {
  constructor(
    public text: string,
    public id: string,
    public changeCategory: ChangeCategory
  ) {}

  static parseFrom(commitMessage: string) {
    const pullRequestPartsRegex = new RegExp(
      /Merge pull request #(\d*) .*?\n\n(.*)/
    );
    const match = commitMessage.match(pullRequestPartsRegex);

    const text = match[2];
    const id = match[1];
    return new PullRequest(text, id, ChangeCategory.Basic);
  }

  toString() {
    return `- ${this.text} (${this.id})`;
  }
}

interface Props {
  pullRequest: PullRequest;
  onChange: (changedPullRequest: PullRequest) => void;
}

interface State {
  changeCategory: ChangeCategory;
}

export class PullRequestComponent extends React.Component<Props, State> {
  selectChangeCategory(categoryName: string) {
    const changeCategory =
      ChangeCategory[categoryName as keyof typeof ChangeCategory];

    const pr = this.props.pullRequest;
    this.props.onChange(new PullRequest(pr.text, pr.id, changeCategory));
  }

  renderChangeCategorySelection() {
    return (
      <Dropdown
        options={[
          ChangeCategory.Basic,
          ChangeCategory.Training,
          ChangeCategory.Breaking
        ]}
        onSelect={changeCategory => this.selectChangeCategory(changeCategory)}
      />
    );
  }
  render() {
    return (
      <div>
        {this.renderChangeCategorySelection()}
        <span>{this.props.pullRequest.text}</span>
        <span className="ph1">({this.props.pullRequest.id})</span>
      </div>
    );
  }
}
