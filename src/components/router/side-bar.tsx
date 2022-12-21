import { toPairs } from "rambda";
import RxFM, { mapToComponents } from "rxfm";
import { of, map, Observable, switchMap, filter } from "rxjs";
import { RouteMap, RouteDetails } from "./router";
import { Link } from "./link";

export const SideBar = ({
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
