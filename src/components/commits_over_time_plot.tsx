import * as React from "react";
import PlotlyChart from "react-plotlyjs-ts";

interface Props {
  title: string;
  data: any;
}

export class CommitsOverTimePlot extends React.Component<Props, {}> {
  readonly layout: Partial<Plotly.Layout>;
  constructor(props: Props) {
    super(props);

    this.layout = {
      title: props.title,
      xaxis: {
        title: "time",
        autorange: true,
        rangeselector: {
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
        },
        type: "date",
        rangeslider: { visible: true }
      },
      yaxis: {
        title: "commit count",
        autorange: true,
        type: "linear"
      }
    };
  }
  render() {
    return <PlotlyChart data={this.props.data} layout={this.layout} />;
  }
}
