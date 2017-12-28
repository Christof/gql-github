import * as React from "react";
import * as qs from "qs";

export class GithubCallback extends React.Component<{}, {}> {
  constructor(props: { location: { search: string } }) {
    super(props);
    const queryPrams = qs.parse(props.location.search.substr(1));
    console.log("code", queryPrams.code);
  }

  render() {
    return <div>Loading</div>;
  }
}
