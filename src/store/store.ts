import { mapObjIndexed, prop } from "rambda";
import {
  BehaviorSubject,
  Observable,
  OperatorFunction,
  Subject,
  distinctUntilChanged,
  from,
  map,
} from "rxjs";
import { Action, ReducerMap } from "./state";

export class Store<TState extends Record<string, unknown>, TEffects = {}> {
  private readonly state$: BehaviorSubject<TState>;
  private readonly actions$: Subject<Action>;

  constructor(
    private readonly initialState: TState,
    private readonly reducers: ReducerMap<TState>
  ) {
    this.state$ = new BehaviorSubject(initialState);
    this.actions$ = new Subject<Action>();
  }
  reset() {
    this.state$.next(this.initialState);
  }
  replaceState(state: TState) {
    this.state$.next(state);
  }
  getState() {
    return this.state$.asObservable();
  }
  getActions() {
    return this.actions$.asObservable();
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
    this.actions$.next(action);
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
