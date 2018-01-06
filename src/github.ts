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
