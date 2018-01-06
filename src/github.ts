import { getNamesOfOwnRepositories } from "./stats_helper";

export interface GithubAuthorData {
  author: { login: string };
  total: number;
  weeks: { w: number; a: number; d: number; c: number }[];
}

export type GithubData = GithubAuthorData[];

export function getRequestGithub(path: string, token: string) {
  const params: RequestInit = {
    method: "GET",
    mode: "cors",
    headers: [["Authorization", `token ${token}`]]
  };

  return fetch(`https://api.github.com/${path}`, params);
}

export async function getRepositoryNames(owner: string, token: string) {
  let res = await getRequestGithub(`orgs/${owner}/repos`, token);
  if (res.status === 404) {
    res = await getRequestGithub(`users/${owner}/repos`, token);
  }
  const result = await res.json();
  return getNamesOfOwnRepositories(result);
}
