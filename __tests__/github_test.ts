import { Github } from "../src/github";

describe("Github", () => {
  const fetchMock = jest.fn<Promise<Request>>();
  const github = new Github("owner", "secret-token", fetchMock);

  describe("getRequest", () => {
    it("sends request to github api, with cors and headers", async () => {
      fetchMock.mockReset();
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

  describe("getRepositories", () => {
    it("first requests repositories from organization named owner", async () => {
      fetchMock.mockReset();
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

    it("if first fails requests repositories from user named owner", async () => {
      fetchMock.mockReset();
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
        "https://api.github.com/users/owner/repos"
      );
    });
  });

  describe("getRepositoryNames", function() {
    it("returns names of not forked repositories", async () => {
      fetchMock.mockReset();
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
      fetchMock.mockReset();
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
      fetchMock.mockReset();
      fetchMock.mockReturnValue({
        status: 200,
        json() {
          return expectedTags;
        }
      });
      const tags = await github.getTags("repoName");

      expect(fetchMock).toHaveBeenCalled();
      expect(fetchMock.mock.calls[0][0]).toBe(
        "https://api.github.com/repos/owner/repoName/tags"
      );
      expect(tags).toEqual(expectedTags);
    });
  });

  describe("getReleases", function() {
    it("returns list of releases", async function() {
      const expectedReleases = [
        { id: "0", tag_name: "v0.0.1" },
        { id: "1", tag_name: "v0.0.2" }
      ];
      fetchMock.mockReset();
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

  describe("getRelease", function() {
    it("returns details for given release id", async function() {
      const expectedReleaseDetail = { body: "release description" };
      fetchMock.mockReset();
      fetchMock.mockReturnValue({
        status: 200,
        json() {
          return expectedReleaseDetail;
        }
      });
      const release = await github.getRelease("repoName", "releaseId");

      expect(fetchMock).toHaveBeenCalled();
      expect(fetchMock.mock.calls[0][0]).toBe(
        "https://api.github.com/repos/owner/repoName/releases/releaseId"
      );
      expect(release).toEqual(expectedReleaseDetail);
    });
  });
});
