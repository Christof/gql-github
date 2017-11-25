import fetch from 'node-fetch';
import gql from 'graphql-tag';
import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

const lastReleaseQuery = gql(`
query {
  repository(owner:"skillslab", name:"skills.lab") {
    releases(last: 1) {
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
`)

const client = new ApolloClient({
  link: createHttpLink({ uri: 'https://api.github.com/graphql', fetch }),
  cache: new InMemoryCache(),
});

client.query(lastReleaseQuery).then((data: any) => {
  console.log(data.data);
})