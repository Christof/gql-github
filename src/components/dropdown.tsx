import * as React from "react";
import Select from "material-ui/Select";
import { MenuItem } from "material-ui/Menu";
import FormControl from "material-ui/Form/FormControl";
import { InputLabel } from "material-ui";

export interface Props {
  label?: string;
  options: string[];
  iconUrls?: string[];
  initialSelection?: string;
  onSelect: (selected: string) => void;
  style?: React.CSSProperties;
}

export class Dropdown extends React.Component<Props, { selected: string }> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selected:
        props.initialSelection !== undefined ? props.initialSelection : "none"
    };
  }

  onChange(selected: string) {
    this.setState({ selected });
    this.props.onSelect(selected);
  }

  render() {
    return (
      <FormControl style={{ marginRight: 8, ...this.props.style }}>
        {this.props.label && (
          <InputLabel htmlFor="age-simple">{this.props.label}</InputLabel>
        )}
        <Select
          autoWidth={true}
          onChange={event => this.onChange(event.target.value)}
          value={this.state.selected}
        >
          <MenuItem disabled value="none">
            Select {this.props.label}
          </MenuItem>
          {this.props.options.map((option, index) => (
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
          ))}
        </Select>
      </FormControl>
    );
  }
}
