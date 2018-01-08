import * as React from "react";

export interface Props {
  options: string[];
  onSelect: (selected: string) => void;
}

export class Dropdown extends React.Component<Props, {}> {
  render() {
    return (
      <select
        onChange={event => this.props.onSelect(event.target.value)}
        defaultValue="none"
      >
        <option disabled value="none">
          Select another item
        </option>
        {this.props.options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }
}
