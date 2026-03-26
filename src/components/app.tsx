import * as React from "react";
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Menu as MenuIcon } from "@mui/icons-material";
import { Github } from "../github";
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { persistCache, LocalStorageWrapper } from "apollo3-cache-persist";
import { createDynamicImport } from "./dynamic_import";
import { GraphQLFacade } from "../graphql_facade";
import { ChangelogCreator } from "./changelog_creator";

const drawerWidth = 240;

const RootDiv = styled("div")({
  width: "100%",
  flexGrow: 1
});

const AppFrameDiv = styled("div")({
  zIndex: 1,
  overflow: "hidden",
  position: "relative",
  display: "flex",
  width: "100%"
});

const StyledAppBar = styled(AppBar, {
  shouldForwardProp: prop => prop !== "drawerOpen"
})<{ drawerOpen?: boolean }>(({ theme, drawerOpen }) => ({
  position: "absolute",
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  ...(drawerOpen && { width: `calc(100% - ${drawerWidth}px)` })
}));

const FlexTypography = styled(Typography)({
  flex: 1
});

const ContentArea = styled("main")(({ theme }) => ({
  flexGrow: 1,
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(3),
  marginTop: 62
}));

type ComponentPromise = Promise<React.FC<{ github: Github }>>;

const Stats = createDynamicImport(
  () => import("./stats").then(module => module.Stats) as ComponentPromise
);
const PersonalStats = createDynamicImport(
  () =>
    import("./personal_stats").then(
      module => module.PersonalStats
    ) as ComponentPromise
);
const OrgStats = createDynamicImport(
  () =>
    import("./org_stats").then(module => module.OrgStats) as ComponentPromise
);
const Rebaser = createDynamicImport(
  () => import("./rebaser").then(module => module.Rebaser) as ComponentPromise
);

interface Page {
  path: string;
  text: string;
  group: "Statistics" | "Release Notes" | "Changelog" | "Pull Requests";
  component: React.FC<{ github: Github }>;
}

const pages: Page[] = [
  { path: "/stats", text: "Repositories", group: "Statistics", component: Stats },
  { path: "/personal-stats", text: "Personal", group: "Statistics", component: PersonalStats },
  { path: "/org-stats", text: "Organization", group: "Statistics", component: OrgStats },
  { path: "/retrieve-release-notes", text: "Retrieve", group: "Release Notes", component: ReleaseNotesRetriever },
  { path: "/create-release-notes", text: "Create", group: "Release Notes", component: ReleaseNotesCreator },
  { path: "/create-changelog", text: "Create", group: "Changelog", component: ChangelogCreator },
  { path: "/rebase", text: "Rebase", group: "Pull Requests", component: Rebaser }
];

function createGithub(
  token: string,
  fetchFn: (input: RequestInfo, init?: RequestInit) => Promise<Response>
): Github {
  const authLink = setContext((_, { headers }) => ({
    headers: { ...headers, authorization: `Bearer ${token}` }
  }));

  const httpLink = createHttpLink({
    uri: "https://api.github.com/graphql",
    fetch: fetchFn as any
  });

  const cache = new InMemoryCache();
  persistCache({
    cache,
    storage: new LocalStorageWrapper(window.localStorage)
  });

  const client = new ApolloClient({ link: authLink.concat(httpLink), cache });
  return new Github(token, new GraphQLFacade(client), fetchFn);
}

interface Props {
  fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}

export function RawApp({ fetch }: Props) {
  const [github, setGithub] = useState<Github | undefined>(() => {
    const token = window.localStorage.getItem("githubToken");
    return token ? createGithub(token, fetch) : undefined;
  });
  const [open, setOpen] = useState(false);

  const onChangeToken = (token: string) => {
    window.localStorage.setItem("githubToken", token);
    setGithub(token ? createGithub(token, fetch) : undefined);
  };

  const activePage = pages.find(
    page => page.path === window.location.pathname
  );
  const title = activePage
    ? `${activePage.text} ${activePage.group}`
    : "Github Stats & Releases";

  return (
    <>
      <CssBaseline />
      <BrowserRouter>
        <RootDiv>
          <AppFrameDiv>
            <StyledAppBar drawerOpen={open}>
              <Toolbar>
                <IconButton
                  color="inherit"
                  aria-label="Open drawer"
                  onClick={() => setOpen(true)}
                >
                  <MenuIcon />
                </IconButton>
                <FlexTypography variant="h5" color="inherit">
                  {title}
                </FlexTypography>
                <GithubButton
                  github={github}
                  onChangeToken={token => onChangeToken(token)}
                />
              </Toolbar>
            </StyledAppBar>
            <CustomDrawer
              open={open}
              disabled={github === undefined}
              handleDrawerClose={() => setOpen(false)}
              pages={pages}
            />
            <ContentArea>
              <div id="content">
                <Routes>
                  <Route
                    path="/auth-callback"
                    element={
                      <GithubCallback
                        onChangeToken={token => onChangeToken(token)}
                        fetch={fetch}
                      />
                    }
                  />
                  {pages.map(page => (
                    <Route
                      key={page.path}
                      path={page.path}
                      element={
                        github ? (
                          <page.component github={github} />
                        ) : (
                          <div />
                        )
                      }
                    />
                  ))}
                </Routes>
              </div>
            </ContentArea>
          </AppFrameDiv>
        </RootDiv>
      </BrowserRouter>
    </>
  );
}

export const App = RawApp;

