import * as React from "react";
import { Github, GithubData } from "../github";
import { Grid, Typography, LinearProgress } from "material-ui";
import { Section } from "./section";
import { Dropdown } from "./dropdown";

interface Props {
  token: string;
}

interface State {
  owners: string[];
  github: Github;
  repositoryNames: string[];
  data: GithubData[];
  startedLoading: boolean;
}

export class OrgStats extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      github: new Github(this.props.token),
      owners: [],
      repositoryNames: [],
      data: [],
      startedLoading: false
    };

    this.state.github.getOwners().then(owners => this.setState({ owners }));
  }

  async selectOwner(owner: string) {
    this.setState({ startedLoading: true });

    this.state.github.owner = owner;
    const repositoryNames = await this.state.github.getRepositoryNames();

    const data = await Promise.all(
      repositoryNames.map(repo => this.state.github.getStats(repo))
    );

    this.setState({ data, repositoryNames });
  }

  renderStatsSection() {
    if (!this.state.startedLoading) return null;

    if (this.state.data.length === 0)
      return (
        <Section>
          <Typography type="headline" paragraph>
            Stats
          </Typography>
          <LinearProgress />
        </Section>
      );

    return <div>Stats</div>;
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
          {this.renderStatsSection()}
        </Grid>
      </Grid>
    );
  }
}
