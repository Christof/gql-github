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
  owners: OwnerState[];
}

class OwnerState {
  name: string;
  selected = false;

  repositories: string[];
  selectedRepositories: string[];

  constructor(name: string, repositories: string[]) {
    this.name = name;
    this.repositories = repositories;
    this.selectedRepositories = [...repositories];
  }
}

export class DetailedRepositorySelector extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      owners: []
    };

    this.loadData();
  }

  async loadData() {
    const ownerNames = await this.props.github.getOwners();
    const owners = await Promise.all(
      ownerNames.map(async owner => {
        const repositories = await this.props.github
          .copyFor(owner)
          .getRepositoryNames();
        return new OwnerState(owner, repositories);
      })
    );

    this.setState({ owners });
  }

  renderOwnerCheckbox(owner: OwnerState, index: number) {
    const handleChange = (_event: any, checked: boolean) => {
      const owners = [...this.state.owners];

      owners[index] = { ...owners[index], selected: checked };
      this.setState({ owners });
    };

    return (
      <FormControlLabel
        key={`checked-${owner.name}`}
        control={
          <Checkbox
            checked={owner.selected}
            onChange={handleChange}
            value={`checked-${owner.name}`}
          />
        }
        label={owner.name}
      />
    );
  }

  renderOwnerRepositories(ownerState: OwnerState, ownerIndex: number) {
    const handleChange = (name: string, checked: boolean) => {
      const selectedRepositories = checked
        ? [...ownerState.selectedRepositories, name]
        : ownerState.selectedRepositories.filter(repoName => repoName !== name);

      const owners = [...this.state.owners];
      owners[ownerIndex] = { ...ownerState, selectedRepositories };

      this.setState({ owners });
    };

    if (!ownerState.selected) return null;

    return (
      <FormGroup row key={ownerState.name}>
        {ownerState.repositories.map(name => (
          <FormControlLabel
            key={`checked-${name}`}
            control={
              <Checkbox
                checked={ownerState.selectedRepositories.includes(name)}
                onChange={(_, checked) => handleChange(name, checked)}
                value={`checked-${name}`}
              />
            }
            label={name}
          />
        ))}
      </FormGroup>
    );
  }

  render() {
    if (this.state.owners.length === 0) return null;

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
          {this.state.owners.map((owner, ownerIndex) =>
            this.renderOwnerRepositories(owner, ownerIndex)
          )}
        </FormControl>
      </Section>
    );
  }
}
