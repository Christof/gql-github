import * as React from "react";
import PlotlyChart from "react-plotlyjs-ts";
import { ScatterData, Layout } from "plotly.js";

interface Props {
  data: Partial<ScatterData>[];
  layout: Partial<Layout>;
}

export class Plot extends React.Component<Props, {}> {
  render() {
    return <PlotlyChart data={this.props.data} layout={this.props.layout} />;
  }
}
