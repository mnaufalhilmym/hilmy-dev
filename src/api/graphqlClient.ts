import { ApolloClient, InMemoryCache } from "@apollo/client/core";
import { ApiData } from "../data/apiData";

export class GraphQLClient {
  private static _client = new ApolloClient({
    uri: ApiData.graphqlEndpoint,
    cache: new InMemoryCache(),
    headers: {
      Authorization: `Bearer ${ApiData.graphqlToken}`,
    },
  });

  static get() {
    return this._client;
  }
}
