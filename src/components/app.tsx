import * as React from "react";
import classNames from "classnames";
import { BrowserRouter, Route } from "react-router-dom";
import { GithubButton } from "./github_button";
import { GithubCallback } from "./github_callback";
import { ReleaseNotesRetriever } from "./release_notes_retriever";
import { ReleaseNotesCreator } from "./release_notes_creator";
import { CustomDrawer } from "./custom_drawer";
import {
  AppBar,
  Typography,
  Toolbar,
  CssBaseline,
  IconButton
} from "@material-ui/core";
import { withStyles, Theme, StyleRules } from "@material-ui/core/styles";
import { WithStyles } from "@material-ui/core/styles/withStyles";
import { Menu as MenuIcon } from "@material-ui/icons";
import { Github } from "../github";
import { createHttpLink } from "apollo-link-http";
import { setContext } from "apollo-link-context";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { persistCache } from "apollo-cache-persist";
import { createDynamicImport } from "./dynamic_import";
import { GraphQLFacade } from "../graphql_facade";

interface State {
  github?: Github;
  open: boolean;
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

const drawerWidth = 240;

const styles = (theme: Theme): StyleRules => ({
  root: {
    width: "100%",
    flexGrow: 1
  },
  flex: {
    flex: 1
  },
  appFrame: {
    zIndex: 1,
    overflow: "hidden",
    position: "relative",
    display: "flex",
    width: "100%"
  },
  appBar: {
    position: "absolute",
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarOpenDrawer: {
    width: `calc(100% - ${drawerWidth}px)`
  },
  menuItemActive: {
    backgroundColor: theme.palette.action.selected
  },
  hide: {
    display: "none"
  },
  drawerPaper: {
    position: "relative",
    width: drawerWidth
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing.unit,
    ...theme.mixins.toolbar
  },
  drawerCloseIcon: {
    display: "flex",
    width: "100%",
    justifyContent: "flex-end"
  },
  subheading: {
    padding: theme.spacing.unit
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    marginTop: 62
  }
});

interface Props {
  fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}

interface Page {
  path: string;
  text: string;
  group: "Statistics" | "Release Notes";
  component: React.StatelessComponent<any> | React.ComponentClass<any>;
}

export class RawApp extends React.Component<Props & WithStyles, State> {
  private pages: Page[] = [
    {
      path: "/stats",
      text: "Repositories",
      group: "Statistics",
      component: Stats
    },
    {
      path: "/personal-stats",
      text: "Personal",
      group: "Statistics",
      component: PersonalStats
    },
    {
      path: "/org-stats",
      text: "Organization",
      group: "Statistics",
      component: OrgStats
    },
    {
      path: "/retrieve-release-notes",
      text: "Retrieve",
      group: "Release Notes",
      component: ReleaseNotesRetriever
    },
    {
      path: "/create-release-notes",
      text: "Create",
      group: "Release Notes",
      component: ReleaseNotesCreator
    }
  ];

  constructor(props: Props & WithStyles) {
    super(props);

    const token = window.localStorage.getItem("githubToken");
    this.state = {
      github: token ? this.createGithub(token) : undefined,
      open: false
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

    const cache = new InMemoryCache();
    persistCache({
      cache,
      storage: window.localStorage as any
    }).then(() => cache.reset());

    const client = new ApolloClient({
      link: authLink.concat(httpLink),
      cache
    });

    return new Github(token, new GraphQLFacade(client), this.props.fetch);
  }

  handleDrawerOpen = () => {
    this.setState({ open: true });
  };

  handleDrawerClose = () => {
    this.setState({ open: false });
  };

  renderAppBar() {
    return (
      <>
        <AppBar
          position="absolute"
          className={classNames(
            this.props.classes.appBar,
            this.state.open && this.props.classes.appBarOpenDrawer
          )}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="Open drawer"
              onClick={this.handleDrawerOpen}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="title"
              color="inherit"
              className={this.props.classes.flex}
            >
              Github Stats & Releases
            </Typography>
            <GithubButton
              github={this.state.github}
              onChangeToken={token => this.onChangeToken(token)}
            />
          </Toolbar>
        </AppBar>
        <CustomDrawer
          open={this.state.open}
          disabled={this.state.github === undefined}
          handleDrawerClose={this.handleDrawerClose}
          classes={this.props.classes}
          pages={this.pages}
        />
      </>
    );
  }

  renderOnlyIfLoggedIn(createInner: () => JSX.Element) {
    return this.state.github ? createInner() : <div />;
  }

  onChangeToken(token: string) {
    window.localStorage.setItem("githubToken", token);

    this.setState({ github: token ? this.createGithub(token) : undefined });
  }

  renderRoute({ path, component }: Page) {
    return (
      <Route
        key={path}
        path={path}
        render={props =>
          this.renderOnlyIfLoggedIn(() =>
            React.createElement(component, {
              ...props,
              github: this.state.github
            })
          )
        }
      />
    );
  }

  renderContent() {
    return (
      <main className={classNames(this.props.classes.content)}>
        <div id="content">
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
          {this.pages.map(page => this.renderRoute(page))}
        </div>
      </main>
    );
  }

  render() {
    return (
      <>
        <CssBaseline />
        <BrowserRouter>
          <div className={this.props.classes.root}>
            <div className={this.props.classes.appFrame}>
              {this.renderAppBar()}
              {this.renderContent()}
            </div>
          </div>
        </BrowserRouter>
      </>
    );
  }
}

export const App = withStyles(styles)<Props>(RawApp);
