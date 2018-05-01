import * as React from "react";
import * as ReactDOM from "react-dom";

import { App } from "./components/app";

ReactDOM.render(<App fetch={fetch} />, document.getElementById("root"));
