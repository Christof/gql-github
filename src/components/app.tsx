import * as React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import { MenuButton } from "./menu_button";
import { GithubButton } from "./github_button";
import { GithubCallback } from "./github_callback";
import { ReleaseNotesRetriever } from "./release_notes_retriever";
import { ReleaseNotesCreator } from "./release_notes_creator";
import { AppBar, Typography, Toolbar, CssBaseline } from "material-ui";
import { withStyles, Theme, StyleRules } from "material-ui/styles";
import { WithStyles } from "material-ui/styles/withStyles";
import { Github } from "../github";
import { createHttpLink } from "apollo-link-http";
import { setContext } from "apollo-link-context";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { createDynamicImport } from "./dynamic_import";
import { GraphQLFacade } from "../graphql_facade";

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

const Stats = createDynamicImport(() =>
  import("./stats").then(module => module.Stats)
);
const PersonalStats = createDynamicImport(() =>
  import("./personal_stats").then(module => module.PersonalStats)
);
const OrgStats = createDynamicImport(() =>
  import("./org_stats").then(module => module.OrgStats)
);

interface Props {
  fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}

export class RawApp extends React.Component<Props & WithStyles, State> {
  constructor(props: Props & WithStyles) {
    super(props);

    const token = window.localStorage.githubToken
      ? window.localStorage.githubToken
      : undefined;
    this.state = {
      github: token ? this.createGithub(token) : undefined
    };
  }

  componentDidCatch(error: any, info: any) {
    console.error(error, info);
  }

  createGithub(token: string) {
    const authLink = setContext((_, { headers }) => {
      return {
        headers: {
          ...headers,
          authorization: `Bearer ${token}`
        }
      };
    });

    const httpLink = createHttpLink({
      uri: "https://api.github.com/graphql",
      fetch: this.props.fetch
    });

    const client = new ApolloClient({
      link: authLink.concat(httpLink),
      cache: new InMemoryCache()
    });

    return new Github(token, new GraphQLFacade(client), this.props.fetch);
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
          <Typography variant="title" color="inherit" className={classes.flex}>
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

  renderRoute<P>(
    path: string,
    component: React.StatelessComponent<P> | React.ComponentClass<P>
  ) {
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
      <div id="content" style={{ margin: 16 }}>
        <Route
          path="/auth-callback"
          render={props => (
            <GithubCallback
              {...props}
              onChangeToken={token => this.onChangeToken(token)}
              fetch={this.props.fetch}
            />
          )}
        />
        {this.renderRoute("/stats", Stats)}
        {this.renderRoute("/personal-stats", PersonalStats)}
        {this.renderRoute("/org-stats", OrgStats)}
        {this.renderRoute("/retrieve-release-notes", ReleaseNotesRetriever)}
        {this.renderRoute("/create-release-notes", ReleaseNotesCreator)}
      </div>
    );
  }

  render() {
    return (
      <div>
        <CssBaseline />
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

export const App = withStyles(styles)<Props>(RawApp);
