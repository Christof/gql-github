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
  organization: string;
  items: any[];
}

export class Hello extends React.Component<HelloProps, State> {
  constructor(props: HelloProps) {
    super(props);
    console.log("props", props);
    this.state = {
      error: null,
      token: "",
      organization: "skillslab",
      items: []
    };

    this.changeToken = this.changeToken.bind(this);
    this.changeOrganization = this.changeOrganization.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  getRequestGithub(path: string) {
    const params: RequestInit = {
      method: "GET",
      mode: "cors",
      headers: [
        ["User-Agent", this.state.organization],
        ["Authorization", `token ${this.state.token}`]
      ]
    };

    return fetch(`https://api.github.com/${path}`, params);
  }

  async loadRepos() {
    try {
      let res = await this.getRequestGithub(
        `orgs/${this.state.organization}/repos`
      );
      if (res.status === 404) {
        res = await this.getRequestGithub(
          `users/${this.state.organization}/repos`
        );
      }
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

  changeToken(event: ChangeEvent<HTMLInputElement>) {
    this.setState({
      token: event.target.value
    });
  }

  changeOrganization(event: ChangeEvent<HTMLInputElement>) {
    this.setState({
      organization: event.target.value
    });
  }
  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>
            TOKEN:
            <input
              type="text"
              value={this.state.token}
              onChange={this.changeToken}
            />
          </label>
          <label>
            Organization or User:
            <input
              type="text"
              value={this.state.organization}
              onChange={this.changeOrganization}
            />
          </label>
          <input type="submit" value="Submit" />
        </form>

        <h2>Own repositories</h2>
        <ul>{this.state.items.map(item => <li key={item}>{item}</li>)}</ul>
      </div>
    );
  }
}
