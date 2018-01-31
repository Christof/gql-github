import * as React from "react";
import * as qs from "qs";
import { Button } from "material-ui";
import * as uuid from "node-uuid";
import { Github } from "../github";

interface Props {
  className: string;
  onChangeToken: (token: string) => void;
  token?: string;
}

interface State {
  avatar_url?: string;
}

export class GithubButton extends React.Component<Props, State> {
  readonly githubMarkUrl = "https://cdnjs.cloudflare.com/ajax/libs/octicons/4.4.0/svg/mark-github.svg";

  constructor(props: Props) {
    super(props);

    this.signout = this.signout.bind(this);
    this.login = this.login.bind(this);

    this.state = { avatar_url: this.githubMarkUrl };
    if (props.token) {
      this.loadAvatarUrl();
    }
  }

  loadAvatarUrl() {
    if (!this.props.token) return;

    new Github(this.props.token)
      .getUser()
      .then(user => this.setState({ avatar_url: user.avatarUrl }));
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

  componentDidUpdate(prevProps: Props) {
    if (this.props.token === prevProps.token) return;

    this.loadAvatarUrl();
  }

  render() {
    if (this.props.token !== undefined) {
      return (
        <Button raised className={this.props.className} onClick={this.signout}>
          Logout &nbsp;
          <img
            width="16px"
            height="16px"
            style={{ borderRadius: "50%" }}
            src={this.state.avatar_url}
          />
        </Button>
      );
    }
    return (
      <Button raised className={this.props.className} onClick={this.login}>
        Login &nbsp;
        <img src={this.githubMarkUrl} />
      </Button>
    );
  }
}
