import RxFM, { DefaultProps } from "rxfm";
import { Observable, map } from "rxjs";
import { store } from "../../app/app";

export const Link = ({
  href,
  children,
}: { href: Observable<string> } & DefaultProps) => {
  return (
    <a
      href={href}
      onClick={href.pipe(
        map((url) => (e) => {
          e.preventDefault();
          store.dispatch({
            type: "set url",
            payload: url,
          });
        })
      )}
    >
      {children}
    </a>
  );
};
