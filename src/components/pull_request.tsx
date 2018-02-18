import * as React from "react";
import { PullRequest, ChangeCategory } from "../pull_request";
import { Dropdown } from "./dropdown";
import Typography from "material-ui/Typography/Typography";

interface Props {
  pullRequest: PullRequest;
  onChange: (changedPullRequest: PullRequest) => void;
}

interface State {
  changeCategory: ChangeCategory;
}

export class PullRequestChangeCategorySelector extends React.Component<
  Props,
  State
> {
  selectChangeCategory(categoryName: string) {
    const changeCategory =
      ChangeCategory[categoryName as keyof typeof ChangeCategory];

    const pr = this.props.pullRequest;
    this.props.onChange(new PullRequest(pr.text, pr.id, changeCategory));
  }

  renderChangeCategorySelection() {
    return (
      <Dropdown
        style={{ width: "5em" }}
        options={[
          ChangeCategory.Basic,
          ChangeCategory.Training,
          ChangeCategory.Breaking
        ]}
        initialSelection={this.props.pullRequest.changeCategory}
        onSelect={changeCategory => this.selectChangeCategory(changeCategory)}
      />
    );
  }

  render() {
    return (
      <div>
        {this.renderChangeCategorySelection()}
        <Typography style={{ display: "inline" }}>
          {this.props.pullRequest.toText()}
        </Typography>
      </div>
    );
  }
}
