import * as React from "react";

export interface HelloProps {
  compiler: string;
  framework: string;
}

// 'HelloProps' describes the shape of props.
// State is never set so we use the '{}' type.
export class Hello extends React.Component<HelloProps, {}> {
  constructor(props: HelloProps) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      items: []
    };
  }
  async componentDidMount() {
    try {
      const organisation = "skillslab";
      const uri = `https://api.github.com/orgs/${organisation}/repos`;
      const params: RequestInit = {
        method: "GET",
        mode: "cors",
        headers: [["User-Agent", organisation]]
      };
      // auth: { bearer: token },
      // json: true
      const res = await fetch(uri, params);
      const result = res.json();
      console.log(result);
      this.setState({
        isLoaded: true,
        items: result
      });
    } catch (error) {
      console.log(error);
      this.setState({
        isLoaded: true,
        error
      });
    }
  }
  render() {
    return (
      <h1>
        Hello from {this.props.compiler} and {this.props.framework}!
      </h1>
    );
  }
}
