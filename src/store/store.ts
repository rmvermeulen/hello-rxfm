import { mapObjIndexed, prop } from "rambda";
import {
  BehaviorSubject,
  Observable,
  OperatorFunction,
  distinctUntilChanged,
  from,
  map,
} from "rxjs";
import { Action, ReducerMap } from "./state";

type EffectsMap<T> = {
  [Key in keyof T]: (action: {
    type: Key;
    payload: unknown;
  }) => void | Promise<void> | Observable<void>;
};

export class Store<TState extends Record<string, unknown>, TEffects = {}> {
  private readonly state$: BehaviorSubject<TState>;
  constructor(
    private readonly initialState: TState,
    private readonly reducers: ReducerMap<TState>,
    private readonly effects: EffectsMap<TEffects> = {} as EffectsMap<TEffects>
  ) {
    this.state$ = new BehaviorSubject(initialState);
  }
  reset() {
    this.state$.next(this.initialState);
  }
  getState() {
    return this.state$.asObservable();
  }
  dispatch(action: Action) {
    console.log("store:dispatch", action);
    this.state$.next(
      mapObjIndexed(
        (value, key) =>
          key in this.reducers
            ? (this.reducers[key as keyof TState] as any)(value, action)
            : value,
        this.state$.value as any
      ) as TState
    );
    const effect = this.effects[action.type as keyof TEffects];
    if (effect) {
      const asyncObject = effect(action as any);
      if (asyncObject) {
        from(asyncObject).subscribe();
      }
    }
  }

  selectState<K extends keyof TState>(key: K): Observable<TState[K]>;
  selectState<R>(fn: (state: TState) => R): Observable<R>;
  selectState<
    K extends keyof TState,
    R extends TState[keyof TState] = TState[K]
  >(selector: ((state: TState) => R) | K) {
    const actualSelector = (
      typeof selector === "function"
        ? map(selector)
        : typeof selector === "string"
        ? map(prop(selector))
        : null
    ) as OperatorFunction<TState, TState[keyof TState]> | null;
    if (!actualSelector) {
      throw new Error("Invalid state selector");
    }
    return this.state$.pipe(actualSelector, distinctUntilChanged());
  }
}
