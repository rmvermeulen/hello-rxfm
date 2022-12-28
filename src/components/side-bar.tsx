import { defaultTo, evolve, isEmpty, path, toPairs } from "rambda";
import RxFM, { mapToComponents } from "rxfm";
import { Link, RouteMap, selectRouterState } from "rxfm-router";
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  combineLatestWith,
  filter,
  identity,
  map,
  of,
  switchMap,
} from "rxjs";
import { store } from "../app/app";

type RouteDisplayNameMap = {
  [key: string]: string | RouteDisplayNameMap;
};

const RecursiveRouteList = ({
  routes,
  parentHref = "",
  routeNames,
}: {
  routes: RouteMap;
  routeNames: RouteDisplayNameMap;
  parentHref?: string;
}) => {
  const listItems = of(routes).pipe(
    map((rm: RouteMap) => toPairs(rm)),
    mapToComponents(
      (routeMapPairs: Observable<[string, RouteMap[keyof RouteMap]]>) => {
        const href$: Observable<string> = routeMapPairs.pipe(
          map(([segment]) => [parentHref, segment].filter(Boolean).join("/"))
        );
        const displayName$: Observable<string> = href$.pipe(
          map((href): string => {
            if (href in routeNames) {
              const name = routeNames[href];
              if (typeof name === "string") {
                return name;
              }
            }
            const name = path(href.split("/").join("."), routeNames);
            return typeof name === "string" ? name : href;
          }),
          map(defaultTo("Home"))
        );
        const nestedLists$ = routeMapPairs.pipe(
          switchMap(([href, config]) =>
            config &&
            typeof config === "object" &&
            "children" in config &&
            config.children &&
            !isEmpty(config.children) ? (
              <RecursiveRouteList
                routes={config.children}
                parentHref={href}
                routeNames={routeNames}
              />
            ) : (
              of(null)
            )
          ),
          filter(Boolean)
        );
        return (
          <li>
            <Link href={href$}>{displayName$}</Link>
            {nestedLists$}
          </li>
        );
      }
    )
  );
  return <ul>{listItems}</ul>;
};

export const SideBar = ({
  routes$,
}: {
  routes$: Observable<[RouteMap, RouteDisplayNameMap]>;
}) => {
  const showState$ = new BehaviorSubject(false);
  const stateJson$ = combineLatest({
    app: store.getState(),
    router: selectRouterState(identity).pipe(
      map(evolve({ routes: Object.keys }))
    ),
  }).pipe(
    map(({ app, router }) => JSON.stringify({ app, router }, null, 2)),
    combineLatestWith(showState$),
    switchMap(([json, show]) => (show ? <pre>{json}</pre> : of(null)))
  );
  return (
    <div class="column">
      {routes$.pipe(
        switchMap(([routes, routeNames]) => (
          <RecursiveRouteList {...{ routes, routeNames }} />
        ))
      )}
      <Link href={of("/examples/todos/123")}>Todo #123</Link>
      <Link href={of("/examples/todos/127")}>Todo #127</Link>
      <button
        onClick={() => {
          localStorage.removeItem("state");
          console.log("cached state cleared");
        }}
      >
        clear persisted state
      </button>
      {showState$.pipe(
        switchMap((show) => (
          <button onClick={() => showState$.next(!show)}>
            {show ? "hide" : "show"} state
          </button>
        ))
      )}
      {stateJson$}
    </div>
  );
};
