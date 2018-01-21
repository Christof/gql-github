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

class App extends React.Component<{} & WithStyles, State> {
  constructor(props: any) {
    super(props);
    if (window.localStorage.githubState === undefined) {
      window.localStorage.githubState = uuid.v4();
    }
    this.state = {};
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
              <Button
                component={props => <Link to="/stats" {...props} />}
                raised
                disabled={this.state.token === undefined}
                color="primary"
                className={classes.menuButton}
              >
                Stats
              </Button>
              <Button
                raised
                color="primary"
                className={classes.menuButton}
                component={props => (
                  <Link to="/retrieve-release-notes" {...props} />
                )}
              >
                Retrieve Release Notes
              </Button>
              <Button
                raised
                color="primary"
                className={classes.menuButton}
                component={props => (
                  <Link to="/create-release-notes" {...props} />
                )}
              >
                Create Release Notes
              </Button>
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
