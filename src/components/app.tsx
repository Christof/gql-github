import * as React from "react";
import { BrowserRouter, Link, Route } from "react-router-dom";

import { Hello } from "./hello";

export class App extends React.Component<{}, {}> {
  render() {
    return (
      <BrowserRouter>
        <div>
          <Link to="/hello">Hello</Link>
        </div>
        <Route path="/hello" component={Hello} />
      </BrowserRouter>
    );
  }
}
