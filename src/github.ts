import { getNamesOfOwnRepositories } from "./stats_helper";

export interface GithubUser {
  login: string;
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
  id?: number;
  tag_name: string;
  name: string;
  body: string;
  draft: boolean;
  prerelease: boolean;
  target_commitish: string;
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

  constructor(private token: string, private fetch = windowFetch) {}

  getRequest(path: string) {
    const params: RequestInit = {
      method: "GET",
      mode: "cors",
      headers: [["Authorization", `token ${this.token}`]]
    };

    return this.fetch(`https://api.github.com/${path}`, params);
  }

  async getUser(): Promise<GithubUser> {
    const response = await this.getRequest(`user`);
    return await response.json();
  }

  async getOrganizations(): Promise<GithubUser[]> {
    const response = await this.getRequest(`user/orgs`);
    return await response.json();
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

  async getTags(repository: string): Promise<GithubTag[]> {
    const response = await this.getRequest(
      `repos/${this.owner}/${repository}/tags`
    );
    return await response.json();
  }

  async getReleases(repository: string): Promise<GithubRelease[]> {
    const response = await this.getRequest(
      `repos/${this.owner}/${repository}/releases`
    );
    return await response.json();
  }

  async getRelease(
    repository: string,
    releaseId: string
  ): Promise<GithubRelease> {
    const response = await this.getRequest(
      `repos/${this.owner}/${repository}/releases/${releaseId}`
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
