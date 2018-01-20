import * as React from "react";
import { BrowserRouter, Link, Route } from "react-router-dom";

import { Stats } from "./stats";
import { GithubButton } from "./github_button";
import { GithubCallback } from "./github_callback";
import { ReleaseNotesRetriever } from "./release_notes_retriever";
import { ReleaseNotesCreator } from "./release_notes_creator";
import * as uuid from "node-uuid";
import { AppBar, Typography, Toolbar } from "material-ui";
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

class App extends React.Component<{} & WithStyles, {}> {
  constructor(props: any) {
    super(props);
    if (window.localStorage.githubState === undefined) {
      window.localStorage.githubState = uuid.v4();
    }
  }

  render() {
    const { classes } = this.props;
    const navClass = "f6 link dim ba ph3 pv2 mh2 mb2 dib bg-light-blue";
    return (
      <BrowserRouter>
        <div>
          <AppBar position="static">
            <Toolbar>
              <Typography type="title" color="inherit" className={classes.flex}>
                Github Stats & Releases
              </Typography>
              <GithubButton />
              <Link className={navClass} to="/stats">
                Stats
              </Link>
              <Link className={navClass} to="/retrieve-release-notes">
                Retrieve Release Notes
              </Link>
              <Link className={navClass} to="/create-release-notes">
                Create Release Notes
              </Link>
            </Toolbar>
          </AppBar>
          <div className="ph2 pv3">
            <Route path="/auth-callback" component={GithubCallback} />
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
