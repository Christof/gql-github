import * as React from "react";
import classNames from "classnames";
import { BrowserRouter, Route } from "react-router-dom";
import { MenuButton } from "./menu_button";
import { GithubButton } from "./github_button";
import { GithubCallback } from "./github_callback";
import { ReleaseNotesRetriever } from "./release_notes_retriever";
import { ReleaseNotesCreator } from "./release_notes_creator";
import {
  AppBar,
  Typography,
  Toolbar,
  CssBaseline,
  IconButton,
  Drawer,
  Divider
} from "@material-ui/core";
import { withStyles, Theme, StyleRules } from "@material-ui/core/styles";
import { WithStyles } from "@material-ui/core/styles/withStyles";
import { Menu as MenuIcon, ChevronLeft } from "@material-ui/icons";
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

const drawerStyles = (theme: Theme): StyleRules => ({
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
  menuButton: {
    marginRight: theme.spacing.unit * 2
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
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    marginTop: 62
  }
});

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
    const { classes } = this.props;
    const props = {
      disabled: this.state.github === undefined,
      onClick: () => this.handleDrawerClose()
    };
    const drawer = (
      <Drawer
        variant="temporary"
        anchor="left"
        open={this.state.open}
        onClose={this.handleDrawerClose}
        classes={{
          paper: classes.drawerPaper
        }}
      >
        <div className={classes.drawerHeader}>
          <Typography>Menu</Typography>
          <div className={classes.drawerCloseIcon}>
            <IconButton onClick={this.handleDrawerClose}>
              <ChevronLeft />
            </IconButton>
          </div>
        </div>
        <Divider />
        <Typography
          variant="subheading"
          color="primary"
          className={classes.subheading}
        >
          Statistics
        </Typography>
        <MenuButton to="/stats" text="Repository" {...props} />
        <MenuButton to="/personal-stats" text="Personal" {...props} />
        <MenuButton to="/org-stats" text="Organization" {...props} />
        <Divider />
        <Typography
          variant="subheading"
          color="primary"
          className={classes.subheading}
        >
          Release Notes
        </Typography>
        <MenuButton to="/retrieve-release-notes" text="Retrieve" {...props} />
        <MenuButton to="/create-release-notes" text="Create" {...props} />
      </Drawer>
    );

    return (
      <>
        <AppBar
          position="absolute"
          className={classNames(
            classes.appBar,
            this.state.open && classes.appBarOpenDrawer
          )}
        >
          <Toolbar disableGutters={true}>
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
              className={classes.flex}
            >
              Github Stats & Releases
            </Typography>
            <GithubButton
              className={classes.menuButton}
              github={this.state.github}
              onChangeToken={token => this.onChangeToken(token)}
            />
          </Toolbar>
        </AppBar>
        {drawer}
      </>
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
    const { classes } = this.props;
    return (
      <main
        className={classNames(classes.content, classes[`content-left`], {
          [classes.contentShift]: this.state.open,
          [classes[`contentShift-left`]]: this.state.open
        })}
      >
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
          {this.renderRoute("/stats", Stats)}
          {this.renderRoute("/personal-stats", PersonalStats)}
          {this.renderRoute("/org-stats", OrgStats)}
          {this.renderRoute("/retrieve-release-notes", ReleaseNotesRetriever)}
          {this.renderRoute("/create-release-notes", ReleaseNotesCreator)}
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

export const App = withStyles(drawerStyles)<Props>(RawApp);
