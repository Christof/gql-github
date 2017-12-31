import * as React from "react";
import { BrowserRouter, Link, Route } from "react-router-dom";
import * as qs from "qs";

import { Stats } from "./stats";
import { GithubCallback } from "./github_callback";
import * as uuid from "node-uuid";

export class App extends React.Component<{}, {}> {
  constructor(props: any) {
    super(props);
    if (window.localStorage.githubState === undefined) {
      window.localStorage.githubState = uuid.v4();
    }
  }
  render() {
    const githubLoginUrl =
      "https://github.com/login/oauth/authorize?" +
      qs.stringify({
        client_id: "1e031c3e419938e53c8e",
        redirect_uri: window.location.origin + "/auth-callback",
        scope: "repo,user",
        state: window.localStorage.githubState
      });
    return (
      <BrowserRouter>
        <div>
          <div>
            <a href={githubLoginUrl}>Login with GitHub</a>
          </div>
          <Link to="/stats">Stats</Link>
          <Route path="/auth-callback" component={GithubCallback} />
          <Route path="/stats" component={Stats} />
        </div>
      </BrowserRouter>
    );
  }
}
