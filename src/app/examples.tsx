import RxFM from "rxfm";
import { ClickCounter } from "../components/click-counter";
import { ItemManager } from "../components/item-manager";
import { Timer } from "../components/timer";
import { store } from "./app";

export const Examples = () => {
  const url$ = store.selectState((x) => x.url);
  return (
    <div class="layout">
      <h1>Welcome to RxFM!</h1>
      <pre>url: {url$}</pre>
      <ItemManager />
      <Timer />
      <ClickCounter />
    </div>
  );
};
