import * as React from "react";
import { Typography } from "material-ui";
import { Dropdown } from "./dropdown";
import { Section } from "./section";
import { Github } from "../github";

interface Props {
  github: Github;
  onRepositorySelect: (repository: string) => void;
}

interface Stats {
  owners: string[];
  repositoryNames: string[];
}
export class RepositorySelector extends React.Component<Props, Stats> {
  constructor(props: Props) {
    super(props);
    this.state = {
      owners: [],
      repositoryNames: []
    };

    props.github.getOwners().then(owners => this.setState({ owners }));
  }

  async selectOwner(owner: string) {
    this.props.github.owner = owner;
    const repositoryNames = await this.props.github.getRepositoryNames();
    this.setState({ repositoryNames });
  }

  render() {
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
        <Dropdown
          label="Repository"
          options={this.state.repositoryNames}
          onSelect={repo => this.props.onRepositorySelect(repo)}
        />
      </Section>
    );
  }
}
