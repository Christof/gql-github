import * as React from "react";
import { GithubButton } from "../../src/components/github_button";
import { shallow } from "enzyme";

describe("GithubButton", function() {
  describe("login", function() {
    describe("localhost", function() {
      it("changes window location to github login page", function() {
        const wrapper = shallow(
          <GithubButton className="some-class" onChangeToken={() => {}} />
        );

        expect(wrapper.find("WithStyles(Button)")).toHaveLength(1);
      });
    });
  });
});
