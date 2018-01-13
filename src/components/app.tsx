import * as React from "react";
import { BrowserRouter, Link, Route } from "react-router-dom";

import { Stats } from "./stats";
import { GithubButton } from "./github_button";
import { GithubCallback } from "./github_callback";
import { ReleaseNotesRetriever } from "./release_notes_retriever";
import { ReleaseNotesCreator } from "./release_notes_creator";
import * as uuid from "node-uuid";

export class App extends React.Component<{}, {}> {
  constructor(props: any) {
    super(props);
    if (window.localStorage.githubState === undefined) {
      window.localStorage.githubState = uuid.v4();
    }
  }

  render() {
    const navClass = "f6 link dim ba ph3 pv2 mh2 mb2 dib bg-light-blue";
    return (
      <BrowserRouter>
        <div>
          <div className="pt3">
            <h3 className="mh2 mb2 mt0 dib">Stats App</h3>
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
          </div>
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
