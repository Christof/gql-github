import * as React from "react";
import { BrowserRouter, Link, Route } from "react-router-dom";

import { Stats } from "./stats";
import { GithubButton } from "./github_button";
import { GithubCallback } from "./github_callback";
import { ReleaseNotesRetriever } from "./release_notes_retriever";
import { ReleaseNotesCreator } from "./release_notes_creator";
import * as uuid from "node-uuid";
import { AppBar, Typography, Toolbar, Button } from "material-ui";
import { withStyles, Theme, StyleRules } from "material-ui/styles";
import { WithStyles } from "material-ui/styles/withStyles";

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
}

class MenuButton extends React.Component<
  { text: string; to: string; disabled: boolean; className: string },
  {}
> {
  render() {
    const { text, to, ...rest } = this.props;
    const isActive = window.location.pathname === to;
    return (
      <Button
        component={props => <Link to={to} {...props} />}
        raised
        color={isActive ? "accent" : "primary"}
        {...rest}
      >
        {text}
      </Button>
    );
  }
}

class App extends React.Component<{} & WithStyles, State> {
  constructor(props: any) {
    super(props);
    if (window.localStorage.githubState === undefined) {
      window.localStorage.githubState = uuid.v4();
    }
    const token = window.localStorage.github
      ? JSON.parse(window.localStorage.github).access_token
      : undefined;
    this.state = { token };
  }

  render() {
    const { classes } = this.props;
    return (
      <BrowserRouter>
        <div>
          <AppBar position="static">
            <Toolbar>
              <Typography type="title" color="inherit" className={classes.flex}>
                Github Stats & Releases
              </Typography>
              <MenuButton
                to="/stats"
                text="Stats"
                disabled={this.state.token === undefined}
                className={classes.menuButton}
              />
              <MenuButton
                to="/retrieve-release-notes"
                text="Retrieve Release Notes"
                className={classes.menuButton}
                disabled={this.state.token === undefined}
              />
              <MenuButton
                to="/create-release-notes"
                text="Create Release Notes"
                className={classes.menuButton}
                disabled={this.state.token === undefined}
              />
              <GithubButton
                className={classes.menuButton}
                token={this.state.token}
                onChangeToken={token => this.setState({ token })}
              />
            </Toolbar>
          </AppBar>
          <div style={{ margin: 16 }}>
            <Route
              path="/auth-callback"
              render={props => (
                <GithubCallback
                  {...props}
                  onChangeToken={token => this.setState({ token })}
                />
              )}
            />
            <Route path="/stats" component={Stats} />
            <Route
              path="/retrieve-release-notes"
              component={ReleaseNotesRetriever}
            />
            <Route
              path="/create-release-notes"
              component={ReleaseNotesCreator}
            />
          </div>
        </div>
      </BrowserRouter>
    );
  }
}

const AppStyles = withStyles(styles)<{}>(App);
export { AppStyles as App };
