import * as React from "react";
import { App, RawApp } from "../../src/components/app";
import { shallow, mount } from "enzyme";
import { waitImmediate } from "../helper";

describe("App", function() {
  describe("AppBar", function() {
    it("renders the tilte, MenuButtons and GithubButton", function() {
      const wrapper = mount(<App />);

      const appBar = wrapper.find("WithStyles(AppBar)");
      expect(appBar).toHaveLength(1);

      const title = appBar.find("WithStyles(Typography)");
      expect(title).toHaveLength(1);
      expect(title.prop("children")).toEqual("Github Stats & Releases");

      const menuButtons = appBar.find("MenuButton");
      expect(menuButtons).toHaveLength(5);

      expect(appBar.find("GithubButton")).toHaveLength(1);
    });
  });

  describe("Content", function() {
    it("is an empty div if no route is selected", function() {
      const wrapper = mount(<App />);

      expect(wrapper.find("#content")).toHaveLength(1);
    });
  });

  describe("GithubButton", function() {
    it("onChangeToken sets the token and creates Github instance", async function() {
      (global as any).fetch = function() {
        return new Promise(resolve =>
          resolve({ text: () => new Promise(() => {}) })
        );
      };
      const wrapper = shallow(<App />);
      const rawApp = wrapper.find("RawApp");
      expect(rawApp).toHaveLength(1);
      const rawAppWrapper = rawApp.dive();

      const githubButton = rawAppWrapper.find("GithubButton");
      expect(githubButton).toHaveLength(1);
      expect(rawAppWrapper.state("github")).toBeUndefined();

      const token = "token";
      (githubButton.prop("onChangeToken") as any)(token);

      expect(rawAppWrapper.state()).toHaveProperty("github");
    });

    describe("token in localStorage", function() {
      it("creates a Github instance in constructor", function() {
        window.localStorage.githubToken = "token";
        (global as any).fetch = function() {
          return new Promise(resolve =>
            resolve({ text: () => new Promise(() => {}) })
          );
        };

        const wrapper = shallow(<App />);

        const rawApp = wrapper.find("RawApp");
        expect(rawApp).toHaveLength(1);

        const rawAppWrapper = rawApp.dive();
        expect(rawAppWrapper.state()).toHaveProperty("github");
      });
    });
  });
});
