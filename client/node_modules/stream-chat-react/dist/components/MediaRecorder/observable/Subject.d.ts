import { Observable } from './Observable';
import { Subscription, SubscriptionLike } from './Subscription';
import { Observer, ObserverOrNext } from './Observer';
export declare class Subject<T> extends Observable<T> implements SubscriptionLike {
    private _observers;
    private _observerCounter;
    thrownError: Error | undefined;
    constructor();
    get observers(): Observer<T>[];
    next(value: T): void;
    error(err: Error): void;
    complete(): void;
    subscribe(observerOrNext: ObserverOrNext<T>): Subscription;
    unsubscribe(): void;
}
