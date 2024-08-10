export interface ReadonlyStateful<T> {
    getState(): T;
}

export interface Stateful<T> extends ReadonlyStateful<T> {
    setState(state: T): void;
}
