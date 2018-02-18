import { PullRequest, ChangeCategory } from "../src/pull_request";

describe("PullRequest", function() {
  const pullRequest = new PullRequest(
    "PR Description",
    "123",
    ChangeCategory.Breaking
  );

  describe("toString", function() {
    it("returns a dash, the text and issue id reference", function() {
      expect(pullRequest.toString()).toEqual("- PR Description (#123)");
    });
  });

  describe("toText", function() {
    it("returns the text and issue id reference", function() {
      expect(pullRequest.toText()).toEqual("PR Description (#123)");
    });
  });

  describe("parseFrom", function() {
    it("Parses fields from Commit Message", function() {
      const parsed = PullRequest.parseFrom(
        "Merge pull request #123 from branch\n\nPR Description"
      );

      expect(parsed.id).toEqual("123");
      expect(parsed.text).toEqual("PR Description");
      expect(parsed.changeCategory).toEqual(ChangeCategory.Basic);
    });
  });
});
