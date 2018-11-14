import * as React from "react";
import { Typography } from "@material-ui/core";
import { Dropdown } from "./dropdown";
import { OwnerDropdown } from "./owner_dropdown";
import { Section } from "./section";
import { Github } from "../github";

interface Props {
  github: Github;
  onRepositorySelect: (repository: string) => void;
}

interface Stats {
  repositoryNames: string[];
}

export class RepositorySelector extends React.Component<Props, Stats> {
  constructor(props: Props) {
    super(props);
    this.state = {
      repositoryNames: []
    };
  }

  async selectOwner(owner: string) {
    this.props.github.owner = owner;
    const repositoryNames = await this.props.github.getRepositoryNames();
    this.setState({ repositoryNames });
  }

  render() {
    return (
      <Section>
        <Typography variant="h5" paragraph>
          Repository
        </Typography>
        <OwnerDropdown
          github={this.props.github}
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
