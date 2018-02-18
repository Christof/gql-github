import * as React from "react";
import { PullRequestComponent } from "../../src/components/pull_request";
import { shallow } from "enzyme";
import { PullRequest, ChangeCategory } from "../../src/pull_request";

describe("PullRequestComponent", function() {
  it("renders PullRequest text", function() {
    const pullRequest = new PullRequest(
      "PR Description",
      "123",
      ChangeCategory.Breaking
    );

    const wrapper = shallow(
      <PullRequestComponent pullRequest={pullRequest} onChange={() => {}} />
    );

    expect(wrapper.find("WithStyles(Typography)").prop("children")).toEqual(
      pullRequest.toText()
    );
  });
});
