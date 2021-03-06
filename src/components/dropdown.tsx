import * as React from "react";
import Select from "@material-ui/core/Select";
import { InputLabel, MenuItem, FormControl } from "@material-ui/core";
import { equals } from "ramda";

export interface Props {
  label?: string;
  options: string[];
  iconUrls?: string[];
  initialSelection?: string;
  onSelect: (selected: string) => void;
  style?: React.CSSProperties;
}

interface State {
  selected: string;
}

export class Dropdown extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selected:
        props.initialSelection !== undefined ? props.initialSelection : "none"
    };
  }

  componentDidUpdate(prevProps: Readonly<Props>, _prevState: Readonly<State>) {
    if (
      this.props.initialSelection !== undefined &&
      !equals(this.props.options, prevProps.options)
    ) {
      this.setState({ selected: this.props.initialSelection });
    }
  }

  onChange(selected: string) {
    this.setState({ selected });
    this.props.onSelect(selected);
  }

  private renderMenuItem(option: string, index: number) {
    return (
      <MenuItem key={option} value={option}>
        {this.props.iconUrls ? (
          <img
            width="14px"
            height="14px"
            style={{ marginRight: 8, marginLeft: 4 }}
            src={this.props.iconUrls[index]}
          />
        ) : null}
        {option}
      </MenuItem>
    );
  }

  render() {
    return (
      <FormControl style={{ marginRight: 8, ...this.props.style }}>
        {this.props.label && (
          <InputLabel htmlFor={this.props.label}>{this.props.label}</InputLabel>
        )}
        <Select
          id={this.props.label}
          autoWidth={true}
          onChange={event => this.onChange(event.target.value as string)}
          value={this.state.selected}
        >
          <MenuItem disabled value="none" key="none">
            Select {this.props.label}
          </MenuItem>
          {this.props.options.map((option, index) =>
            this.renderMenuItem(option, index)
          )}
        </Select>
      </FormControl>
    );
  }
}
