import * as React from "react";
import * as qs from "qs";
import { RouteComponentProps } from "react-router";

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
    if (githubState !== window.localStorage.githubState) {
      throw new Error(
        "Retrieved state is not equal to sent one. Possible CSRF!"
      );
    }
    const state = window.localStorage.githubState;
    delete window.localStorage.githubState;

    this.retrieveAccessToken(queryPrams.code, state);
  }

  render() {
    return <div>Loading</div>;
  }
}
