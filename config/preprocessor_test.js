require("@testing-library/jest-dom");

// jest-environment-jsdom-global provides `jsdom` for reconfiguring the URL in tests.

// Suppress act() warnings from async class components with the TriggeredAsyncSwitch
// pattern — this is a known limitation with class-based async state updates.
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("not wrapped in act") &&
      String(args[1]).includes("PullRequestSelector")
    ) {
      return;
    }
    originalError(...args);
  };
});
afterAll(() => {
  console.error = originalError;
});
