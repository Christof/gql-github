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
  tagName: string;
  description: string;
}

export interface GithubPostRelease {
  tag_name: string;
  target_commitish: string;
  name: string;
  body: string;
  draft: boolean;
  prerelease: boolean;
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
    const responseData = await this.query(
      gql(
        `
      query {
        viewer {
          organizations(last: 100) {
            nodes {
              avatarUrl
              login
            }
          }
        }
      }`
      )
    );
    return responseData.viewer.organizations.nodes;
  }

  async getOwners(): Promise<string[]> {
    const user = await this.getUser();
    const orgs = await this.getOrganizations();
    return [user.login, ...orgs.map(org => org.login)];
  }

  async getOwnedRepositories(): Promise<string[]> {
    const responseData = await this.query(
      gql(`
      {
        viewer {
          repositories(affiliations: OWNER, first: 100) {
            nodes {
              name
            }
          }
        }
      }
    `)
    );
    return responseData.viewer.repositories.nodes.map((repo: any) => repo.name);
  }

  async getOrgRepositories(): Promise<string[]> {
    const responseData = await this.query(
      gql(`
      query getOrgRepositories($org: String!) {
        organization(login: $org) {
          repositories(first: 100) {
            nodes {
              name
            }
          }
        }
      }`),
      { org: this.owner }
    );
    return responseData.organization.repositories.nodes.map(
      (repo: any) => repo.name
    );
  }

  async getRepositoryNames(): Promise<string[]> {
    const orgs = await this.getOrganizations();
    if (orgs.find(org => org.login === this.owner))
      return this.getOrgRepositories();

    return this.getOwnedRepositories();
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
    const responseData = await this.query(
      gql(`
    query getReleases($owner: String!, $repository: String!) {
      repository(owner: $owner, name: $repository) {
        releases(first: 20, orderBy: {field: CREATED_AT, direction: DESC}) {
          nodes {
            tag {
              name
            }
            description
          }
        }
      }
    }
    `),
      { owner: this.owner, repository }
    );
    return responseData.repository.releases.nodes.map((node: any) => {
      return { tagName: node.tag.name, description: node.description };
    });
  }

  async getStats(repository: string): Promise<GithubData> {
    const response = await this.getRequest(
      `repos/${this.owner}/${repository}/stats/contributors`
    );

    return response.json();
  }

  postRelease(repository: string, release: GithubPostRelease) {
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
