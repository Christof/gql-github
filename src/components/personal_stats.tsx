import * as React from "react";
import {
  DetailedRepositorySelector,
  RepositoriesPerOwner
} from "./detailed_repository_selector";
import { Github, GithubAuthorData } from "../github";
import { Section } from "./section";
import { Typography, Grid } from "material-ui";

interface Props {
  token: string;
}

interface State {
  github: Github;
  repositoriesPerOwner?: RepositoriesPerOwner;
  author: string;
  data: GithubAuthorData[];
}

export class PersonalStats extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const github = new Github(props.token);
    this.state = { github, author: "", data: [] };

    github.getUser().then(user => this.setState({ author: user.login }));
  }

  async loadData(repositoriesPerOwner: RepositoriesPerOwner) {
    const data = [] as GithubAuthorData[];
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

          if (authorData !== undefined) data.push(authorData);
        })
      );
    }

    this.setState({ data });
    console.log(data);
  }

  renderStatsSection() {
    if (this.state.data.length === 0) return null;

    const total = this.state.data.reduce((sum, repo) => sum + repo.total, 0);
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
