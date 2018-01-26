import * as React from "react";
import { Section } from "./section";

interface Props {
  token: string;
}

interface State {}

export class PersonalStats extends React.Component<Props, State> {
  render() {
    return <Section>Personal</Section>;
  }
}
