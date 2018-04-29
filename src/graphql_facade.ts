import { ApolloClient } from "apollo-client";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { delay } from "./utils";
import gql from "graphql-tag";

export class GraphQLFacade {
  constructor(private client: ApolloClient<NormalizedCacheObject>) {}

  async query(
    query: string,
    variables: any = undefined,
    retries = 1,
    retryWaitSeconds = 1
  ): Promise<any> {
    try {
      const response = await this.client.query({
        query: gql(query),
        variables
      });
      if (response.errors) throw response.errors;

      return response.data;
    } catch (error) {
      console.log("Exception ", error, "for", query, "retries", retries);

      if (retries === 0) throw error;

      await delay(retryWaitSeconds);
      return this.query(query, variables, --retries);
    }
  }
}
