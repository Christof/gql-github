import * as React from "react";
import { Section } from "./section";
import { Github } from "../github";
import {
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  FormLabel
} from "material-ui";
import FormControl from "material-ui/Form/FormControl";

interface Props {
  github: Github;
}

interface State {
  owners: string[];
  ownersState: boolean[];
  repositories: { name: string; selected: boolean }[][];
}

export class DetailedRepositorySelector extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      owners: [],
      ownersState: [],
      repositories: []
    };

    props.github.getOwners().then(owners => {
      const ownersState = Array.from(new Array(owners.length), () => false);
      this.setState({ owners, ownersState });
    });
  }

  createDefaultRepositoryState(repository: string) {
    return { name: repository, selected: true };
  }

  async loadRepositoriesFromOwners() {
    const repositories = await Promise.all(
      this.state.owners.map(async (owner, index) => {
        if (!this.state.ownersState[index]) return [];

        const names = await this.props.github
          .copyFor(owner)
          .getRepositoryNames();

        return names.map(repository =>
          this.createDefaultRepositoryState(repository)
        );
      })
    );

    this.setState({ repositories });
  }

  renderOwnerCheckbox(owner: string, index: number) {
    const handleChange = (_event: any, checked: boolean) => {
      const ownersState = [...this.state.ownersState];
      ownersState[index] = checked;
      this.setState({ ownersState }, () => this.loadRepositoriesFromOwners());
    };

    return (
      <FormControlLabel
        key={`checked-${owner}`}
        control={
          <Checkbox
            checked={this.state.ownersState[index]}
            onChange={handleChange}
            value={`checked-${owner}`}
          />
        }
        label={owner}
      />
    );
  }

  renderRepositoryCheckbox(
    ownerIndex: number,
    name: string,
    selected: boolean
  ) {
    const handleChange = (_event: any, checked: boolean) => {
      const ownersRepos = [...this.state.repositories[ownerIndex]];
      ownersRepos.find(repoState => repoState.name === name).selected = checked;

      const repositories = [...this.state.repositories];
      repositories[ownerIndex] = ownersRepos;

      this.setState({ repositories });
    };

    return (
      <FormControlLabel
        key={`checked-${name}`}
        control={
          <Checkbox
            checked={selected}
            onChange={handleChange}
            value={`checked-${name}`}
          />
        }
        label={name}
      />
    );
  }

  render() {
    return (
      <Section>
        <Typography type="headline" paragraph>
          Repositories
        </Typography>
        <FormControl component="fieldset">
          <FormLabel component="legend">Owners</FormLabel>
          <FormGroup row>
            {this.state.owners.map((owner, index) =>
              this.renderOwnerCheckbox(owner, index)
            )}
          </FormGroup>
        </FormControl>

        <FormControl component="fieldset">
          <FormLabel component="legend">Repositories</FormLabel>
          <FormGroup row>
            {this.state.repositories.map((ownerRepositories, ownerIndex) =>
              ownerRepositories.map(repository =>
                this.renderRepositoryCheckbox(
                  ownerIndex,
                  repository.name,
                  repository.selected
                )
              )
            )}
          </FormGroup>
        </FormControl>
      </Section>
    );
  }
}
