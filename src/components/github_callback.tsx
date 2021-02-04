import * as React from "react";
import * as qs from "qs";
import { RouteComponentProps } from "react-router";
import { DefaultGrid } from "./default_grid";
import { Section } from "./section";

interface Props extends RouteComponentProps<{}> {
  onChangeToken: (token: string) => void;
  fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}

export class GithubCallback extends React.Component<Props, {}> {
  async retrieveAccessToken(code: string, state: string) {
    const params: RequestInit = {
      method: "GET"
    };

    const githubAuthUrl =
      `http://${window.location.hostname}:7000/authenticate?` +
      qs.stringify({
        code,
        state
      });
    const response = await this.props.fetch(githubAuthUrl, params);
    const retrievedParams = await response.json();
    this.props.onChangeToken(retrievedParams.access_token);
    this.props.history.push("/stats");
  }

  componentDidMount() {
    const queryPrams = qs.parse(this.props.location.search.substr(1));

    const githubState = queryPrams.state;
    const storageState =
      window.localStorage.getItem("githubState") || undefined;
    if (githubState !== storageState) {
      throw new Error(
        "Retrieved state is not equal to sent one. Possible CSRF!"
      );
    }
    const state = window.localStorage.getItem("githubState");
    window.localStorage.removeItem("githubState");

    this.retrieveAccessToken(queryPrams.code as string, state);
  }

  render() {
    return (
      <DefaultGrid>
        <Section heading="Loading">
          <p>Waiting for credentials</p>
        </Section>
      </DefaultGrid>
    );
  }
}
