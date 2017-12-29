import * as React from "react";
import * as qs from "qs";

export class GithubCallback extends React.Component<{}, {}> {
  code: string;
  constructor(props: { location: { search: string } }) {
    super(props);
    const queryPrams = qs.parse(props.location.search.substr(1));
    this.code = queryPrams.code;
    const githubState = queryPrams.state;
    if (githubState !== window.localStorage.githubState) {
      throw new Error("Retrieved state not same sent one. Possible CSRF!");
    }
    delete window.localStorage.githubState;
    console.log("code", this.code);
  }

  render() {
    return <div>Loading</div>;
  }
}
