import { mapObjIndexed } from "rambda";
import { BehaviorSubject } from "rxjs";
import { Action, ReducerMap, State, state } from "./state";

export class Store<TState> {
  private readonly state$: BehaviorSubject<TState>;
  constructor(initialState: TState) {
    this.state$ = new BehaviorSubject(initialState);
  }
  getState() {
    return this.state$.asObservable();
  }
  dispatch() {}
}
export const store = {
  state,
  reducers: {
    url(url, action) {
      if (action.type === "set url") {
        return action.payload;
      }
      return url;
    },
    routes(url, action) {
      if (action.type === "set routes") {
        return action.payload;
      }
      return url;
    },
  } as ReducerMap,
  dispatch(action: Action): void {
    console.log("store:dispatch", action);
    const fn = mapObjIndexed((value, key) =>
      key in this.reducers
        ? this.reducers[key as keyof State](value as any, action)
        : value
    );
    const newState = fn(this.state.value) as State;
    console.log(newState);
    this.state.next(newState);
  },
};
