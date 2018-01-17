import { getNamesOfOwnRepositories } from "./stats_helper";

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
  constructor(
    private owner: string,
    private token: string,
    private fetch = windowFetch
  ) {}

  getRequest(path: string) {
    const params: RequestInit = {
      method: "GET",
      mode: "cors",
      headers: [["Authorization", `token ${this.token}`]]
    };

    return this.fetch(`https://api.github.com/${path}`, params);
  }

  async getRepositories() {
    let response = await this.getRequest(`orgs/${this.owner}/repos`);
    if (response.status === 404) {
      response = await this.getRequest(`users/${this.owner}/repos`);
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
}

export function getRequestGithub(path: string, token: string) {
  const params: RequestInit = {
    method: "GET",
    mode: "cors",
    headers: [["Authorization", `token ${token}`]]
  };

  return fetch(`https://api.github.com/${path}`, params);
}

export function postRelease(
  owner: string,
  repo: string,
  release: any,
  token: string
) {
  const params: RequestInit = {
    method: "POST",
    mode: "cors",
    body: JSON.stringify(release),
    headers: [["Authorization", `token ${token}`]]
  };

  return fetch(
    `https://api.github.com/repos/${owner}/${repo}/releases`,
    params
  );
}

export async function getRepositories(owner: string, token: string) {
  let response = await getRequestGithub(`orgs/${owner}/repos`, token);
  if (response.status === 404) {
    response = await getRequestGithub(`users/${owner}/repos`, token);
  }
  return await response.json();
}

export async function getRepositoryNames(owner: string, token: string) {
  return getNamesOfOwnRepositories(await getRepositories(owner, token));
}
