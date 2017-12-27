import * as React from "react";
import { FormEvent, ChangeEvent } from "react";
import { getNamesOfOwnRepositories } from "../stats_helper";

export interface HelloProps {
  compiler: string;
  framework: string;
}

interface State {
  error: any;
  token: string;
  items: any[];
}

export class Hello extends React.Component<HelloProps, State> {
  constructor(props: HelloProps) {
    super(props);
    this.state = {
      error: null,
      token: "",
      items: []
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async loadRepos() {
    try {
      const organisation = "skillslab";
      const uri = `https://api.github.com/orgs/${organisation}/repos`;
      const params: RequestInit = {
        method: "GET",
        mode: "cors",
        headers: [
          ["User-Agent", organisation],
          ["Authorization", `token ${this.state.token}`]
        ]
      };
      // auth: { bearer: token },
      // json: true
      const res = await fetch(uri, params);
      const result = await res.json();
      const own = getNamesOfOwnRepositories(result);
      console.log(own);
      this.setState({
        items: own
      });
    } catch (error) {
      console.log(error);
      this.setState({
        error
      });
    }
  }

  handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    this.loadRepos();
  }

  handleChange(event: ChangeEvent<HTMLInputElement>) {
    this.setState({
      token: event.target.value
    });
  }
  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>
            Name:
            <input
              type="text"
              value={this.state.token}
              onChange={this.handleChange}
            />
          </label>
          <input type="submit" value="Submit" />
        </form>

        <h2>Own repositories</h2>
        <ul>{this.state.items.map(item => <li>{item}</li>)}</ul>
      </div>
    );
  }
}
