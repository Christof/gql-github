import * as React from "react";
import { App, RawApp } from "../../src/components/app";
import { shallow, mount } from "enzyme";
import { waitImmediate } from "../helper";
import { MemoryRouter, Route } from "react-router";

import * as ReactRouterDom from "react-router-dom";

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

        it(`shows ${entry.component} if route is active`, async function() {
          const wrapper = mount(
            <MemoryRouter initialEntries={[entry.route]} initialIndex={0}>
              <App />
            </MemoryRouter>
          );

          expect(wrapper.find(<h1>Loading!</h1>));

          await waitImmediate();
          wrapper.update();

          expect(wrapper.find(entry.component)).toHaveLength(1);
        });
      });
    });
  });
});
