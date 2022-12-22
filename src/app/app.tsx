import RxFM from "rxfm";
import { ItemManager } from "../components/item-manager";
import { AppRouter } from "../components/router/router";
import { SideBar } from "../components/side-bar";
import { Timer } from "../components/timer";
import { Action, initialState } from "../store/state";

import { Examples } from "./examples";
import { Store } from "../store/store";
import { append, whereEq } from "rambda";
import {
  OperatorFunction,
  debounceTime,
  filter,
  identity,
  map,
  of,
  switchMap,
} from "rxjs";

export const store = new Store(initialState, {
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
  whereEq({ type: "set url" }),
  map(({ payload }: Action) => {
    console.log("EFFECT store:effect:set url", { payload });
    return null;
  })
);

export const getRouteFragment = (url: string): string => {
  const match = url.match(/^https?:\/\/localhost:\d+\/(.*)/);
  if (!match) return "";
  const [, fragment] = match;
  return fragment;
};

export const App = () => {
  // setup storage
  const cachedStateJson = localStorage.getItem("state");
  if (cachedStateJson) {
    try {
      store.replaceState(JSON.parse(cachedStateJson));
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
  // setup router
  const route = getRouteFragment(window.location.href);
  store.dispatch({
    type: "set url",
    payload: route || "examples",
  });

  store.dispatch({
    type: "set routes",
    payload: {
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
    },
  });

  return (
    <div id="app">
      <div class="sidebar">
        <SideBar routes$={store.selectState("routes")} />
      </div>
      <div class="layout">
        <AppRouter />
      </div>
    </div>
  );
};
