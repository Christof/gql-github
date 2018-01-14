import * as React from "react";
import { Dropdown } from "./dropdown";

export enum ChangeCategory {
  Basic = "Basic",
  Training = "Training",
  Breaking = "Breaking"
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
  selectChangeCategory(changeCategory: string) {
    const category =
      ChangeCategory[changeCategory as keyof typeof ChangeCategory];
    console.log("Change category to", category);
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
        <span>{this.props.pullRequest.text}</span>
        <span>{this.props.pullRequest.id}</span>
        {this.renderChangeCategorySelection()}
      </div>
    );
  }
}
