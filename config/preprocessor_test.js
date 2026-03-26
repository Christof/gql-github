const enzyme = require("enzyme");
const Adapter = require("enzyme-adapter-react-16");

enzyme.configure({ adapter: new Adapter() });

// react-plotlyjs-ts@2.2.2 uses componentWillReceiveProps without the UNSAFE_ prefix.
// There is no newer version of the library that fixes this, so we suppress the warning.
// React passes the format string as args[0] (with %s) and the component name as args[1].
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("componentWillReceiveProps") &&
      String(args[1]).includes("PlotlyChart")
    ) {
      return;
    }
    originalWarn(...args);
  };
});
afterAll(() => {
  console.warn = originalWarn;
});

// TriggeredAsyncSwitch calls setState inside a Promise .then() callback, which
// React 16 + enzyme cannot reliably capture inside act(). The tests pass correctly;
// this is a known limitation of async class components with React 16's act() API.
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
