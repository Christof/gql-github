import * as React from "react";
import { Section } from "./section";
import { OwnerDropdown } from "./owner_dropdown";
import { FormControlLabel, Checkbox, Button, Grid } from "material-ui";
import { Github } from "../github";
import FormControl from "material-ui/Form/FormControl";

interface State {
  owner?: string;
  includeForks: boolean;
}

export interface LoadData {
  owner: string;
  includeForks: boolean;
}

interface Props {
  github: Github;
  onLoad: (data: LoadData) => void;
}

export class RepositoriesByOwnerSelector extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { includeForks: false };
  }

  renderIncludeForksCheckbox() {
    return (
      <FormControlLabel
        control={
          <Checkbox
            checked={this.state.includeForks}
            onChange={(_, checked) => this.setState({ includeForks: checked })}
            value="includeForks"
          />
        }
        label="Include Forks"
        style={{ marginLeft: 4, marginRight: 24 }}
      />
    );
  }

  renderControls() {
    return (
      <Grid>
        <OwnerDropdown
          github={this.props.github}
          onSelect={owner => this.setState({ owner })}
        />
        {this.renderIncludeForksCheckbox()}
        <FormControl>
          <Button
            variant="raised"
            disabled={this.state.owner === undefined}
            onClick={() =>
              this.props.onLoad({
                owner: this.state.owner,
                includeForks: this.state.includeForks
              })
            }
          >
            Load
          </Button>
        </FormControl>
      </Grid>
    );
  }

  render() {
    return <Section heading="Repository">{this.renderControls()}</Section>;
  }
}
