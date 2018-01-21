import * as React from "react";
import * as qs from "qs";
import { Button } from "material-ui";
import * as uuid from "node-uuid";

interface Props {
  className: string;
  onChangeToken: (token: string) => void;
  token?: string;
}

export class GithubButton extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);

    this.signout = this.signout.bind(this);
    this.login = this.login.bind(this);
  }

  signout() {
    window.localStorage.clear();
    this.props.onChangeToken(undefined);
  }

  login() {
    const githubState = uuid.v4();
    window.localStorage.githubState = githubState;
    const githubLoginUrl =
      "https://github.com/login/oauth/authorize?" +
      qs.stringify({
        client_id: "1e031c3e419938e53c8e",
        redirect_uri: window.location.origin + "/auth-callback",
        scope: "repo,user",
        state: githubState
      });
    window.location.href = githubLoginUrl;
  }

  render() {
    if (this.props.token !== undefined) {
      return (
        <Button raised className={this.props.className} onClick={this.signout}>
          Signout from GitHub
        </Button>
      );
    }
    return (
      <Button raised className={this.props.className} onClick={this.login}>
        Login with GitHub
      </Button>
    );
  }
}
