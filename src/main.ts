import fetch from "node-fetch";
import gql from "graphql-tag";
import { ApolloClient } from "apollo-client";
import { createHttpLink } from "apollo-link-http";
import { setContext } from "apollo-link-context";
import { InMemoryCache } from "apollo-cache-inmemory";

const authLink = setContext((_, { headers }) => {
  const token = process.env.TOKEN;
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : null
    }
  };
});

function lastReleasesQuery(
  repositoryOwner: string,
  repositoryName: string,
  count: number = 1
) {
  return gql(`
    query {
      repository(owner:"${repositoryOwner}", name:"${repositoryName}") {
        releases(last: ${count}) {
          nodes {
            name,
            tag {
              name
            },
            description
          }
        }
      }
    }
`);
}

const args = process.argv.slice(2);

const repositoryOwner = "skillslab";
const repositoryName = "skills.lab";

const releaseName = args[0];
const query = releaseName
  ? lastReleasesQuery(repositoryOwner, repositoryName, 10)
  : lastReleasesQuery(repositoryOwner, repositoryName, 1);

const httpLink = createHttpLink({
  uri: "https://api.github.com/graphql",
  fetch: fetch as any
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});

function logRelease(release: { tag: { name: string }; description: string }) {
  console.log("#" + release.tag.name + "\n");
  console.log(release.description);
}

client.query({ query }).then((data: any) => {
  const releases = data.data.repository.releases.nodes;
  if (releaseName) {
    const release = releases.find(
      (release: { tag: { name: String } }) => release.tag.name === releaseName
    );

    logRelease(release);
  } else {
    const lastRelease = releases[0];
    logRelease(lastRelease);
  }
});
