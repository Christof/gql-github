import * as React from "react";

interface State {
  owner: string;
}

interface Props {
  updateOwner: (owner: string) => void;
}
export class Owner extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      owner: "skillslab"
    };

    this.changeOwner = this.changeOwner.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  changeOwner(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      owner: event.target.value
    });
  }

  async handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    this.props.updateOwner(this.state.owner);
  }
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Owner
          <input
            type="text"
            value={this.state.owner}
            onChange={this.changeOwner}
          />
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}
