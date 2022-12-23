import { prop } from "rambda";
import { BehaviorSubject, distinctUntilChanged, map } from "rxjs";
import { type RouteMap } from "rxfm-router";

export type SubjectType<T> = T extends BehaviorSubject<infer X> ? X : never;

export const initialState = {
  url: "",
  routes: {} as RouteMap,
  items: ["some item!"],
};
export type State = typeof initialState;

export type Action<T = any> = { type: string; payload: T };
export type Reducer<TState, K extends keyof TState> = (
  state: TState[K],
  action: Action
) => TState[K];

export type ReducerMap<TState> = { [K in keyof TState]?: Reducer<TState, K> };
