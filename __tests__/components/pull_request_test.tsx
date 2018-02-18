import * as React from "react";
import { PullRequestComponent } from "../../src/components/pull_request";
import { shallow } from "enzyme";
import { PullRequest, ChangeCategory } from "../../src/pull_request";

describe("PullRequestComponent", function() {
  const pullRequest = new PullRequest(
    "PR Description",
    "123",
    ChangeCategory.Breaking
  );

  it("renders PullRequest text", function() {
    const wrapper = shallow(
      <PullRequestComponent pullRequest={pullRequest} onChange={() => {}} />
    );

    expect(wrapper.find("WithStyles(Typography)").prop("children")).toEqual(
      pullRequest.toText()
    );
  });

  it("contains a Dropdown to change the ChangeCategory", function() {
    let changedPullRequest: PullRequest;

    const wrapper = shallow(
      <PullRequestComponent
        pullRequest={pullRequest}
        onChange={pullRequest => {
          changedPullRequest = pullRequest;
        }}
      />
    );

    wrapper.find("Dropdown").prop("onSelect")("Training" as any);

    expect(changedPullRequest).toBeDefined();
    expect(changedPullRequest.changeCategory).toEqual(ChangeCategory.Training);
  });
});
