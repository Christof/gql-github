import * as React from "react";
import { Github, GithubPullRequest } from "../github";
import { DefaultGrid } from "./default_grid";
import { TriggeredAsyncSwitchFromLoadType } from "./triggered_async_switch";
import { RepositorySelector } from "./repository_selector";
import { Section } from "./section";
import { LinearProgress, Button } from "@material-ui/core";
import { Dropdown } from "./dropdown";
import { useState } from "react";

export function PullRequestSelector({
  pullRequests
}: {
  pullRequests: GithubPullRequest[];
}) {
  const [pullRequest, setPullRequest] = useState<string>(null);

  return (
    <>
      <Dropdown
        options={pullRequests.map(pr => pr.headRefName)}
        onSelect={setPullRequest}
      />
      <Button onClick={() => {}} variant="contained" disabled={!pullRequest}>
        Rebase
      </Button>
    </>
  );
}

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
            <Section heading="Pull Requests">
              <PullRequestSelector pullRequests={triggeredProps.pullRequests} />
            </Section>
          )
        }
      />
    </DefaultGrid>
  );
}
