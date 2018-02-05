import * as React from "react";
import { Section } from "./section";
import { OwnerDropdown } from "./owner_dropdown";
import {
  Typography,
  FormControlLabel,
  Checkbox,
  Button,
  FormGroup
} from "material-ui";
import { Github } from "../github";
import FormControl from "material-ui/Form/FormControl";

interface State {
  owner?: string;
  includeForks: boolean;
}

interface Props {
  github: Github;
  onLoad: (data: State) => void;
}

export class RepositoriesByOwnerSelector extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { includeForks: false };
  }

  renderIncludeForksCheckbox() {
    return (
      <FormControl>
        <FormControlLabel
          control={
            <Checkbox
              checked={this.state.includeForks}
              onChange={(_, checked) =>
                this.setState({ includeForks: checked })
              }
              value="includeForks"
            />
          }
          label="Include Forks"
        />
      </FormControl>
    );
  }

  renderControls() {
    return (
      <FormGroup row>
        <OwnerDropdown
          github={this.props.github}
          onSelect={owner => this.setState({ owner })}
        />
        {this.renderIncludeForksCheckbox()}
        <FormControl>
          <Button raised onClick={() => this.props.onLoad(this.state)}>
            Load
          </Button>
        </FormControl>
      </FormGroup>
    );
  }

  render() {
    return (
      <Section>
        <Typography type="headline" paragraph>
          Repository
        </Typography>
        {this.renderControls()}
      </Section>
    );
  }
}
