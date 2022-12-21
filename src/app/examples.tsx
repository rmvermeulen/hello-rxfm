import RxFM, { mapToComponents } from "rxfm";
import { ClickCounter } from "../components/click-counter";
import { ItemManager } from "../components/item-manager";
import { Timer } from "../components/timer";
import { selectState } from "../store/state";

export const Examples = () => {
  const items$ = selectState((x) => x.items);
  const url$ = selectState((x) => x.url);
  return (
    <div class="layout">
      <h1>Welcome to RxFM!</h1>
      <pre>url: {url$}</pre>
      <ul>{items$.pipe(mapToComponents((item) => <li>{item}</li>))}</ul>
      <ItemManager />
      <div>Start adding components and observables here!</div>
      <Timer />
      <ClickCounter />
    </div>
  );
};
