import * as React from "react";
import * as qs from "qs";

interface Props {}

export class GithubButton extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);

    this.signout = this.signout.bind(this);
  }

  signout() {
    window.localStorage.clear();
  }

  render() {
    const githubLoginUrl =
      "https://github.com/login/oauth/authorize?" +
      qs.stringify({
        client_id: "1e031c3e419938e53c8e",
        redirect_uri: window.location.origin + "/auth-callback",
        scope: "repo,user",
        state: window.localStorage.githubState
      });

    if (window.localStorage.github !== undefined) {
      return (
        <button
          className="f6 link dim ba ph3 pv2 mh2 mb2 dib bg-light-blue"
          onClick={this.signout}
        >
          Signout from GitHub
        </button>
      );
    }
    return (
      <a
        className="f6 link dim ba ph3 pv2 mh2 mb2 dib bg-light-blue"
        href={githubLoginUrl}
      >
        Login with GitHub
      </a>
    );
  }
}
