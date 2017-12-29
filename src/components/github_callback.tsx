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
      method: "POST",
      mode: "no-cors",
      headers: [
        ["User-Agent", "Christof"],
        ["Content-Type", "test/plain"],
        ["Accept", "application/json"]
      ]
    };

    const githubAuthUrl =
      "https://github.com/login/oauth/access_token?" +
      qs.stringify({
        client_id: "1e031c3e419938e53c8e",
        client_secret: "f5a212853274d994ceecad711cb3e09b59fb658c",
        redirect_uri: window.location.origin + "/auth-callback",
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
