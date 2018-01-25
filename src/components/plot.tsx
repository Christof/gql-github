import * as React from "react";
import { newPlot, ScatterData, Layout } from "plotly.js";

interface Props {
  title: string;
  data: Partial<ScatterData>[];
  layout: Partial<Layout>;
}

export class Plot extends React.Component<Props, {}> {
  static idCounter = 0;
  readonly id: string;

  constructor(props: Props) {
    super(props);
    this.id = (Plot.idCounter++).toString();
  }

  componentDidMount() {
    newPlot(this.id, this.props.data, this.props.layout);
  }

  render() {
    return <div id={this.id} />;
  }
}
