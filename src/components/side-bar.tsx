import { evolve, pipe, toPairs } from "rambda";
import RxFM, { mapToComponents } from "rxfm";
import {
  BehaviorSubject,
  Observable,
  combineLatestWith,
  filter,
  map,
  of,
  switchMap,
} from "rxjs";
import { Link } from "./router/link";
import { RouteDetails, RouteMap } from "./router/router";
import { store } from "../app/app";

const RecursiveRouteList = ({
  routes,
  parentHref = "",
}: {
  routes: RouteMap;
  parentHref?: string;
}) => {
  const listItems = of(routes).pipe(
    map((rm) => toPairs(rm)),
    mapToComponents(
      (routeMapPairs: Observable<[string, RouteMap[keyof RouteMap]]>) => {
        // const displayName = typeof config === "object" ? config.name : name;
        const href$: Observable<string> = routeMapPairs.pipe(
          map(([segment]) => [parentHref, segment].filter(Boolean).join("/"))
        );
        const displayName$: Observable<string> = routeMapPairs.pipe(
          map(([href, config]) =>
            typeof config === "object" ? (config as RouteDetails).name : href
          )
        );
        const nestedLists$ = routeMapPairs.pipe(
          switchMap(([href, config]) =>
            config &&
            typeof config === "object" &&
            "children" in config &&
            config.children ? (
              <RecursiveRouteList routes={config.children} parentHref={href} />
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

export const SideBar = ({ routes$ }: { routes$: Observable<RouteMap> }) => {
  const showState$ = new BehaviorSubject(false);
  const stateJson$ = showState$.pipe(
    combineLatestWith(
      store.getState().pipe(
        map(
          pipe(
            evolve({ routes: Object.keys }),

            (o) => JSON.stringify(o, null, 2)
          )
        )
      )
    ),
    switchMap(([show, json]) => (show ? <pre>{json}</pre> : of(null)))
  );
  return (
    <div class="column">
      {routes$.pipe(
        switchMap((routes) => <RecursiveRouteList routes={routes} />)
      )}
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
