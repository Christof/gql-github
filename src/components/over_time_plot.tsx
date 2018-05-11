import * as React from "react";
import PlotlyChart from "react-plotlyjs-ts";
import { ScatterData } from "plotly.js";

interface Props {
  title: string;
  yaxisTitle?: string;
  data: Partial<ScatterData>[];
}

export class OverTimePlot extends React.Component<Props, {}> {
  readonly layout: Partial<Plotly.Layout>;
  readonly rangeselector: Partial<Plotly.RangeSelector> = {
    buttons: [
      {
        count: 6,
        label: "6m",
        step: "month",
        stepmode: "backward"
      },
      {
        count: 1,
        label: "1y",
        step: "year",
        stepmode: "backward"
      },
      { step: "all" }
    ]
  };

  constructor(props: Props) {
    super(props);

    this.layout = {
      title: props.title,
      xaxis: {
        title: "time",
        autorange: true,
        rangeselector: this.rangeselector,
        type: "date",
        rangeslider: { visible: true }
      },
      yaxis: {
        title: this.props.yaxisTitle || "commit count",
        autorange: true,
        type: "linear"
      }
    };
  }

  render() {
    return <PlotlyChart data={this.props.data} layout={this.layout as any} />;
  }
}
