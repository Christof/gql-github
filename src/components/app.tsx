import * as React from "react";
import { BrowserRouter, Route } from "react-router-dom";

import { MenuButton } from "./menu_button";
import { GithubButton } from "./github_button";
import { GithubCallback } from "./github_callback";
import { ReleaseNotesRetriever } from "./release_notes_retriever";
import { ReleaseNotesCreator } from "./release_notes_creator";
import { AppBar, Typography, Toolbar, Reboot } from "material-ui";
import { withStyles, Theme, StyleRules } from "material-ui/styles";
import { WithStyles } from "material-ui/styles/withStyles";
import { Github } from "../github";
import { createHttpLink } from "apollo-link-http";
import { setContext } from "apollo-link-context";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";

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
  github?: Github;
}

class DynamicImport<Component> extends React.Component<
  { load: () => Promise<Component> },
  { component: Component }
> {
  state = {
    component: null as any
  };

  componentWillMount() {
    this.props.load().then(component => this.setState(() => ({ component })));
  }

  render() {
    return (this.props.children as any)(this.state.component);
  }
}

function createDynamicImport(load: () => Promise<any>) {
  return (props: any) => (
    <DynamicImport load={load}>
      {(Component: any) =>
        Component === null ? <h1>Loading!</h1> : <Component {...props} />
      }
    </DynamicImport>
  );
}

const Stats = createDynamicImport(() =>
  import("./stats").then(module => module.Stats)
);
const PersonalStats = createDynamicImport(() =>
  import("./personal_stats").then(module => module.PersonalStats)
);
const OrgStats = createDynamicImport(() =>
  import("./org_stats").then(module => module.OrgStats)
);

class App extends React.Component<{} & WithStyles, State> {
  constructor(props: any) {
    super(props);

    const token = window.localStorage.githubToken
      ? window.localStorage.githubToken
      : undefined;
    this.state = {
      github: token ? this.createGithub(token) : undefined
    };
  }

  createGithub(token: string) {
    const authLink = setContext((_, { headers }) => {
      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : null
        }
      };
    });

    const httpLink = createHttpLink({
      uri: "https://api.github.com/graphql",
      fetch: fetch as any
    });

    const client = new ApolloClient({
      link: authLink.concat(httpLink),
      cache: new InMemoryCache()
    });

    return new Github(token, client);
  }

  renderAppBar() {
    const { classes } = this.props;
    const props = {
      disabled: this.state.github === undefined,
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
    return this.state.github ? createInner() : <div />;
  }

  onChangeToken(token: string) {
    window.localStorage.githubToken = token;
    this.setState({ github: token ? this.createGithub(token) : undefined });
  }

  renderRoute<
    P,
    T extends React.Component<P, React.ComponentState>,
    C extends React.ComponentClass<P>
  >(path: string, component: React.ClassType<P, T, C>) {
    return (
      <Route
        path={path}
        render={props =>
          this.renderOnlyIfLoggedIn(() =>
            React.createElement(component, {
              ...props,
              github: this.state.github
            } as any)
          )
        }
      />
    );
  }

  renderContent() {
    return (
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
        {this.renderRoute("/stats", Stats as any)}
        {this.renderRoute("/personal-stats", PersonalStats as any)}
        {this.renderRoute("/org-stats", OrgStats as any)}
        {this.renderRoute("/retrieve-release-notes", ReleaseNotesRetriever)}
        {this.renderRoute("/create-release-notes", ReleaseNotesCreator)}
      </div>
    );
  }

  render() {
    return (
      <div>
        <Reboot />
        <BrowserRouter>
          <div>
            {this.renderAppBar()}
            {this.renderContent()}
          </div>
        </BrowserRouter>
      </div>
    );
  }
}

const AppStyles = withStyles(styles)<{}>(App);
export { AppStyles as App };
