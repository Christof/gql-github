export function getNamesOfOwnRepositories(
  repos: { fork: boolean; name: string }[]
) {
  return repos.filter(repo => !repo.fork).map(repo => repo.name);
}
