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

export function getRequestGithub(path: string, token: string) {
  const params: RequestInit = {
    method: "GET",
    mode: "cors",
    headers: [["Authorization", `token ${token}`]]
  };

  return fetch(`https://api.github.com/${path}`, params);
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
