import * as React from "react";
import Select from "material-ui/Select";
import { MenuItem } from "material-ui/Menu";

export interface Props {
  options: string[];
  onSelect: (selected: string) => void;
}

export class Dropdown extends React.Component<Props, {}> {
  state = { selected: "none" };

  onChange(selected: string) {
    this.setState({ selected });
    this.props.onSelect(selected);
  }

  render() {
    return (
      <Select
        onChange={event => this.onChange(event.target.value)}
        value={this.state.selected}
      >
        <MenuItem disabled value="none">
          Select another item
        </MenuItem>
        {this.props.options.map(option => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    );
  }
}
