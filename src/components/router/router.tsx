import { RamdaPath, intersperse, path } from "rambda";
import RxFM, { ElementChild } from "rxfm";
import { combineLatest, defer, switchMap } from "rxjs";
import { store } from "../../app/app";

export type RouteDetails = {
  name: string;
  component: ElementChild;
  children?: RouteMap;
};
export type RouteMap = { [href: string]: ElementChild | RouteDetails };

export const AppRouter = () => {
  const url = store.selectState("url");
  return (
    <div>
      <input
        value={url}
        onChange={(e) =>
          store.dispatch({ type: "set url", payload: e.target.value })
        }
      />
      {
        combineLatest([url, store.selectState("routes")]).pipe(
          switchMap(([url, routes]) =>
            defer(() => {
              const getMatch = path<ElementChild | RouteDetails>(
                intersperse("children", url.split("/")) as RamdaPath
              );
              let match = getMatch(routes);
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
