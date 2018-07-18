import * as React from "react";
import { Github } from "../github";
import { RepositoriesByOwnerSelector } from "./repositories_by_owner_selector";
import { DefaultGrid } from "./default_grid";
import {
  awaitAllProperties,
  TriggeredAsyncSwitch
} from "./triggered_async_switch";
import { StatsPlots, StatsPlotsProps } from "./stats_plots";
import { LinearProgress } from "material-ui";

async function loadData(
  github: Github,
  options: { owner?: string; includeForks: boolean }
) {
  const plots = {
    PlotlyChart: import("react-plotlyjs-ts").then(module => module.default),
    OverTimePlot: import("./over_time_plot").then(
      module => module.OverTimePlot
    ),
    OverallPlot: import("./overall_plot").then(module => module.OverallPlot)
  };

  github.owner = options.owner;
  const repositoryNames = await github.getRepositoryNames({
    includeForks: options.includeForks
  });

  const data = github.getStatsForRepositories(repositoryNames);

  return await awaitAllProperties({ data, ...plots, repositoryNames });
}

export function Stats(props: { github: Github }) {
  return (
    <DefaultGrid>
      <TriggeredAsyncSwitch<StatsPlotsProps>
        renderTrigger={triggerCallback => (
          <RepositoriesByOwnerSelector
            github={props.github}
            onLoad={options => triggerCallback(loadData(props.github, options))}
          />
        )}
        renderTriggered={triggeredProps =>
          triggeredProps === undefined ? (
            <LinearProgress />
          ) : (
            <StatsPlots {...triggeredProps} />
          )
        }
      />
    </DefaultGrid>
  );
}
