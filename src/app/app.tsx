import RxFM from "rxfm";
import { ItemManager } from "../components/item-manager";
import { AppRouter } from "../components/router/router";
import { SideBar } from "../components/side-bar";
import { Timer } from "../components/timer";
import { selectState, setState } from "../store/state";
import { store } from "../store/store";
import { Examples } from "./examples";

export const getRouteFragment = (url: string): string => {
  const match = url.match(/^https?:\/\/localhost:\d+\/(.*)/);
  if (!match) return "";
  const [, fragment] = match;
  return fragment;
};

export const App = () => {
  store.dispatch({
    type: "set url",
    payload: getRouteFragment(window.location.href + "examples"),
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
        <SideBar routes$={selectState("routes")} />
      </div>
      <div class="layout">
        <AppRouter />
      </div>
    </div>
  );
};
