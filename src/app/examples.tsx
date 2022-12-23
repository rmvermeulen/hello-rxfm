import RxFM from "rxfm";
import { ClickCounter } from "../components/click-counter";
import { ItemManager } from "../components/item-manager";
import { Timer } from "../components/timer";
import { store } from "./app";
import { selectRouterState } from "rxfm-router";

export const Examples = () => {
  const url$ = selectRouterState((x) => x.fullUrl);
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
