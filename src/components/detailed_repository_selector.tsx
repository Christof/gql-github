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
}

export class DetailedRepositorySelector extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      owners: [],
      ownersState: []
    };

    props.github.getOwners().then(owners => {
      const ownersState = Array.from(new Array(owners.length), () => false);
      this.setState({ owners, ownersState });
    });
  }

  renderOwnerCheckbox(owner: string, index: number) {
    const handleChange = (_event: any, checked: boolean) => {
      const ownersState = [...this.state.ownersState];
      ownersState[index] = checked;
      this.setState({ ownersState });
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
      </Section>
    );
  }
}
