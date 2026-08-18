// Mock for react-plotly.js — avoids loading the heavy Plotly bundle in tests.
const React = require("react");

const Plot = React.forwardRef(function Plot(_props, _ref) {
  return React.createElement("div", { "data-testid": "plotly-chart" });
});
Plot.displayName = "Plot";
module.exports = Plot;
module.exports.default = Plot;
