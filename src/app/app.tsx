import RxFM from "rxfm";
import { ItemManager } from "../components/item-manager";
import { SideBar } from "../components/side-bar";
import { Timer } from "../components/timer";
import { Action, initialState } from "../store/state";

import { append, whereEq } from "rambda";
import { Router, selectRouterStateKey } from "rxfm-router";
import { OperatorFunction, debounceTime, filter, identity, tap } from "rxjs";
import { Store } from "../store/store";
import { Examples } from "./examples";

export const store = new Store(initialState, {
  items(items, action) {
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

  return (
    <div id="app">
      <div class="sidebar">
        <SideBar routes$={selectRouterStateKey("routes")} />
      </div>
      <div class="layout">
        <Router
          url={new URL("examples", window.location.href)}
          routes={{
            "": { name: "Home", component: Timer },
            about: () => <p>The about page...</p>,
            examples: {
              name: "Examples",
              component: Examples,
              children: {
                timer: Timer,
                itemManager: ItemManager,
                custom: () => <p>This is some custom code!</p>,
              },
            },
          }}
        />
      </div>
    </div>
  );
};
