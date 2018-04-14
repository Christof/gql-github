import * as React from "react";
import { GithubCallback } from "../../src/components/github_callback";
import { shallow, ShallowWrapper } from "enzyme";
import { waitImmediate } from "../helper";

describe("GithubCallback", function() {
  afterEach(() => window.localStorage.clear());
  describe("componentDidMount", function() {
    it("throws an error if states do not match", function() {
      window.localStorage.setItem("githubState", "some state");

      const location: any = { search: "?state=other-state" };
      expect(() =>
        shallow(
          <GithubCallback
            onChangeToken={undefined}
            match={undefined}
            location={location}
            history={undefined}
          />
        )
      ).toThrowError(/Retrieved state is not equal to sent one./);
    });
  });
});
