import { Subject } from './Subject';
import { ObserverOrNext } from './Observer';
import { Subscription } from './Subscription';
export declare class BehaviorSubject<T> extends Subject<T> {
    private _value;
    constructor(_value: T);
    get value(): T;
    subscribe(observerOrNext: ObserverOrNext<T>): Subscription;
    next(value: T): void;
}
