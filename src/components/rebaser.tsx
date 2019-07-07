import * as React from "react";
import { Github } from "../github";
import { DefaultGrid } from "./default_grid";
import { TriggeredAsyncSwitchFromLoadType } from "./triggered_async_switch";
import { RepositorySelector } from "./repository_selector";
import { Section } from "./section";
import { LinearProgress } from "@material-ui/core";

async function loadPullRequests(repo: string, github: Github) {
  const pullRequests = await github.getOpenPullRequests(repo);

  return {
    repo,
    pullRequests
  };
}
export function Rebaser(props: { github: Github }) {
  return (
    <DefaultGrid small>
      <TriggeredAsyncSwitchFromLoadType<typeof loadPullRequests>
        renderTrigger={callback => (
          <RepositorySelector
            {...props}
            onRepositorySelect={repository =>
              callback(loadPullRequests(repository, props.github))
            }
          />
        )}
        renderTriggered={triggeredProps =>
          triggeredProps === undefined ? (
            <Section heading="Pull Requests">
              <LinearProgress />
            </Section>
          ) : (
            <div>{JSON.stringify(triggeredProps.pullRequests)}</div>
          )
        }
      />
    </DefaultGrid>
  );
}
