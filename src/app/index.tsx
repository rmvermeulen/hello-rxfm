import RxFM, { DefaultProps, ElementChild, mapToComponents } from "rxfm";
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  defer,
  distinctUntilChanged,
  filter,
  map,
  of,
  switchMap,
  timer,
} from "rxjs";

import {
  RamdaPath,
  append,
  evolve,
  intersperse,
  mapObjIndexed,
  path,
  pipe,
  prop,
  toPairs,
} from "rambda";
import "./styles.css";

type RouteDetails = {
  name: string;
  component: ElementChild;
  children?: RouteMap;
};
type RouteMap = { [href: string]: ElementChild | RouteDetails };

type SubjectType<T> = T extends BehaviorSubject<infer X> ? X : never;
const state = new BehaviorSubject({
  url: "",
  routes: {} as RouteMap,
  items: ["some item!"],
});

export type State = SubjectType<typeof state>;
type Action<T = any> = { type: string; payload: T };
type Reducer<K extends keyof State> = (
  state: State[K],
  action: Action
) => State[K];

type ReducerMap = { [K in keyof State]: Reducer<K> };

const store = {
  state,
  reducers: {
    url(url, action) {
      if (action.type === "set route") {
        return action.payload;
      }
      return url;
    },
  } as ReducerMap,
  dispatch(action: Action): void {
    mapObjIndexed((value, key) =>
      key in this.reducers
        ? this.reducers[key as keyof State](value as any, action)
        : value
    );
  },
};

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
      {
        combineLatest([url, selectState("routes")]).pipe(
          switchMap(([url, routes]) =>
            defer(() => {
              const getMatch = path<ElementChild | RouteDetails>(
                intersperse("children", url.split("/")) as RamdaPath
              );
              let match = getMatch(routes);
              console.log(
                "RamdaPath:",
                intersperse("children", url.split("/")),
                { match },
                routes
              );
              // return typeof match == 'function')?
              if (typeof match === "object") {
                match = (match as RouteDetails).component;
              }
              return <div>{match || <pre>404 - [{url}] not found</pre>}</div>;
            })
          )
        ) as ElementChild
      }
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

const Link = ({
  href,
  children,
}: { href: Observable<string> } & DefaultProps) => {
  return (
    <a
      href={href}
      onClick={href.pipe(
        map((url) => (e) => {
          e.preventDefault();
          setState({ url });
        })
      )}
    >
      {children}
    </a>
  );
};

const SideBar = ({
  routes,
  parentHref = "",
}: {
  routes: RouteMap;
  parentHref?: string;
}) => {
  return (
    <ul class="column">
      {of(routes).pipe(
        map((rm) => toPairs(rm)),
        mapToComponents(
          (args: Observable<[string, RouteMap[keyof RouteMap]]>) => {
            // const displayName = typeof config === "object" ? config.name : name;
            const href: Observable<string> = args.pipe(map(([x]) => x));
            const displayName: Observable<string> = args.pipe(
              map(([href, config]) =>
                typeof config === "object"
                  ? (config as RouteDetails).name
                  : href
              )
            );
            const children = args.pipe(
              switchMap(([href, config]) =>
                config &&
                typeof config === "object" &&
                "children" in config &&
                config.children ? (
                  <SideBar routes={config.children} parentHref={href} />
                ) : (
                  of(null)
                )
              ),
              filter(Boolean)
            );
            return (
              <li>
                <Link
                  href={href.pipe(
                    map((segment) =>
                      [parentHref, segment].filter(Boolean).join("/")
                    )
                  )}
                >
                  {displayName}
                </Link>
                {children}
              </li>
            );
          }
        )
      )}
    </ul>
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
