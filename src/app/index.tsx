import RxFM, { mapToComponents } from "rxfm";
import {
  BehaviorSubject,
  distinctUntilChanged,
  map,
  switchMap,
  timer,
} from "rxjs";

import "./styles.css";
import { append, assoc, evolve } from "rambda";

const state = new BehaviorSubject({
  url: "",
  items: ["some item!"],
});
export type State = typeof state.value;

const mapState = (fn: (state: State) => State) => state.next(fn(state.value));
const selectState = <R,>(selector: (state: State) => R) =>
  state.pipe(map(selector), distinctUntilChanged());

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
      <pre>{state.pipe(map((x) => JSON.stringify(x)))}</pre>
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
  mapState(assoc("url", getFragment(window.location.href + "foobar")));

  return (
    <div id="app">
      <Examples />
    </div>
  );
};

App().subscribe((element) => document.body.appendChild(element));
