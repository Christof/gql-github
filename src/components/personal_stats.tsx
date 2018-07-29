import * as React from "react";
import {
  DetailedRepositorySelector,
  RepositoriesPerOwner
} from "./detailed_repository_selector";
import { Github, GithubAuthorData } from "../github";
import { Section } from "./section";
import { Grid, LinearProgress } from "material-ui";
import { runningAverage } from "../array_helper";
import { calculateWeeklyCommitsForAuthor } from "../stats_helper";
import { PersonalStatsPlots } from "./personal_stats_plots";
import { TriggeredAsyncSwitchFromLoadType } from "./triggered_async_switch";

interface Repo {
  name: string;
  data: GithubAuthorData;
}

async function loadData(
  github: Github,
  repositoriesPerOwner: RepositoriesPerOwner
) {
  const author = await github.getUser().then(user => user.login);

  const overTimePlotPromise = import("./over_time_plot").then(
    module => module.OverTimePlot
  );
  const overallPlotPromise = import("./overall_plot").then(
    module => module.OverallPlot
  );

  const data = await loadRepoData(github, repositoriesPerOwner, author);

  const totalCommitCount = data.reduce((sum, repo) => sum + repo.data.total, 0);

  const repositoryTimeline = data.map(repo =>
    traceForRepo(repo.name, repo.data)
  );
  repositoryTimeline.push(...traceForSum(data));

  const [OverTimePlot, OverallPlot] = await Promise.all([
    overTimePlotPromise,
    overallPlotPromise
  ]);

  return {
    data,
    totalCommitCount,
    repositoryTimeline,
    OverTimePlot,
    OverallPlot
  };
}

async function loadRepoData(
  github: Github,
  repositoriesPerOwner: RepositoriesPerOwner,
  author: string
) {
  const data = [] as Repo[];
  for (let [owner, repositories] of repositoriesPerOwner.entries()) {
    const githubForOwner = github.copyFor(owner);
    const authorDataForRepository = await Promise.all(
      repositories.map(
        async repo => await getAuthorData(author, githubForOwner, repo)
      )
    );
    data.push(...authorDataForRepository.filter(item => item !== undefined));
  }

  return data;
}

async function getAuthorData(author: string, github: Github, repo: string) {
  const stats = await github.getStats(repo);
  if (stats === undefined || stats.length === 0 || stats.find === undefined) {
    console.error("No stats found for", repo, stats);
    return undefined;
  }

  const authorData = stats.find(
    authorData => authorData.author.login === author
  );

  if (authorData === undefined) {
    return undefined;
  }

  return { name: repo, data: authorData };
}

function traceForRepo(name: string, data: GithubAuthorData) {
  return {
    type: "scatter" as any, // any to prevent type error with ScatterData
    mode: "lines" as any, // any to prevent type error with ScatterData
    name,
    x: data.weeks.map((week: any) => new Date(week.w * 1000)),
    y: data.weeks.map((week: any) => week.c)
  };
}

function traceForSum(data: Repo[]) {
  const sortedEntries = calculateWeeklyCommits(data);
  const x = sortedEntries.map(entry => new Date(entry[0] * 1000));

  return [
    {
      type: "scatter",
      mode: "lines",
      name: "Sum",
      x,
      y: sortedEntries.map(entry => entry[1])
    },
    {
      type: "scatter",
      mode: "lines",
      name: "Trend",
      x,
      y: runningAverage(sortedEntries.map(entry => entry[1]), 2)
    }
  ];
}

/**
 * Calculates sum of commits per week.
 *
 * @returns Array of [week, commitsInWeek]
 */
function calculateWeeklyCommits(data: Repo[]): number[][] {
  const weeklyCommitsForAuthor = calculateWeeklyCommitsForAuthor(
    data.map(x => x.data)
  );

  return Array.from(weeklyCommitsForAuthor.entries()).sort(
    (a, b) => a[0] - b[0]
  );
}

export function PersonalStats(props: { github: Github }) {
  return (
    <Grid container spacing={24} justify="center">
      <Grid item xs={12}>
        <TriggeredAsyncSwitchFromLoadType<typeof loadData>
          renderTrigger={triggerCallback => (
            <DetailedRepositorySelector
              github={props.github}
              onChange={options =>
                triggerCallback(loadData(props.github, options))
              }
            />
          )}
          renderTriggered={triggeredProps => (
            <Section heading={"Stats"}>
              {triggeredProps === undefined ? (
                <LinearProgress />
              ) : (
                <PersonalStatsPlots {...triggeredProps} />
              )}
            </Section>
          )}
        />
      </Grid>
    </Grid>
  );
}
