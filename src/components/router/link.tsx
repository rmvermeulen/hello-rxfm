import RxFM, { DefaultProps } from "rxfm";
import { Observable, map } from "rxjs";
import { setState } from "../../store/app-state";

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
          setState({ url });
        })
      )}
    >
      {children}
    </a>
  );
};
