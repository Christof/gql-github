import * as React from "react";
import * as qs from "qs";

export class GithubCallback extends React.Component<{}, {}> {
  code: string;
  state: string;
  constructor(props: { location: { search: string } }) {
    super(props);
    const queryPrams = qs.parse(props.location.search.substr(1));
    this.code = queryPrams.code;
    const githubState = queryPrams.state;
    if (githubState !== window.localStorage.githubState) {
      throw new Error("Retrieved state not same sent one. Possible CSRF!");
    }
    this.state = window.localStorage.githubState;
    delete window.localStorage.githubState;
    console.log("code", this.code);
  }

  async retrieveAccessToken() {
    const params: RequestInit = {
      method: "GET"
    };

    const githubAuthUrl =
      "http://localhost:7000/authenticate?" +
      qs.stringify({
        code: this.code,
        state: this.state
      });
    const response = await fetch(githubAuthUrl, params);
    const retrievedParams = await response.json();
    console.log(retrievedParams);
  }

  componentDidMount() {
    this.retrieveAccessToken();
  }

  render() {
    return <div>Loading</div>;
  }
}
