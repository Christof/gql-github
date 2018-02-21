import * as React from "react";
import { GithubButton } from "../../src/components/github_button";
import { shallow } from "enzyme";

declare const jsdom: any;

describe("GithubButton", function() {
  describe("login", function() {
    describe("localhost", function() {
      it("changes window location to github login page", function() {
        jsdom.reconfigure({ url: "http://localhost:3000" });

        const wrapper = shallow(
          <GithubButton className="some-class" onChangeToken={() => {}} />
        );

        const loginButton = wrapper.find("WithStyles(Button)");
        expect(loginButton).toHaveLength(1);
        expect(loginButton.prop("children")[0]).toContain("Login");
        loginButton.prop("onClick")({} as any);

        expect(window.location.href).toContain(
          "https://github.com/login/oauth"
        );
      });
    });
  });
});
