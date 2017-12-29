import * as React from "react";
import { BrowserRouter, Link, Route } from "react-router-dom";
import * as qs from "qs";

import { Hello } from "./hello";
import { GithubCallback } from "./github_callback";
import * as uuid from "node-uuid";

export class App extends React.Component<{}, {}> {
  render() {
    const state = uuid.v4();
    window.localStorage.state = state;
    const githubLoginUrl =
      "https://github.com/login/oauth/authorize?" +
      qs.stringify({
        client_id: "1e031c3e419938e53c8e",
        redirect_uri: window.location.origin + "/auth-callback",
        scope: "repo,user",
        state
      });
    return (
      <BrowserRouter>
        <div>
          <a href={githubLoginUrl}>Login with GitHub</a>
          <Link to="/hello">Hello</Link>
          <Route path="/auth-callback" component={GithubCallback} />
          <Route path="/hello" component={Hello} />
        </div>
      </BrowserRouter>
    );
  }
}
