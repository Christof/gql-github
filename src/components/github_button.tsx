import * as React from "react";
import * as qs from "qs";
import { Button } from "material-ui";
import * as uuid from "node-uuid";
import { Github } from "../github";
const netlify = require("netlify-auth-providers");

interface Props {
  className: string;
  onChangeToken: (token: string) => void;
  github?: Github;
  authenticator?: any; // just for testing
}

interface State {
  avatar_url?: string;
}

export class GithubButton extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {
    authenticator: new netlify.default({})
  };

  readonly githubMarkUrl = "https://cdnjs.cloudflare.com/ajax/libs/octicons/4.4.0/svg/mark-github.svg";
  readonly scope = "repo,user,read:org";

  constructor(props: Props) {
    super(props);

    this.signout = this.signout.bind(this);
    this.login = this.login.bind(this);

    this.state = { avatar_url: this.githubMarkUrl };
    if (props.github) {
      this.loadAvatarUrl();
    }
  }

  loadAvatarUrl() {
    if (!this.props.github) return;

    this.props.github
      .getUser()
      .then(user => this.setState({ avatar_url: user.avatarUrl }));
  }

  signout() {
    window.localStorage.clear();
    this.props.onChangeToken(undefined);
  }

  login() {
    const host = document.location.host.split(":")[0];

    if (host === "localhost") {
      this.loginWithGithub();
    } else {
      this.loginWithNetlify();
    }
  }

  loginWithGithub() {
    const githubState = uuid.v4();
    window.localStorage.githubState = githubState;

    const githubLoginUrl =
      "https://github.com/login/oauth/authorize?" +
      qs.stringify({
        client_id: "1e031c3e419938e53c8e",
        redirect_uri: window.location.origin + "/auth-callback",
        scope: this.scope,
        state: githubState
      });
    window.location.assign(githubLoginUrl);
  }

  loginWithNetlify() {
    this.props.authenticator.authenticate(
      { provider: "github", scope: this.scope },
      (error: any, data: { token: string }) => {
        if (error) {
          return console.error("Error Authenticating with GitHub: " + error);
        }

        this.props.onChangeToken(data.token);
      }
    );
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.github === prevProps.github) return;

    this.loadAvatarUrl();
  }

  renderLogoutButton() {
    return (
      <Button
        variant="raised"
        className={this.props.className}
        onClick={this.signout}
      >
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

  renderLoginButton() {
    return (
      <Button
        variant="raised"
        className={this.props.className}
        onClick={this.login}
      >
        Login &nbsp;
        <img src={this.githubMarkUrl} />
      </Button>
    );
  }

  render() {
    if (this.props.github !== undefined) {
      return this.renderLogoutButton();
    }

    return this.renderLoginButton();
  }
}
