import { getNamesOfOwnRepositories } from "./stats_helper";
import { ApolloClient } from "apollo-client";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import gql from "graphql-tag";

export interface GithubUser {
  login: string;
  avatarUrl: string;
}

export interface GithubAuthorData {
  author: { login: string };
  total: number;
  weeks: { w: number; a: number; d: number; c: number }[];
}

export type GithubData = GithubAuthorData[];

export interface GithubCompareResult {
  commits: GithubCommit[];
}

export interface GithubCommit {
  author: { login: string };
  commit: { message: string };
}

export interface GithubTag {
  name: string;
}

export interface GithubRelease {
  tag_name: string;
  body: string;
}

/**
 * Wrapper for fetch.
 *
 * Direct assignment as default parameter in constructor below
 * doesn't work.
 */
function windowFetch(input: RequestInfo, init?: RequestInit) {
  return fetch(input, init);
}

export class Github {
  public owner: string;

  constructor(
    private token: string,
    private client: ApolloClient<NormalizedCacheObject>,
    private fetch = windowFetch
  ) {}

  private async query(query: any, variables?: any) {
    const response = await this.client.query({ query, variables });
    if (response.errors) throw response.errors;

    return response.data as any;
  }

  copyFor(owner: string) {
    const copy = new Github(this.token, this.client, this.fetch);
    copy.owner = owner;

    return copy;
  }

  getRequest(path: string) {
    const params: RequestInit = {
      method: "GET",
      mode: "cors",
      headers: [["Authorization", `token ${this.token}`]]
    };

    return this.fetch(`https://api.github.com/${path}`, params);
  }

  async getUser(): Promise<GithubUser> {
    const responseData = await this.query(
      gql(`
      query {
        viewer {
          login
          avatarUrl
        }
      }`)
    );
    return responseData.viewer;
  }

  async getOrganizations(): Promise<GithubUser[]> {
    const response = await this.getRequest(`user/orgs`);
    return await response.json();
  }

  async getOwners(): Promise<string[]> {
    const user = await this.getUser();
    const orgs = await this.getOrganizations();
    return [user.login, ...orgs.map(org => org.login)];
  }

  async getRepositories() {
    let response = await this.getRequest(`orgs/${this.owner}/repos`);
    if (response.status === 404) {
      response = await this.getRequest(`user/repos?affiliation=owner`);
    }
    return await response.json();
  }

  async getRepositoryNames() {
    return getNamesOfOwnRepositories(await this.getRepositories());
  }

  async compare(repository: string, start: string, end: string) {
    const response = await this.getRequest(
      `repos/${this.owner}/${repository}/compare/${start}...${end}`
    );

    return (await response.json()) as GithubCompareResult;
  }

  async getTags(repository: string): Promise<GithubTag[]> {
    const responseData = await this.query(
      gql(
        `
      query getTags($owner: String!, $repository: String!) {
        repository(owner: $owner, name: $repository) {
          refs(refPrefix: "refs/tags/", first: 20, orderBy: {field: TAG_COMMIT_DATE, direction: DESC}) {
            nodes {
              name
            }
          }
        }
      }`
      ),
      {
        owner: this.owner,
        repository
      }
    );
    return responseData.repository.refs.nodes;
  }

  async getReleases(repository: string): Promise<GithubRelease[]> {
    const response = await this.getRequest(
      `repos/${this.owner}/${repository}/releases`
    );
    return await response.json();
  }

  async getStats(repository: string): Promise<GithubData> {
    const response = await this.getRequest(
      `repos/${this.owner}/${repository}/stats/contributors`
    );

    return response.json();
  }

  postRelease(repository: string, release: GithubRelease) {
    const params: RequestInit = {
      method: "POST",
      mode: "cors",
      body: JSON.stringify(release),
      headers: [["Authorization", `token ${this.token}`]]
    };

    return this.fetch(
      `https://api.github.com/repos/${this.owner}/${repository}/releases`,
      params
    );
  }
}
