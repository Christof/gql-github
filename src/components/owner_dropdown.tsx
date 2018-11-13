import * as React from "react";
import { Github } from "../github";
import { Dropdown } from "./dropdown";

interface Props {
  github: Github;
  onSelect: (selected: string) => void;
}

export interface State {
  owners: string[];
  iconUrls: string[];
}

export class OwnerDropdown extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { owners: [], iconUrls: [] };

    props.github.getOwnersWithAvatar().then(ownersWithAvatar =>
      this.setState({
        owners: ownersWithAvatar.map(o => o.login),
        iconUrls: ownersWithAvatar.map(o => o.avatarUrl)
      })
    );
  }

  render() {
    return (
      <Dropdown
        label="Owner"
        options={this.state.owners}
        iconUrls={this.state.iconUrls}
        onSelect={this.props.onSelect}
      />
    );
  }
}
