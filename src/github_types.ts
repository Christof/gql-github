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

export interface GithubReview {
  author: string;
  createdAt: Date;
}

export interface GithubPullRequest {
  author: string;
  createdAt: Date;
  reviews: GithubReview[];
  headRefName: string;
  number: number;
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
