// Manual mock for @octokit/rest — avoids importing the ESM package in Jest (CJS mode).
const Octokit = jest.fn().mockImplementation(() => ({
  pulls: {
    list: jest.fn(),
    get: jest.fn()
  },
  repos: {
    listCommits: jest.fn(),
    get: jest.fn()
  }
}));

module.exports = { Octokit };
