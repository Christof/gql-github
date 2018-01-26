import * as React from "react";
import { DetailedRepositorySelector } from "./detailed_repository_selector";
import { Github } from "../github";

interface Props {
  token: string;
}

interface State {
  github: Github;
}

export class PersonalStats extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { github: new Github(props.token) };
  }
  render() {
    return <DetailedRepositorySelector github={this.state.github} />;
  }
}
