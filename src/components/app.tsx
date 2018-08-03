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
  Menu,
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
  menuOpen: boolean;
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

const drawerStyles = (theme: Theme) => ({
  root: {
    flexGrow: 1
  },
  appFrame: {
    height: 430,
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
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  "appBarShift-left": {
    marginLeft: drawerWidth
  },
  "appBarShift-right": {
    marginRight: drawerWidth
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 20
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
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  "content-left": {
    marginLeft: -drawerWidth
  },
  "content-right": {
    marginRight: -drawerWidth
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  "contentShift-left": {
    marginLeft: 0
  },
  "contentShift-right": {
    marginRight: 0
  }
});

export class CustomDrawer extends React.Component<
  { classes: any; theme: Theme },
  { open: boolean }
> {
  state = {
    open: false
  };

  handleDrawerOpen = () => {
    this.setState({ open: true });
  };

  handleDrawerClose = () => {
    this.setState({ open: false });
  };

  render() {
    const { classes } = this.props;
    const props = Object.assign(
      {
        disabled: false, //this.state.github === undefined,
        className: classes.menuButton
      },
      this.props
    );
    const drawer = (
      <Drawer
        variant="persistent"
        anchor="left"
        open={this.state.open}
        classes={{
          paper: classes.drawerPaper
        }}
      >
        <div className={classes.drawerHeader}>
          <IconButton onClick={this.handleDrawerClose}>
            <ChevronLeft />
          </IconButton>
        </div>
        <Divider />
        <MenuButton to="/stats" text="Stats" {...props} />
        <MenuButton to="/personal-stats" text="Personal Stats" {...props} />
        <MenuButton to="/org-stats" text="Org Stats" {...props} />
        <Divider />
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
      </Drawer>
    );

    return (
      <div className={classes.root}>
        <div className={classes.appFrame}>
          <AppBar
            className={classNames(classes.appBar, {
              [classes.appBarShift]: open,
              [classes[`appBarShift-left`]]: open
            })}
          >
            <Toolbar disableGutters={!open}>
              <IconButton
                color="inherit"
                aria-label="Open drawer"
                onClick={this.handleDrawerOpen}
                className={classNames(classes.menuButton, open && classes.hide)}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="title" color="inherit" noWrap>
                Persistent drawer
              </Typography>
            </Toolbar>
          </AppBar>
          {drawer}
          <main
            className={classNames(classes.content, classes[`content-left`], {
              [classes.contentShift]: open,
              [classes[`contentShift-left`]]: open
            })}
          >
            <div className={classes.drawerHeader} />
            <Typography>
              {"You think water moves fast? You should see ice."}
            </Typography>
          </main>
        </div>
      </div>
    );
  }
}

const StyledDrawer = withStyles(styles, { withTheme: true })(CustomDrawer);

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
      menuOpen: false
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

  renderAppBar() {
    const { classes } = this.props;
    const props = {
      disabled: this.state.github === undefined,
      className: classes.menuButton
    };
    return (
      <AppBar position="static">
        <Toolbar>
          <IconButton
            className={classes.menuButton}
            color="inherit"
            aria-label="Menu"
            onClick={() => this.setState({ menuOpen: !this.state.menuOpen })}
          >
            <MenuIcon />
            <Menu
              open={this.state.menuOpen}
              anchorOrigin={{
                vertical: "top",
                horizontal: "left"
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left"
              }}
            >
              <MenuButton to="/stats" text="Stats" {...props} />
              <MenuButton
                to="/personal-stats"
                text="Personal Stats"
                {...props}
              />
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
            </Menu>
          </IconButton>
          <Typography variant="title" color="inherit" className={classes.flex}>
            Github Stats & Releases
          </Typography>
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
      <>
        <CssBaseline />
        <BrowserRouter>
          <>
            {this.renderAppBar()}
            <StyledDrawer {...this.props as any} />
            {this.renderContent()}
          </>
        </BrowserRouter>
      </>
    );
  }
}

export const App = withStyles(styles)<Props>(RawApp);
