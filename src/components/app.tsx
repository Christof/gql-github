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
          <div className="pt3">
            <h3 className="mh2 mb2 mt0 dib">Stats App</h3>
            <a
              className="f6 link dim ba ph3 pv2 mh2 mb2 dib bg-light-blue"
              href={githubLoginUrl}
            >
              Login with GitHub
            </a>
            <Link
              className="f6 link dim ba ph3 pv2 mh2 mb2 dib dark-blue bg-light-blue"
              to="/stats"
            >
              Stats
            </Link>
          </div>
          <div className="ph2 pv3">
            <Route path="/auth-callback" component={GithubCallback} />
            <Route path="/stats" component={Stats} />
          </div>
        </div>
      </BrowserRouter>
    );
  }
}
