import RxFM, { mapToComponents } from "rxfm";
import { map, switchMap } from "rxjs";

import { evolve, pipe } from "rambda";
import "./styles.css";
import { AppRouter } from "../components/router/router";
import { Timer } from "../components/timer";
import { selectState, state, setState } from "../store/app-state";
import { ClickCounter } from "../components/click-counter";
import { ItemManager } from "../components/item-manager";
import { SideBar } from "../components/router/side-bar";

const Examples = () => {
  const items$ = selectState((x) => x.items);
  const url$ = selectState((x) => x.url);
  return (
    <div class="layout">
      <h1>Welcome to RxFM!</h1>
      <pre>url: {url$}</pre>
      <pre>
        {state.pipe(map(pipe(evolve({ routes: Object.keys }), JSON.stringify)))}
      </pre>
      <ul>{items$.pipe(mapToComponents((item) => <li>{item}</li>))}</ul>
      <ItemManager />
      <div>Start adding components and observables here!</div>
      <Timer />
      <ClickCounter />
    </div>
  );
};

const getFragment = (url: string): string => {
  const match = url.match(/^https?:\/\/localhost:\d+\/(.*)/);
  if (!match) return "";
  const [, fragment] = match;
  return fragment;
};

const App = () => {
  setState({
    url: getFragment(window.location.href + "examples"),
    routes: {
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
      {selectState("routes").pipe(
        switchMap((routes) => <SideBar routes={routes} />)
      )}
      <AppRouter />
    </div>
  );
};

App().subscribe((element) => document.body.appendChild(element));
