import * as React from "react";
import { GithubButton } from "../../src/components/github_button";
import { Github, GithubUser } from "../../src/github";
import { shallow, ShallowWrapper } from "enzyme";
import { waitImmediate } from "../helper";
import { Button } from "@material-ui/core";

declare const jsdom: any;

jest.mock("../../src/github");

describe("GithubButton", function () {
  function expectButtonToContainText(
    button: ShallowWrapper<any, any>,
    text: string
  ) {
    const children = button.prop("children");
    expect(children.length).toBeGreaterThanOrEqual(1);
    expect((children as any)[0]).toContain(text);
  }

  describe("login", function () {
    describe("on localhost", function () {
      it("changes window location to github login page", function () {
        jsdom.reconfigure({ url: "http://localhost:3000" });
        window.location.assign = jest.fn();

        const wrapper = shallow(
          <GithubButton className="some-class" onChangeToken={() => {}} />
        );

        const loginButton = wrapper.find(Button);
        expect(loginButton).toHaveLength(1);

        loginButton.prop("onClick")({} as any);
        expectButtonToContainText(loginButton, "Login");

        expect(window.location.assign).toHaveBeenCalled();
        const newUrl = (window.location.assign as any).mock.calls[0][0];
        expect(newUrl).toContain("https://github.com/login/oauth");
      });
    });

    describe("in production", function () {
      it("changes window location to github login page", function () {
        jsdom.reconfigure({ url: "http://some-server.com" });
        const token = "my token";
        const authenticator = {
          authenticate: jest.fn((_args: any, callback: any) =>
            callback(undefined, { token })
          )
        };

        let changedToken = "";
        const wrapper = shallow(
          <GithubButton
            className="some-class"
            onChangeToken={token => {
              changedToken = token;
            }}
            authenticator={authenticator}
          />
        );

        const loginButton = wrapper.find(Button);
        expect(loginButton).toHaveLength(1);
        expectButtonToContainText(loginButton, "Login");
        loginButton.prop("onClick")({} as any);

        expect(authenticator.authenticate).toHaveBeenCalled();
        expect(changedToken).toEqual(token);
      });
    });

    it("shows github mark in login button", function () {
      const wrapper = shallow(
        <GithubButton className="some-class" onChangeToken={() => {}} />
      );

      const loginButton = wrapper.find(Button);
      expectButtonToContainText(loginButton, "Login");
      const img = loginButton.childAt(1);
      expect(img.prop("src")).toContain("mark");
    });

    it("loads avatar image after logged in", async function () {
      const wrapper = shallow(
        <GithubButton className="some-class" onChangeToken={() => {}} />
      );

      const avatarUrl = "url-to-avatar";
      const github = new Github("token", {} as any, undefined);
      github.getUser = jest.fn(() =>
        Promise.resolve({ avatarUrl } as GithubUser)
      );
      wrapper.setProps({ github });

      await waitImmediate();
      wrapper.update();

      const loginButton = wrapper.find(Button);
      expectButtonToContainText(loginButton, "Logout");
      const img = loginButton.childAt(1);
      expect(img.prop("src")).toContain(avatarUrl);
    });
  });

  describe("logout", function () {
    it("clears localstorage and calls onChangeToken with undefined", function () {
      const avatarUrl = "url-to-avatar";
      const github = new Github("token", {} as any, undefined);
      github.getUser = jest.fn(() =>
        Promise.resolve({ avatarUrl } as GithubUser)
      );

      let changedToken = "";

      const wrapper = shallow(
        <GithubButton
          className="some-class"
          github={github}
          onChangeToken={token => (changedToken = token)}
        />
      );

      const logoutButton = wrapper.find(Button);
      expect(logoutButton).toHaveLength(1);
      expectButtonToContainText(logoutButton, "Logout");
      logoutButton.prop("onClick")({} as any);

      expect(window.localStorage.clear).toHaveBeenCalled();
      expect(changedToken).toBeUndefined();
    });

    it("does not reload avatar on update if github instance is the same", async function () {
      const avatarUrl = "url-to-avatar";
      const github = new Github("token", {} as any, undefined);
      github.getUser = jest.fn(() =>
        Promise.resolve({ avatarUrl } as GithubUser)
      );

      const wrapper = shallow(
        <GithubButton
          className="some-class"
          github={github}
          onChangeToken={() => {}}
        />
      );

      wrapper.setProps({ github });

      await waitImmediate();
      wrapper.update();

      expect(github.getUser).toHaveBeenCalledTimes(1);
    });
  });
});
