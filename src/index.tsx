import * as React from "react";
import * as ReactDOM from "react-dom";

import { App } from "./components/app";
import { windowFetch } from "./utils";

ReactDOM.render(
  (<App fetch={windowFetch} />) as any,
  document.getElementById("root")
);
