import * as React from "react";
import { GithubButton } from "../../src/components/github_button";
import { Github } from "../../src/github";
import { shallow } from "enzyme";
import { waitImmediate } from "../helper";

declare const jsdom: any;

jest.mock("../../src/github");

describe("GithubButton", function() {
  describe("login", function() {
    describe("on localhost", function() {
      it("changes window location to github login page", function() {
        jsdom.reconfigure({ url: "http://localhost:3000" });
        window.location.assign = jest.fn();

        const wrapper = shallow(
          <GithubButton className="some-class" onChangeToken={() => {}} />
        );

        const loginButton = wrapper.find("WithStyles(Button)");
        expect(loginButton).toHaveLength(1);
        expect(loginButton.prop("children")[0]).toContain("Login");
        loginButton.prop("onClick")({} as any);

        expect(window.location.assign).toHaveBeenCalled();
        const newUrl = (window.location.assign as any).mock.calls[0][0];
        expect(newUrl).toContain("https://github.com/login/oauth");
      });
    });

    describe("in production", function() {
      it("changes window location to github login page", function() {
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

        const loginButton = wrapper.find("WithStyles(Button)");
        expect(loginButton).toHaveLength(1);
        expect(loginButton.prop("children")[0]).toContain("Login");
        loginButton.prop("onClick")({} as any);

        expect(authenticator.authenticate).toHaveBeenCalled();
        expect(changedToken).toEqual(token);
      });
    });

    it("shows github mark in login button", function() {
      const wrapper = shallow(
        <GithubButton className="some-class" onChangeToken={() => {}} />
      );

      const loginButton = wrapper.find("WithStyles(Button)");
      expect(loginButton.prop("children")[0]).toContain("Login");
      const img = shallow(loginButton.prop("children")[1]);
      expect(img.prop("src")).toContain("mark");
    });

    it("loads avatar image after logged in", async function() {
      const wrapper = shallow(
        <GithubButton className="some-class" onChangeToken={() => {}} />
      );

      const avatarUrl = "url-to-avatar";
      const github = new Github("token", {} as any);
      github.getUser = jest.fn(() => Promise.resolve({ avatarUrl }));
      wrapper.setProps({ github });

      await waitImmediate();
      wrapper.update();

      const loginButton = wrapper.find("WithStyles(Button)");
      expect(loginButton.prop("children")[0]).toContain("Logout");
      const img = shallow(loginButton.prop("children")[1]);
      expect(img.prop("src")).toContain(avatarUrl);
    });
  });

  describe("logout", function() {
    it("clears localstorage and calls onChangeToken with undefined", function() {
      const avatarUrl = "url-to-avatar";
      const github = new Github("token", {} as any);
      github.getUser = jest.fn(() => Promise.resolve({ avatarUrl }));

      let changedToken = "";

      const wrapper = shallow(
        <GithubButton
          className="some-class"
          github={github}
          onChangeToken={token => (changedToken = token)}
        />
      );

      const logoutButton = wrapper.find("WithStyles(Button)");
      expect(logoutButton).toHaveLength(1);
      expect(logoutButton.prop("children")[0]).toContain("Logout");
      logoutButton.prop("onClick")({} as any);

      expect(window.localStorage.clear).toHaveBeenCalled();
      expect(changedToken).toBeUndefined();
    });

    it("does not reload avatar on update if github instance is the same", async function() {
      const avatarUrl = "url-to-avatar";
      const github = new Github("token", {} as any);
      github.getUser = jest.fn(() => Promise.resolve({ avatarUrl }));

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
