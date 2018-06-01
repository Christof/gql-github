import * as React from "react";
import { Typography } from "material-ui";
import { OverallPlot } from "./overall_plot";
import { OverTimePlot } from "./over_time_plot";
import { ScatterData } from "plotly.js";
import { GithubAuthorData } from "../github_types";

interface Repo {
  name: string;
  data: GithubAuthorData;
}

interface Props {
  OverallPlot: typeof OverallPlot;
  OverTimePlot: typeof OverTimePlot;
  totalCommitCount: number;
  repositoryTimeline: Partial<ScatterData>[];
  data: Repo[];
}

export function PersonalStatsPlots(props: Props) {
  return (
    <div>
      <Typography paragraph>
        {`${props.totalCommitCount} total commit count in ${
          props.data.length
        } repositories`}
      </Typography>

      <props.OverTimePlot
        title={"Commits in Repositories"}
        data={props.repositoryTimeline}
      />

      <props.OverallPlot
        reposData={props.data.map(repo => [repo.data])}
        repositoryNames={props.data.map(repo => repo.name)}
      />
    </div>
  );
}
