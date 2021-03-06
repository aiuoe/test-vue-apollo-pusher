import { ApolloLink, Observable } from "apollo-link";

// Inspired by https://github.com/rmosolgo/graphql-ruby/blob/master/javascript_client/src/subscriptions/PusherLink.ts
export default class PusherLink extends ApolloLink {
  pusher: any = undefined
  constructor(options: any) {
    super();

    this.pusher = options.pusher;
  }

  request(operation: any, forward: any): any {
    const subscribeObservable = new Observable((_observer) => {
    });

    // Capture the super method
    const prevSubscribe = subscribeObservable.subscribe.bind(
      subscribeObservable
    );

    // Override subscribe to return an `unsubscribe` object, see
    // https://github.com/apollographql/subscriptions-transport-ws/blob/master/src/client.ts#L182-L212
    subscribeObservable.subscribe = (observerOrNext, onError, onComplete) => {
      prevSubscribe(observerOrNext, onError, onComplete);

      const observer = getObserver(observerOrNext, onError, onComplete);

      let subscriptionChannel: any;

      forward(operation).subscribe({
        next: (data: any) => {
          // If the operation has the subscription channel, it's a subscription
          subscriptionChannel = this.getChannelFromResponse(data, operation);

          // No subscription found in the response, pipe data through
          if (!subscriptionChannel) {
            observer.next(data);
            observer.complete();

            return;
          }

          this.subscribeToChannel(subscriptionChannel, observer);
        },
      });

      // Return an object that will unsubscribe_if the query was a subscription
      return {
        closed: false,
        unsubscribe: () => {
          subscriptionChannel &&
            this.unsubscribeFromChannel(subscriptionChannel);
        },
      };
    };

    return subscribeObservable;
  }

  subscribeToChannel(subscriptionChannel: any, observer: any) {
    this.pusher
      .subscribe(subscriptionChannel)
      .bind("lighthouse-subscription", (payload: any) => {
        if (!payload.more) {
          this.unsubscribeFromChannel(subscriptionChannel);

          observer.complete();
        }

        const result = payload.result;

        if (result) {
          observer.next(result);
        }
      });
  }

  unsubscribeFromChannel(subscriptionChannel: any) {
    this.pusher.unsubscribe(subscriptionChannel);
  }

  getChannelFromResponse(response: any, operation: any) {
    return !!response.extensions &&
      !!response.extensions.lighthouse_subscriptions &&
      !!response.extensions.lighthouse_subscriptions.channels
      ? response.extensions.lighthouse_subscriptions.channels[
          operation.operationName
        ]
      : null;
  }
}

// Turn `subscribe` arguments into an observer-like thing, see getObserver
// https://github.com/apollographql/subscriptions-transport-ws/blob/master/src/client.ts#L329-L343
function getObserver(observerOrNext: any, onError: any, onComplete: any) {
  if (typeof observerOrNext === "function") {
    // Duck-type an observer
    return {
      // next: (v: any) => observerOrNext(v),
      next: (v: any) => observerOrNext(v),
      error: (e: any) => onError && onError(e),
      complete: () => onComplete && onComplete(),
    };
  } else {
    // Make an object that calls to the given object, with safety checks
    return {
      next: (v: any) => observerOrNext.next && observerOrNext.next(v),
      error: (e: any) => observerOrNext.error && observerOrNext.error(e),
      complete: () => observerOrNext.complete && observerOrNext.complete(),
    };
  }
}