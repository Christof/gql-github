import * as React from "react";
import { App, RawApp } from "../../src/components/app";
import { shallow, mount } from "enzyme";
import { waitImmediate } from "../helper";
import { MemoryRouter, Route } from "react-router";

import * as ReactRouterDom from "react-router-dom";
import { GithubCallback } from "../../src/components/github_callback";

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
    it("onChangeToken sets the token and creates Github instance", function() {
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
      afterEach(() => window.localStorage.clear());

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

  [
    { component: "Stats", route: "/stats" },
    { component: "PersonalStats", route: "/personal-stats" },
    { component: "OrgStats", route: "/org-stats" }
  ].forEach(entry => {
    describe(entry.component, function() {
      it(`shows a MenuButton to route ${entry.route}`, function() {
        const wrapper = mount(<App />);
        const appBar = wrapper.find("WithStyles(AppBar)");
        expect(appBar).toHaveLength(1);

        const button = appBar
          .find("MenuButton")
          .filterWhere(b => b.prop("to") === entry.route);
        expect(button).toHaveLength(1);
      });

      describe("with faked BrowserRouter", function() {
        const originalBrowserRouter = ReactRouterDom.BrowserRouter;
        beforeAll(function() {
          // Redefine BrowserRouter to only render its children
          // otherwise MemoryRouter won't work
          (ReactRouterDom.BrowserRouter as any) = ({ children }) => (
            <div>{children}</div>
          );
        });

        afterAll(function() {
          (ReactRouterDom.BrowserRouter as any) = originalBrowserRouter;
        });

        afterEach(function() {
          window.localStorage.clear();
        });

        it(`shows ${entry.component} if route is active`, async function() {
          // ensure that we are logged in
          window.localStorage.githubToken = "token";

          const wrapper = mount(
            <MemoryRouter initialEntries={[entry.route]}>
              <App />
            </MemoryRouter>
          );

          expect(wrapper.find(<h1>Loading!</h1>));

          await waitImmediate();
          wrapper.update();

          expect(wrapper.find(entry.component)).toHaveLength(1);
        });

        it(`shows nothing if route is active but not logged in`, async function() {
          const wrapper = mount(
            <MemoryRouter initialEntries={[entry.route]}>
              <App />
            </MemoryRouter>
          );

          await waitImmediate();
          wrapper.update();

          expect(wrapper.find(entry.component)).toHaveLength(0);
        });
      });
    });
  });

  describe("GithubCallback", function() {
    const originalBrowserRouter = ReactRouterDom.BrowserRouter;
    beforeAll(function() {
      // Redefine BrowserRouter to only render its children
      // otherwise MemoryRouter won't work
      (ReactRouterDom.BrowserRouter as any) = ({ children }) => (
        <div>{children}</div>
      );
    });

    afterAll(function() {
      (ReactRouterDom.BrowserRouter as any) = originalBrowserRouter;
    });

    it("renders GithubCallback for /auth-callback route", function() {
      const wrapper = mount(
        <MemoryRouter initialEntries={["/auth-callback"]}>
          <App />
        </MemoryRouter>
      );

      const githubCallback = wrapper.find("GithubCallback");
      expect(githubCallback).toHaveLength(1);
    });

    describe("onChangeToken", function() {
      afterEach(function() {
        window.localStorage.clear();
      });

      it("calls App.onChangeToken and sets local storage", function() {
        window.localStorage.githubToken = "my-token";
        const wrapper = mount(
          <MemoryRouter initialEntries={["/auth-callback"]}>
            <App />
          </MemoryRouter>
        );

        const newToken = undefined;
        const githubCallback = wrapper.find(GithubCallback);
        githubCallback.prop("onChangeToken")(newToken);

        expect(window.localStorage.githubToken).toEqual(newToken);
      });
    });
  });
});
