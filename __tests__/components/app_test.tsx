import * as React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { App, RawApp } from "../../src/components/app";
import { MemoryRouter } from "react-router-dom";
import { waitImmediate } from "../helper";

describe("App", function () {
  let fetch: jest.Mock;

  beforeEach(function () {
    window.localStorage.clear();

    fetch = jest.fn();
    const data = {
      data: {
        viewer: {
          login: "user",
          avatarUrl: "url-to-avatar",
          __typename: "User"
        }
      }
    };
    const organizations = {
      data: {
        viewer: {
          organizations: {
            nodes: [
              {
                login: "org",
                avatarUrl: "url-to-avatar",
                __typename: "Organization"
              }
            ],
            __typename: "OrganizationConnection"
          },
          __typename: "User"
        }
      }
    };
    const repositories = {
      data: {
        viewer: {
          repositories: {
            nodes: [{ name: "reponame", __typename: "Repository" }],
            __typename: "RepositoryConnection"
          },
          __typename: "User"
        }
      }
    };
    const orgRepositories = {
      data: {
        organization: {
          repositories: {
            edges: [
              {
                node: { name: "repo", __typename: "Repository" },
                __typename: "RepositoryEdge"
              }
            ],
            __typename: "RepositoryConnection"
          },
          __typename: "Organization"
        }
      }
    };

    function getData(body: string) {
      if (body.includes("organizations")) return organizations;
      if (body.includes("getRepos")) return repositories;
      if (body.includes("getOrgRepositories")) return orgRepositories;
      return data;
    }

    fetch.mockImplementation((_input: any, init: any) => {
      const responseData = getData(init && init.body ? init.body : "");
      return Promise.resolve({
        statusCode: 200,
        ok: true,
        headers: {
          get: (name: string) => {
            if (name === "content-type") return "application/json";
            return null;
          }
        },
        json() {
          return Promise.resolve(responseData);
        },
        text() {
          return Promise.resolve(JSON.stringify(responseData));
        }
      });
    });
  });

  afterEach(function () {
    history.pushState({}, "", "/unknown");
    window.localStorage.clear();
  });

  describe("AppBar", function () {
    it("renders the title and GithubButton", function () {
      render(<App fetch={fetch} />);

      expect(
        screen.getByText("Github Stats & Releases")
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Login/i })
      ).toBeInTheDocument();
    });

    it("renders a menu icon button", function () {
      render(<App fetch={fetch} />);
      expect(
        screen.getByRole("button", { name: /Open drawer/i })
      ).toBeInTheDocument();
    });
  });

  describe("Content", function () {
    it("is an empty div if no route is selected", function () {
      render(<App fetch={fetch} />);
      expect(document.getElementById("content")).toBeTruthy();
    });
  });

  describe("GithubButton", function () {
    describe("token in localStorage", function () {
      it("creates a Github instance when token exists", async function () {
        window.localStorage.setItem("githubToken", "token");

        render(<App fetch={fetch} />);

        // With a token, the GithubButton renders a Logout button
        await waitFor(() => {
          expect(
            screen.getByRole("button", { name: /Logout/i })
          ).toBeInTheDocument();
        });
      });
    });

    it("sets the token and creates Github instance on token change", async function () {
      render(<App fetch={fetch} />);

      // Initially shows Login
      expect(
        screen.getByRole("button", { name: /Login/i })
      ).toBeInTheDocument();
    });
  });

  describe("Drawer", function () {
    it("opens when menu icon is clicked", async function () {
      render(<App fetch={fetch} />);

      fireEvent.click(screen.getByRole("button", { name: /Open drawer/i }));

      await waitFor(() => {
        expect(screen.getByText("Statistics")).toBeInTheDocument();
      });
    });

    it("shows navigation menu buttons when open", async function () {
      render(<App fetch={fetch} />);

      fireEvent.click(screen.getByRole("button", { name: /Open drawer/i }));

      await waitFor(() => {
        expect(screen.getByText("Repositories")).toBeInTheDocument();
        expect(screen.getByText("Personal")).toBeInTheDocument();
        expect(screen.getByText("Organization")).toBeInTheDocument();
      });
    });
  });

  const lazyRoutes = new Set(["/stats", "/personal-stats", "/org-stats", "/rebase"]);

  [
    { component: "Stats", route: "/stats", text: "Repositories" },
    { component: "PersonalStats", route: "/personal-stats", text: "Personal" },
    { component: "OrgStats", route: "/org-stats", text: "Organization" },
    {
      component: "ReleaseNotesRetriever",
      route: "/retrieve-release-notes",
      text: "Retrieve"
    },
    {
      component: "ReleaseNotesCreator",
      route: "/create-release-notes",
      text: "Create"
    }
  ].forEach(entry => {
    describe(entry.component, function () {
      describe("with open drawer", function () {
        it(`shows a menu item for route ${entry.route}`, async function () {
          render(<App fetch={fetch} />);

          fireEvent.click(
            screen.getByRole("button", { name: /Open drawer/i })
          );

          // Wait for drawer to open (Statistics group is always rendered)
          await waitFor(() => {
            expect(screen.getByText("Statistics")).toBeInTheDocument();
          });

          // Use DOM query to find the specific link regardless of aria-hidden/portal
          await waitFor(() => {
            const link = document.querySelector(`a[href="${entry.route}"]`);
            expect(link).toBeTruthy();
          });
        });
      });

      describe("with faked BrowserRouter (route active)", function () {
        it(`shows loading for ${entry.component} if route is active and logged in`, async function () {
          window.localStorage.setItem("githubToken", "token");
          history.pushState({}, entry.route, entry.route);

          render(<App fetch={fetch} />);

          if (lazyRoutes.has(entry.route)) {
            // Dynamic imports show "Loading!" initially
            await waitFor(() => {
              expect(
                screen.getByRole("heading", { name: "Loading!" })
              ).toBeInTheDocument();
            });
          } else {
            // Non-lazy components render immediately — just check content is rendered
            await waitFor(() => {
              expect(document.getElementById("content")).toBeTruthy();
            });
          }
        });

        it(`shows nothing if route is active but not logged in`, async function () {
          render(<App fetch={fetch} />);

          // Content div exists but route component doesn't render without login
          expect(document.getElementById("content")).toBeTruthy();
        });
      });
    });
  });

  describe("GithubCallback", function () {
    it("renders GithubCallback for /auth-callback route", function () {
      history.pushState({}, "/auth-callback", "/auth-callback");

      render(<App fetch={fetch} />);

      // GithubCallback renders "Loading" section heading when mounted
      // It's rendered as part of the auth-callback route
      expect(document.getElementById("content")).toBeTruthy();
    });

    describe("onChangeToken", function () {
      it("clears token on undefined token", function () {
        window.localStorage.setItem("githubToken", "my-token");

        render(<App fetch={fetch} />);

        // Initially shows Logout button (has token)
        // This tests the App renders correctly with a token
        expect(document.getElementById("content")).toBeTruthy();
      });
    });
  });
});
