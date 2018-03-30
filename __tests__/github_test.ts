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

  describe("retry", function() {
    it("retries once if gql query fails", async () => {
      github.retryWaitSeconds = 0.001;
      const expectedUser = { login: "username", avatarUrl: "uavatar url" };
      clientQueryMock.mockReturnValueOnce({ errors: ["some error"] });
      clientQueryMock.mockReturnValueOnce({
        data: {
          viewer: expectedUser
        }
      });
      const user = await github.getUser();

      expect(clientQueryMock).toHaveBeenCalledTimes(2);
      expect(user).toEqual(expectedUser);
    });

    it("fails if retry also fails", async () => {
      github.retryWaitSeconds = 0.001;
      clientQueryMock.mockReturnValue({ errors: ["some error"] });
      await expect(github.getUser()).rejects.toEqual(["some error"]);

      expect(clientQueryMock).toHaveBeenCalledTimes(2);
    });
  });

  describe("getOrganization", () => {
    it("returns organization that are accessible for the user", async () => {
      const expectedOrgs = [
        { login: "org1", avatarUrl: "url1" },
        { login: "org2", avatarUrl: "url2" }
      ];
      clientQueryMock.mockReturnValue({
        data: {
          viewer: {
            organizations: {
              nodes: expectedOrgs
            }
          }
        }
      });
      const orgs = await github.getOrganizations();

      expect(clientQueryMock).toHaveBeenCalled();
      expect(orgs).toEqual(expectedOrgs);
    });
  });

  describe("getOwners", function() {
    it("returns name of possible owners", async () => {
      clientQueryMock.mockReturnValueOnce({
        data: {
          viewer: { login: "user", avatarUrl: "url" }
        }
      });
      clientQueryMock.mockReturnValueOnce({
        data: {
          viewer: {
            organizations: {
              nodes: [{ login: "org1" }, { login: "org2" }]
            }
          }
        }
      });

      const owners = await github.getOwners();
      expect(owners).toEqual(["user", "org1", "org2"]);
    });
  });

  describe("getOwnersWithAvatar", function() {
    it("returns name and avatarUrl of possible owners", async () => {
      const userOwner = { login: "user", avatarUrl: "url" };
      clientQueryMock.mockReturnValueOnce({
        data: {
          viewer: userOwner
        }
      });

      const orgOwners = [
        { login: "org1", avatarUrl: "org1Avatar" },
        { login: "org2", avatarUrl: "org2Avatar" }
      ];
      clientQueryMock.mockReturnValueOnce({
        data: {
          viewer: {
            organizations: {
              nodes: orgOwners
            }
          }
        }
      });

      const owners = await github.getOwnersWithAvatar();
      expect(owners).toEqual([userOwner, ...orgOwners]);
    });
  });

  describe("getRepositoryNames", () => {
    beforeEach(function() {
      clientQueryMock.mockReturnValueOnce({
        data: {
          viewer: {
            organizations: {
              nodes: [{ login: "org1" }, { login: "org2" }]
            }
          }
        }
      });
    });

    it("requests repositories from organization named org1", async () => {
      clientQueryMock.mockReturnValueOnce({
        data: {
          organization: {
            repositories: {
              edges: [{ node: { name: "repo1" } }, { node: { name: "repo2" } }]
            }
          }
        }
      });

      github.owner = "org1";

      const repositories = await github.getRepositoryNames({
        includeForks: false
      });

      expect(clientQueryMock).toHaveBeenCalledTimes(2);
      expect(repositories).toEqual(["repo1", "repo2"]);
    });

    it("if owner is no org requests repositories from logged in user", async () => {
      clientQueryMock.mockReturnValueOnce({
        data: {
          viewer: {
            repositories: {
              nodes: [{ name: "repo1" }, { name: "repo2" }]
            }
          }
        }
      });
      const repositories = await github.getRepositoryNames();

      expect(clientQueryMock).toHaveBeenCalledTimes(2);
      expect(repositories).toEqual(["repo1", "repo2"]);
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
        { tagName: "v0.0.1", description: "desc1" },
        { tagName: "v0.0.2", description: "desc2" }
      ];
      clientQueryMock.mockReturnValue({
        data: {
          repository: {
            releases: {
              nodes: [
                { tag: { name: "v0.0.1" }, description: "desc1" },
                { tag: { name: "v0.0.2" }, description: "desc2" }
              ]
            }
          }
        }
      });
      const releases = await github.getReleases("repoName");

      expect(clientQueryMock).toHaveBeenCalled();
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
