import * as React from "react";
import * as qs from "qs";

interface Props {
  location: { search: string };
}
export class GithubCallback extends React.Component<Props, {}> {
  async retrieveAccessToken(code: string, state: string) {
    const params: RequestInit = {
      method: "GET"
    };

    const githubAuthUrl =
      "http://localhost:7000/authenticate?" +
      qs.stringify({
        code,
        state
      });
    const response = await fetch(githubAuthUrl, params);
    const retrievedParams = await response.json();
    console.log(retrievedParams);
  }

  componentDidMount() {
    const queryPrams = qs.parse(this.props.location.search.substr(1));

    const githubState = queryPrams.state;
    if (githubState !== window.localStorage.githubState) {
      throw new Error("Retrieved state not same sent one. Possible CSRF!");
    }
    const state = window.localStorage.githubState;
    delete window.localStorage.githubState;

    this.retrieveAccessToken(queryPrams.code, state);
  }

  render() {
    return <div>Loading</div>;
  }
}
