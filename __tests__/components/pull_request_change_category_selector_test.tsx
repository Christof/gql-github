import * as React from "react";
import { PullRequestChangeCategorySelector } from "../../src/components/pull_request_change_category_selector";
import { shallow } from "enzyme";
import { PullRequest, ChangeCategory } from "../../src/pull_request";
import { Typography } from "@material-ui/core";
import { Dropdown } from "../../src/components/dropdown";

describe("PullRequestChangeCategorySelector", function () {
  const pullRequest = new PullRequest(
    "PR Description",
    "123",
    ChangeCategory.Breaking
  );

  it("renders PullRequest text", function () {
    const wrapper = shallow(
      <PullRequestChangeCategorySelector
        pullRequest={pullRequest}
        onChange={() => {}}
      />
    );

    expect(wrapper.find(Typography).prop("children")).toEqual(
      pullRequest.toText()
    );
  });

  it("contains a Dropdown to change the ChangeCategory", function () {
    let changedPullRequest: PullRequest;

    const wrapper = shallow(
      <PullRequestChangeCategorySelector
        pullRequest={pullRequest}
        onChange={pullRequest => {
          changedPullRequest = pullRequest;
        }}
      />
    );

    wrapper.find(Dropdown).prop("onSelect")("Training" as any);

    expect(changedPullRequest).toBeDefined();
    expect(changedPullRequest.changeCategory).toEqual(ChangeCategory.Training);
  });
});
