import { ApolloClient, gql } from "@apollo/client";
import { delay } from "./utils";

export class GraphQLFacade {
  constructor(private client: ApolloClient) {}

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
      if (response.error) throw response.error;

      return response.data;
    } catch (error) {
      console.log("Exception ", error, "for", query, "retries", retries);

      if (retries === 0) throw error;

      await delay(retryWaitSeconds);
      return this.query(query, variables, --retries);
    }
  }
}
