import * as React from "react";
import { ScatterData } from "plotly.js";
import { OverTimePlot } from "./over_time_plot";

interface Props {
  traces: Partial<ScatterData>[];
  pullRequestsTraces: Partial<ScatterData>[];
  reviewsTraces: Partial<ScatterData>[];
  OverTimePlot: typeof OverTimePlot;
}

export class OrgStatsPlots extends React.Component<Props, {}> {
  render() {
    return (
      <>
        <this.props.OverTimePlot
          title="Commits per Author"
          data={this.props.traces}
        />
        <this.props.OverTimePlot
          title="Pull Requests per Author"
          yaxisTitle="review count"
          data={this.props.pullRequestsTraces}
        />
        <this.props.OverTimePlot
          title="Reviews per Author per Day"
          yaxisTitle="review count"
          data={this.props.reviewsTraces}
        />
      </>
    );
  }
}
