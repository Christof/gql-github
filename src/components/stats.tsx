import * as React from "react";
import { Github } from "../github";
import { Section } from "./section";
import { RepositoriesByOwnerSelector } from "./repositories_by_owner_selector";
import { DefaultGrid } from "./default_grid";
import { zipObj } from "ramda";
import {
  triggeredAsyncSwitch,
  container,
  progressToContentSwitch
} from "./triggered_async_switch";
import { StatsPlots } from "./stats_plots";

type UnpromisifiedObject<T> = { [k in keyof T]: Unpromisify<T[k]> };
type Unpromisify<T> = T extends Promise<infer U> ? U : T;

async function awaitAllProperties<
  T extends { [key: string]: Promise<any> | any }
>(obj: T): Promise<UnpromisifiedObject<T>> {
  const results = await Promise.all(Object.values(obj));

  return zipObj(Object.keys(obj), results) as UnpromisifiedObject<T>;
}

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

const TriggeredStatsPlots = triggeredAsyncSwitch(
  RepositoriesByOwnerSelector,
  "onLoad",
  container(Section, { heading: "Stats" }, progressToContentSwitch(StatsPlots))
);

export function Stats(props: { github: Github }) {
  return (
    <DefaultGrid>
      <TriggeredStatsPlots
        github={props.github}
        onLoad={(options: { owner?: string; includeForks: boolean }) =>
          loadData(props.github, options)
        }
      />
    </DefaultGrid>
  );
}
