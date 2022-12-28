import { append, whereEq } from "rambda";
import RxFM from "rxfm";
import { Router, navigateTo, selectRouterStateKey } from "rxfm-router";
import {
  BehaviorSubject,
  OperatorFunction,
  debounceTime,
  filter,
  identity,
  map,
  tap,
} from "rxjs";
import { SideBar } from "../components/side-bar";
import { Action } from "../store/state";
import { Store } from "../store/store";
import { appRoutes } from "./app-routes";

export type TodoItem = {
  id: number;
  text: string;
  isCompleted: boolean;
};
export type AppState = {
  todos: TodoItem[];
};
export const initialState: AppState = {
  todos: ["some item!"].map((text, id) => ({ id, text, isCompleted: false })),
};

export const store = new Store(initialState, {
  todos(items, action) {
    if (action.type === "set items") {
      return action.payload;
    }
    if (action.type === "add item") {
      return append(action.payload, items);
    }
    return items;
  },
});

const createEffect = <T extends Action, R extends Action>(
  pred: (value: Action) => boolean,
  operator: OperatorFunction<T, R | null>
) =>
  store
    .getActions()
    .pipe(
      filter(pred),
      operator as OperatorFunction<any, R | null>,
      filter(Boolean)
    )
    .subscribe((action: R) => store.dispatch(action));

createEffect(
  whereEq({ type: "add item" }),
  tap(({ payload }: Action) => {
    console.log("EFFECT store:effect:add item", { payload });
  })
);
createEffect(
  whereEq({ type: "set items" }),
  tap(({ payload }: Action) => {
    console.log("EFFECT store:effect:set items", { payload });
  })
);

export const App = () => {
  // setup storage
  const cachedStateJson = localStorage.getItem("state");
  if (cachedStateJson) {
    try {
      store.mergeState(JSON.parse(cachedStateJson));
      console.log("state replaced!", cachedStateJson);
    } catch (ex) {
      console.error(ex);
    }
  }
  store
    .selectState(identity)
    .pipe(debounceTime(250))
    .subscribe((state) => {
      try {
        localStorage.setItem("state", JSON.stringify(state, null, 2));
        console.log("state saved");
      } catch (ex) {
        console.error(ex);
      }
    });

  const enteredRoute = new BehaviorSubject("");
  const gotoEnteredRoute = () => {
    navigateTo(enteredRoute.value);
    // enteredRoute.next("");
  };

  return (
    <div id="app">
      <div class="sidebar">
        <input
          type="text"
          value={enteredRoute}
          onInput={(e) => enteredRoute.next(e.target.value)}
          onKeyDown={(e) => {
            e.key === "Enter" && gotoEnteredRoute();
          }}
        />
        <SideBar
          routes$={selectRouterStateKey("routes").pipe(
            map((x) => [
              x,
              {
                "": "Home",
                "examples/timer": "Timer example",
                "examples/todos": "Todos example",
              },
            ])
          )}
        />
      </div>
      <div class="layout">
        <Router routes={appRoutes} />
      </div>
    </div>
  );
};
