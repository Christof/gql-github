import { Github } from "../src/github";

describe("Github", () => {
  const fetchMock = jest.fn();
  const github = new Github("owner", "token", fetchMock);

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

      expect(fetchMock.mock.calls.length).toBe(1);
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

      expect(fetchMock.mock.calls.length).toBe(2);
      expect(fetchMock.mock.calls[1][0]).toBe(
        "https://api.github.com/users/owner/repos"
      );
    });
  });
});
