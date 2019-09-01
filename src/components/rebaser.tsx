import * as React from "react";
import { Github, GithubPullRequest } from "../github";
import { DefaultGrid } from "./default_grid";
import { TriggeredAsyncSwitchFromLoadType } from "./triggered_async_switch";
import { RepositorySelector } from "./repository_selector";
import { Section } from "./section";
import { LinearProgress, Button, Typography } from "@material-ui/core";
import { Dropdown } from "./dropdown";
import { useState } from "react";
import { rebasePullRequest } from "github-rebase";

export function PullRequestSelector({
  pullRequests,
  repo,
  github
}: {
  pullRequests: GithubPullRequest[];
  repo: string;
  github: Github;
}) {
  const [pullRequest, setPullRequest] = useState<string>(null);
  const [rebasing, setRebasing] = useState(false);

  const rebase = async () => {
    const pullRequestFoundByHeadRefName = pullRequests.find(
      pr => pr.headRefName === pullRequest
    );
    const pullRequestNumber = pullRequestFoundByHeadRefName.number;

    setRebasing(true);
    await rebasePullRequest({
      octokit: github.octokit,
      owner: github.owner,
      pullRequestNumber,
      repo
    });
    setRebasing(false);
  };

  return (
    <>
      <Dropdown
        options={pullRequests.map(pr => pr.headRefName)}
        onSelect={setPullRequest}
      />
      <Button
        onClick={rebase}
        variant="contained"
        disabled={!pullRequest || rebasing}
      >
        Rebase
      </Button>
      {rebasing ? (
        <div>
          <br />
          <Typography>Rebasing operation running...</Typography>
          <LinearProgress />
        </div>
      ) : null}
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
              <PullRequestSelector
                pullRequests={triggeredProps.pullRequests.filter(
                  pr => pr.mergeable === "MERGEABLE"
                )}
                repo={triggeredProps.repo}
                github={props.github}
              />
            </Section>
          )
        }
      />
    </DefaultGrid>
  );
}
