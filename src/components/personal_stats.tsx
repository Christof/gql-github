import * as React from "react";
import {
  DetailedRepositorySelector,
  RepositoriesPerOwner
} from "./detailed_repository_selector";
import { Github, GithubAuthorData } from "../github";
import { Section } from "./section";
import { Typography, Grid } from "material-ui";
import { Plot } from "./plot";

interface Props {
  token: string;
}

interface Repo {
  name: string;
  data: GithubAuthorData;
}

interface State {
  github: Github;
  repositoriesPerOwner?: RepositoriesPerOwner;
  author: string;
  data: Repo[];
}

export class PersonalStats extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const github = new Github(props.token);
    this.state = { github, author: "", data: [] };

    github.getUser().then(user => this.setState({ author: user.login }));
  }

  async loadData(repositoriesPerOwner: RepositoriesPerOwner) {
    const data = [] as Repo[];
    for (let [owner, repositories] of repositoriesPerOwner.entries()) {
      const github = this.state.github.copyFor(owner);
      await Promise.all(
        repositories.map(async repo => {
          const stats = await github.getStats(repo);
          if (stats === undefined || stats.length === 0) {
            console.error("No stats found for", repo);
            return;
          }
          const authorData = stats.find(
            authorData => authorData.author.login === this.state.author
          );

          if (authorData !== undefined)
            data.push({ name: repo, data: authorData });
        })
      );
    }

    this.setState({ data });
    console.log(data);
  }

  private traceForRepo(name: string, data: GithubAuthorData) {
    return {
      type: "scatter",
      mode: "lines",
      name,
      x: data.weeks.map((week: any) => new Date(week.w * 1000)),
      y: data.weeks.map((week: any) => week.c)
    };
  }

  private traceForSum() {
    const data = new Map<number, number>();
    for (const repoData of this.state.data) {
      repoData.data.weeks.forEach(week => {
        const commits = data.get(week.w);
        const sum = week.c + (commits === undefined ? 0 : commits);
        data.set(week.w, sum);
      });
    }

    const sortedEntries = Array.from(data.entries()).sort(
      (a, b) => a[0] - b[0]
    );

    return {
      type: "scatter",
      mode: "lines",
      name: "Sum",
      x: sortedEntries.map(entry => new Date(entry[0] * 1000)),
      y: sortedEntries.map(entry => entry[1])
    };
  }

  renderGraph() {
    const repositoryTimeline = this.state.data.map(repo =>
      this.traceForRepo(repo.name, repo.data)
    );

    repositoryTimeline.push(this.traceForSum());

    const title = "Commits in Repositories";

    const layout = {
      title,
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
        rangeslider: { autorange: true },
        type: "date"
      },
      yaxis: {
        title: "commit count",
        autorange: true,
        type: "linear"
      }
    };

    return (
      <Plot
        title={title}
        data={repositoryTimeline as any}
        layout={layout as any}
      />
    );
  }

  renderStatsSection() {
    if (this.state.data.length === 0) return null;

    const total = this.state.data.reduce(
      (sum, repo) => sum + repo.data.total,
      0
    );
    return (
      <Section>
        <Typography type="headline" paragraph>
          Stats
        </Typography>
        <Typography paragraph>
          {`${total} total commit count in ${
            this.state.data.length
          } repositories`}
        </Typography>

        {this.renderGraph()}
      </Section>
    );
  }

  render() {
    return (
      <Grid container spacing={24} justify="center">
        <Grid item xs={12}>
          <DetailedRepositorySelector
            github={this.state.github}
            onChange={repositoriesPerOwner =>
              this.loadData(repositoriesPerOwner)
            }
          />

          {this.renderStatsSection()}
        </Grid>
      </Grid>
    );
  }
}
