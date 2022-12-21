import { prop } from "rambda";
import { BehaviorSubject, distinctUntilChanged, map } from "rxjs";
import { RouteMap } from "../components/router/router";

export type SubjectType<T> = T extends BehaviorSubject<infer X> ? X : never;

export const initialState = {
  url: "",
  routes: {} as RouteMap,
  items: ["some item!"],
};
export type State = typeof initialState;
export const state = new BehaviorSubject(initialState);

export type Action<T = any> = { type: string; payload: T };
export type Reducer<K extends keyof State> = (
  state: State[K],
  action: Action
) => State[K];

export type ReducerMap = { [K in keyof State]: Reducer<K> };

export const mapState = (fn: (state: State) => State) =>
  state.next(fn(state.value));
export const setState = (patch: Partial<State>) =>
  state.next({ ...state.value, ...patch });
export const selectState = <K extends keyof State, R = State[K]>(
  selector: ((state: State) => R) | K
) =>
  state.pipe(
    map(typeof selector === "string" ? prop(selector) : selector),
    distinctUntilChanged()
  );
