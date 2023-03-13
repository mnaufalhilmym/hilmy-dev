export class ApiData {
  static backendEndpoint = import.meta.env.DEV
    ? "http://localhost:1337"
    : "https://hilmy.dev/_/blog";
  static graphqlEndpoint = `${this.backendEndpoint}/graphql`;

  static graphqlToken =
    "6f0544672b5792864551aad8e7eb3ba5eaa362798a103a0498c332427878ffa46456207b39bf3f57ba69f481bfcf6a7f4d8981fa0cdbf80daafe5d7bff4ea976465dfd6e2054428b6bfbdc25851b21b01bf41b297e2ee41bc19b49f9f8b36478c93d9ab4899d23275092bf205b060629f508207b9d7039c077624d992e3fcd6c";
}
