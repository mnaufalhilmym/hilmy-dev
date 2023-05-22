import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client/core";

export class GqlClient {
  private static _client: ApolloClient<NormalizedCacheObject>;

  static init() {
    this._client = new ApolloClient({
      uri: import.meta.env.VITE_GQL_ENDPOINT,
      cache: new InMemoryCache(),
      headers: import.meta.env.VITE_GQL_TOKEN
        ? {
            Authorization: `Bearer ${import.meta.env.VITE_GQL_TOKEN}`,
          }
        : undefined,
    });
  }

  static get client() {
    return this._client;
  }
}
