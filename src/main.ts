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

function lastReleasesQuery(count: number = 1) {
  return gql(`
    query {
      repository(owner:"skillslab", name:"skills.lab") {
        releases(last: ${count}) {
          edges {
            node {
              name,
              tag {
                name
              },
              description
            }
          }
        }
      }
    }
`);
}

const httpLink = createHttpLink({
  uri: "https://api.github.com/graphql",
  fetch: fetch as any
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});

client.query({ query: lastReleasesQuery() }).then((data: any) => {
  const lastRelease = data.data.repository.releases.edges[0].node;
  console.log("#" + lastRelease.tag.name + "\n");
  console.log(lastRelease.description);
});
