import { BehaviorSubject } from "rxjs";

export type SubjectType<T> = T extends BehaviorSubject<infer X> ? X : never;

export type AppState = { items: string[] };
export const initialState: AppState = {
  items: ["some item!"],
};

export type Action<T = any> = { type: string; payload: T };
export type Reducer<TState, K extends keyof TState> = (
  state: TState[K],
  action: Action
) => TState[K];

export type ReducerMap<TState> = { [K in keyof TState]?: Reducer<TState, K> };
