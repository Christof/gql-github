import * as React from "react";
import { BrowserRouter, Route } from "react-router-dom";

import { MenuButton } from "./menu_button";
import { Stats } from "./stats";
import { PersonalStats } from "./personal_stats";
import { OrgStats } from "./org_stats";
import { GithubButton } from "./github_button";
import { GithubCallback } from "./github_callback";
import { ReleaseNotesRetriever } from "./release_notes_retriever";
import { ReleaseNotesCreator } from "./release_notes_creator";
import { AppBar, Typography, Toolbar, Reboot } from "material-ui";
import { withStyles, Theme, StyleRules } from "material-ui/styles";
import { WithStyles } from "material-ui/styles/withStyles";
import { Github } from "../github";

const styles = (_theme: Theme): StyleRules => ({
  root: {
    width: "100%"
  },
  flex: {
    flex: 1
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20
  }
});

interface State {
  token?: string;
  github?: Github;
}

class App extends React.Component<{} & WithStyles, State> {
  constructor(props: any) {
    super(props);

    const token = window.localStorage.github
      ? JSON.parse(window.localStorage.github).access_token
      : undefined;
    this.state = {
      token,
      github: token ? this.createGithub(token) : undefined
    };
  }

  createGithub(token: string) {
    return new Github(token);
  }

  renderAppBar() {
    const { classes } = this.props;
    const props = {
      disabled: this.state.token === undefined,
      className: classes.menuButton
    };
    return (
      <AppBar position="static">
        <Toolbar>
          <Typography type="title" color="inherit" className={classes.flex}>
            Github Stats & Releases
          </Typography>
          <MenuButton to="/stats" text="Stats" {...props} />
          <MenuButton to="/personal-stats" text="Personal Stats" {...props} />
          <MenuButton to="/org-stats" text="Org Stats" {...props} />
          <MenuButton
            to="/retrieve-release-notes"
            text="Retrieve Release Notes"
            {...props}
          />
          <MenuButton
            to="/create-release-notes"
            text="Create Release Notes"
            {...props}
          />
          <GithubButton
            className={classes.menuButton}
            github={this.state.github}
            onChangeToken={token => this.onChangeToken(token)}
          />
        </Toolbar>
      </AppBar>
    );
  }

  renderOnlyIfLoggedIn(createInner: () => JSX.Element) {
    return this.state.token ? createInner() : <div />;
  }

  onChangeToken(token: string) {
    if (token === undefined) {
      this.setState({ token, github: undefined });
    } else {
      this.setState({ token, github: this.createGithub(token) });
    }
  }

  render() {
    return (
      <div>
        <Reboot />
        <BrowserRouter>
          <div>
            {this.renderAppBar()}
            <div style={{ margin: 16 }}>
              <Route
                path="/auth-callback"
                render={props => (
                  <GithubCallback
                    {...props}
                    onChangeToken={token => this.onChangeToken(token)}
                  />
                )}
              />
              <Route
                path="/stats"
                render={props =>
                  this.renderOnlyIfLoggedIn(() => (
                    <Stats {...props} github={this.state.github} />
                  ))
                }
              />
              <Route
                path="/personal-stats"
                render={props =>
                  this.renderOnlyIfLoggedIn(() => (
                    <PersonalStats {...props} github={this.state.github} />
                  ))
                }
              />
              <Route
                path="/org-stats"
                render={props =>
                  this.renderOnlyIfLoggedIn(() => (
                    <OrgStats {...props} github={this.state.github} />
                  ))
                }
              />
              <Route
                path="/retrieve-release-notes"
                render={props =>
                  this.renderOnlyIfLoggedIn(() => (
                    <ReleaseNotesRetriever
                      {...props}
                      token={this.state.token}
                    />
                  ))
                }
              />
              <Route
                path="/create-release-notes"
                render={props =>
                  this.renderOnlyIfLoggedIn(() => (
                    <ReleaseNotesCreator {...props} token={this.state.token} />
                  ))
                }
              />
            </div>
          </div>
        </BrowserRouter>
      </div>
    );
  }
}

const AppStyles = withStyles(styles)<{}>(App);
export { AppStyles as App };
