import RxFM, { ElementChild, mapToComponents } from "rxfm";
import {
  BehaviorSubject,
  combineLatest,
  defer,
  distinctUntilChanged,
  map,
  switchMap,
  timer,
} from "rxjs";

import { append, defaultTo, evolve, pipe, prop } from "rambda";
import "./styles.css";

const MyHome = ({} = {}) => <p>abc</p>;

type RouteMap = { [key: string]: ElementChild | RouteMap };
const state = new BehaviorSubject({
  url: "",
  routes: {} as RouteMap,
  items: ["some item!"],
});
export type State = typeof state.value;

const mapState = (fn: (state: State) => State) => state.next(fn(state.value));
const setState = (patch: Partial<State>) =>
  state.next({ ...state.value, ...patch });
const selectState = <K extends keyof State, R = State[K]>(
  selector: ((state: State) => R) | K
) =>
  state.pipe(
    map(typeof selector === "string" ? prop(selector) : selector),
    distinctUntilChanged()
  );

const AppRouter = () => {
  const url = selectState("url");
  return (
    <div>
      <input value={url} onChange={(e) => setState({ url: e.target.value })} />
      {combineLatest([url, selectState("routes")]).pipe(
        switchMap(([url, routes]) =>
          defer(() => {
            const match = (routes as any)[url];
            return match ? (
              <div>
                <p>Matched route!</p>
                {match}
              </div>
            ) : (
              <pre>404 - [{url}] not found</pre>
            );
          })
        )
      )}
    </div>
  );
};

const ItemManager = () => {
  const editedItem = new BehaviorSubject("");
  return (
    <div>
      <p>You entered: "{editedItem}"</p>
      <input
        type="text"
        placeholder="Enter item"
        value={editedItem}
        onInput={(e) => editedItem.next(e.target.value)}
      />
      <button
        onClick={() => {
          mapState(
            evolve({
              items: append(editedItem.value) as (s: string[]) => string[],
            })
          );
          editedItem.next("");
        }}
      >
        Add
      </button>
    </div>
  );
};

const Timer = () => (
  <div>
    You've been looking at this page for:
    <span style={{ fontWeight: "bold" }}> {timer(0, 1000)}s </span>
    so far!
  </div>
);

const ClickCounter = () => {
  const clicks = new BehaviorSubject(0);

  return (
    <button
      onClick={() => clicks.next(clicks.value + 1)}
      style={{ marginTop: "10px" }}
    >
      Clicks: {clicks}
    </button>
  );
};

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

const SideBar = () => {
  return (
    <div class="column">
      {selectState("routes").pipe(
        map(Object.keys),
        mapToComponents((name) => {
          return (
            <li>
              <a
                href={name}
                onClick={name.pipe(
                  map((url) => (e) => {
                    e.preventDefault();
                    setState({ url });
                  })
                )}
              >
                {name.pipe(map((x) => x || "home"))}
              </a>
            </li>
          );
        })
      )}
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
      "": MyHome,
      about: () => <p>The about page...</p>,
      examples: Examples,
    },
  });

  return (
    <div id="app">
      <SideBar />
      <AppRouter />
    </div>
  );
};

App().subscribe((element) => document.body.appendChild(element));
