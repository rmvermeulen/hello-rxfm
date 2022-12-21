import RxFM from "rxfm";
import { ItemManager } from "../components/item-manager";
import { AppRouter } from "../components/router/router";
import { SideBar } from "../components/side-bar";
import { Timer } from "../components/timer";
import { initialState } from "../store/state";

import { Examples } from "./examples";
import { Store } from "../store/store";
import { append } from "rambda";

export const store = new Store(
  initialState,
  {
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
  },
  {
    "set url": ({ payload }) => {
      console.log("store:effect:set url", { payload });
      history.pushState(window.location.href, "", `/${payload as string}`);
    },
  }
);

export const getRouteFragment = (url: string): string => {
  const match = url.match(/^https?:\/\/localhost:\d+\/(.*)/);
  if (!match) return "";
  const [, fragment] = match;
  return fragment;
};

export const App = () => {
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
