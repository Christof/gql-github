import { Github, GithubData } from "../src/github";

describe("Github", () => {
  const fetchMock = jest.fn<Promise<Request>>();
  const clientQueryMock = jest.fn<any>();
  let github: Github;

  beforeEach(() => {
    fetchMock.mockReset();
    clientQueryMock.mockReset();
    github = new Github(
      "secret-token",
      { query: clientQueryMock } as any,
      fetchMock
    );
    github.owner = "owner";
  });

  describe("copyFor", function() {
    it("sets the new owner", function() {
      const copy = github.copyFor("other-owner");

      expect(copy.owner).toEqual("other-owner");
    });

    it("copies token and fetch function", async () => {
      const copy = github.copyFor("other-owner");

      expect(copy.owner).toEqual("other-owner");
      fetchMock.mockReturnValue({});
      await github.getRequest("specific-path");

      expect(fetchMock).toHaveBeenCalled();
      expect(fetchMock.mock.calls[0][0]).toBe(
        "https://api.github.com/specific-path"
      );
      const params = fetchMock.mock.calls[0][1];
      expect(params.headers).toEqual([["Authorization", "token secret-token"]]);
    });
  });

  describe("getRequest", () => {
    it("sends request to github api, with cors and headers", async () => {
      fetchMock.mockReturnValue({});
      await github.getRequest("specific-path");

      expect(fetchMock).toHaveBeenCalled();
      expect(fetchMock.mock.calls[0][0]).toBe(
        "https://api.github.com/specific-path"
      );
      const params = fetchMock.mock.calls[0][1];
      expect(params.method).toBe("GET");
      expect(params.mode).toBe("cors");
      expect(params.headers).toEqual([["Authorization", "token secret-token"]]);
    });
  });

  describe("getUser", () => {
    it("returns authenticated user", async () => {
      const expectedUser = { login: "username", avatarUrl: "uavatar url" };
      clientQueryMock.mockReturnValue({
        data: {
          viewer: expectedUser
        }
      });
      const user = await github.getUser();

      expect(clientQueryMock).toHaveBeenCalled();
      expect(user).toEqual(expectedUser);
    });
  });

  describe("getOrganization", () => {
    it("returns organization that are accessible for the user", async () => {
      const expectedOrgs = [{ login: "org1" }, { login: "org2" }];
      fetchMock.mockReturnValue({
        status: 200,
        json() {
          return expectedOrgs;
        }
      });
      const orgs = await github.getOrganizations();

      expect(fetchMock).toHaveBeenCalled();
      expect(fetchMock.mock.calls[0][0]).toBe(
        "https://api.github.com/user/orgs"
      );
      expect(orgs).toEqual(expectedOrgs);
    });
  });

  describe("getOwners", function() {
    it("returns name of possible owners", async () => {
      clientQueryMock.mockReturnValue({
        data: {
          viewer: { login: "user", avatarUrl: "url" }
        }
      });
      fetchMock.mockReturnValueOnce({
        status: 200,
        json() {
          return [{ login: "org1" }, { login: "org2" }];
        }
      });

      const owners = await github.getOwners();
      expect(owners).toEqual(["user", "org1", "org2"]);
    });
  });

  describe("getRepositories", () => {
    it("first requests repositories from organization named owner", async () => {
      fetchMock.mockReturnValue({
        status: 200,
        json() {
          return [{ name: "repository" }];
        }
      });
      await github.getRepositories();

      expect(fetchMock).toHaveBeenCalled();
      expect(fetchMock.mock.calls[0][0]).toBe(
        "https://api.github.com/orgs/owner/repos"
      );
    });

    it("if first fails requests repositories from logged in user", async () => {
      fetchMock.mockReturnValueOnce({
        status: 404
      });
      fetchMock.mockReturnValueOnce({
        status: 200,
        json() {
          return [{ name: "repository" }];
        }
      });
      await github.getRepositories();

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[1][0]).toBe(
        "https://api.github.com/user/repos?affiliation=owner"
      );
    });
  });

  describe("getRepositoryNames", function() {
    it("returns names of not forked repositories", async () => {
      fetchMock.mockReturnValueOnce({
        status: 200,
        json() {
          return [
            { name: "repository 1", fork: true },
            { name: "repository 2", fork: false }
          ];
        }
      });

      expect(await github.getRepositoryNames()).toEqual(["repository 2"]);
    });
  });

  describe("compare", function() {
    it("returns compare result", async function() {
      fetchMock.mockReturnValue({
        status: 200,
        json() {
          return { commits: [] };
        }
      });
      await github.compare("repoName", "startTag", "endTag");

      expect(fetchMock).toHaveBeenCalled();
      expect(fetchMock.mock.calls[0][0]).toBe(
        "https://api.github.com/repos/owner/repoName/compare/startTag...endTag"
      );
    });
  });

  describe("getTags", function() {
    it("returns list of tags", async function() {
      const expectedTags = [{ name: "v0.0.1" }, { name: "v0.0.2" }];
      clientQueryMock.mockReturnValue({
        data: {
          repository: { refs: { nodes: expectedTags } }
        }
      });
      const tags = await github.getTags("repoName");

      expect(clientQueryMock).toHaveBeenCalled();
      expect(tags).toEqual(expectedTags);
    });
  });

  describe("getReleases", function() {
    it("returns list of releases", async function() {
      const expectedReleases = [
        { id: "0", tag_name: "v0.0.1" },
        { id: "1", tag_name: "v0.0.2" }
      ];
      fetchMock.mockReturnValue({
        status: 200,
        json() {
          return expectedReleases;
        }
      });
      const releases = await github.getReleases("repoName");

      expect(fetchMock).toHaveBeenCalled();
      expect(fetchMock.mock.calls[0][0]).toBe(
        "https://api.github.com/repos/owner/repoName/releases"
      );
      expect(releases).toEqual(expectedReleases);
    });
  });

  describe("getStats", function() {
    it("returns contribution statistic", async function() {
      const expectedStats: GithubData = [
        {
          author: { login: "author name" },
          total: 2,
          weeks: [{ w: 51, a: 1, d: 1, c: 2 }]
        }
      ];
      fetchMock.mockReturnValue({
        status: 200,
        json() {
          return expectedStats;
        }
      });
      const stats = await github.getStats("repoName");

      expect(fetchMock).toHaveBeenCalled();
      expect(fetchMock.mock.calls[0][0]).toBe(
        "https://api.github.com/repos/owner/repoName/stats/contributors"
      );
      expect(stats).toEqual(expectedStats);
    });
  });

  describe("postRelease", function() {
    it("sends post request", async function() {
      const release = {
        tag_name: "v0.0.1",
        target_commitish: "master",
        name: "v0.0.1",
        body: "release description",
        draft: false,
        prerelease: false
      };
      fetchMock.mockReturnValue({});
      await github.postRelease("repoName", release);

      expect(fetchMock).toHaveBeenCalled();
      expect(fetchMock.mock.calls[0][0]).toBe(
        "https://api.github.com/repos/owner/repoName/releases"
      );
      const params = fetchMock.mock.calls[0][1];
      expect(params.method).toBe("POST");
      expect(params.mode).toBe("cors");
      expect(params.headers).toEqual([["Authorization", "token secret-token"]]);
    });
  });
});
