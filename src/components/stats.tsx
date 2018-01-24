import { OverallPlot } from "./overall_plot";
import * as React from "react";
import { getCommitsPerAuthorInDateRange } from "../stats_helper";
import * as Plotly from "plotly.js";
import { GithubData, GithubAuthorData, Github } from "../github";
import { Dropdown } from "./dropdown";
import { Typography, Grid } from "material-ui";
import { Section } from "./section";

interface Props {
  token: string;
}

interface State {
  error: any;
  owners: string[];
  github: Github;
  repositoryNames: string[];
  data: GithubData[];
}

function sum(array: number[]) {
  return array.reduce((sum, value) => sum + value, 0);
}

export class Stats extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      error: null,
      github: new Github(this.props.token),
      owners: [],
      repositoryNames: [],
      data: []
    };

    this.state.github.getOwners().then(owners => this.setState({ owners }));
  }

  setupGraph(title: string, data: GithubData) {
    if (data === undefined || data.map === undefined) {
      console.error("No data for", title, data);
      return;
    }
    const authorTimeLine = data.map(author => this.traceForAuthor(author));
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

    Plotly.newPlot(title + "-all", authorTimeLine as any, layout as any);
  }

  private getYearsArray() {
    const startYear = 2013;
    const endYear = new Date().getFullYear();
    return Array.from(new Array(endYear - startYear), (_, i) => i + startYear);
  }

  setupYearGraph(title: string, data: GithubData) {
    const years = this.getYearsArray();
    const statsPerYear = years.map(year =>
      getCommitsPerAuthorInDateRange(
        data,
        new Date(year, 0),
        new Date(year + 1, 0)
      )
    );

    const authors = Object.keys(statsPerYear[0]);
    const x = years.map((year, index) => {
      const commitsInYear = sum(Object.values(statsPerYear[index]));
      return `${year} (${commitsInYear})`;
    });

    const traces = authors.map((author: string) => {
      const yValues = statsPerYear.map(year => year[author]);
      const authorSum = data.find(d => d.author.login === author).total;
      return {
        x,
        y: yValues,
        type: "bar",
        textposition: "outside",
        text: yValues,
        hoverinfo: "name",
        name: `${author} ${authorSum}`
      };
    });

    const overallCommitCount = sum(data.map(authorData => authorData.total));

    const layout: Partial<Plotly.Layout> = {
      title: `Yearly commits in ${title} ${overallCommitCount}`,
      xaxis: {
        title: "time"
      },
      yaxis: {
        title: "commit count"
      }
    };

    Plotly.newPlot(title + "-perYear", traces as any, layout);
  }

  private traceForAuthor(statsForAuthor: GithubAuthorData) {
    return {
      type: "scatter",
      mode: "lines",
      name: statsForAuthor.author.login,
      x: statsForAuthor.weeks.map((week: any) => new Date(week.w * 1000)),
      y: statsForAuthor.weeks.map((week: any) => week.c)
    };
  }

  async selectOwner(owner: string) {
    this.state.github.owner = owner;
    const repositoryNames = await this.state.github.getRepositoryNames();
    this.setState({ repositoryNames });

    const data = await Promise.all(
      this.state.repositoryNames.map(async repo => {
        const stats = await this.state.github.getStats(repo);
        this.setupGraph(repo, stats);
        this.setupYearGraph(repo, stats);
        return stats;
      })
    );

    this.setState({ data });
  }

  renderRepoGraph(repo: string) {
    return (
      <Section key={repo}>
        <Typography type="headline" paragraph>
          {repo}
        </Typography>
        <div id={repo + "-all"} />
        <div id={repo + "-perYear"} />
      </Section>
    );
  }

  renderRepositorySelection() {
    return (
      <Section>
        <Typography type="headline" paragraph>
          Repository
        </Typography>
        <Dropdown
          label="Owner"
          options={this.state.owners}
          onSelect={owner => this.selectOwner(owner)}
        />
      </Section>
    );
  }

  render() {
    return (
      <Grid container spacing={24} justify="center">
        <Grid item xs={12}>
          {this.renderRepositorySelection()}
          {this.state.data.length > 0 && (
            <OverallPlot
              reposData={this.state.data}
              repositoryNames={this.state.repositoryNames}
            />
          )}
          <div>
            {this.state.repositoryNames.map(item => this.renderRepoGraph(item))}
          </div>
        </Grid>
      </Grid>
    );
  }
}
