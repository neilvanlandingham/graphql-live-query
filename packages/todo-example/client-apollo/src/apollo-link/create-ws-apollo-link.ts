// for Apollo Client v3 older than v3.5.10:
import {
  ApolloLink,
  Operation,
  FetchResult,
  Observable,
} from "@apollo/client/core";
import { print } from "graphql";
import { createClient, Client } from "graphql-ws";
import { makeAsyncIterableIteratorFromSink } from "@n1ru4l/push-pull-async-iterable-iterator";
import { applySourceToSink } from "./shared";

class GraphQLWsLink extends ApolloLink {
  private client: Client;
  constructor(url: string) {
    super();
    this.client = createClient({
      url,
    });
  }

  public request(operation: Operation): Observable<FetchResult> {
    return new Observable((sink) => {
      const source = makeAsyncIterableIteratorFromSink((sink) => {
        return this.client.subscribe<FetchResult>(
          { ...operation, query: print(operation.query) },
          {
            next: sink.next.bind(sink),
            complete: sink.complete.bind(sink),
            error: sink.error.bind(sink),
          }
        );
      });

      return applySourceToSink(source, sink);
    });
  }
}

export function createWSApolloLink(url: string) {
  return new GraphQLWsLink(url);
}
