import * as React from "react";
import * as qs from "qs";
import { Button } from "material-ui";

interface Props {
  className: string;
  onChangeToken: (token: string) => void;
  token?: string;
}

export class GithubButton extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);

    this.signout = this.signout.bind(this);
  }

  signout() {
    window.localStorage.clear();
    this.props.onChangeToken(undefined);
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

    if (this.props.token !== undefined) {
      return (
        <Button raised {...this.props} onClick={this.signout}>
          Signout from GitHub
        </Button>
      );
    }
    return (
      <Button raised {...this.props} href={githubLoginUrl}>
        Login with GitHub
      </Button>
    );
  }
}
