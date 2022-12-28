import { DefaultProps } from "rxfm";
import { Observable, isObservable, of } from "rxjs";

type OptionalObservableProperties<T> = {
  [K in keyof T]: T[K] | Observable<T[K]>;
};

export type Props<T extends {}> = T & DefaultProps;
export type PropsRx<T extends {}> = OptionalObservableProperties<T> &
  DefaultProps;

export const ensureObservable = <T>(value: T | Observable<T>): Observable<T> =>
  isObservable(value) ? value : of(value);
