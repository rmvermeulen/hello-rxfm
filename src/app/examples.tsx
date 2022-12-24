import RxFM from "rxfm";
import { ClickCounter } from "../components/click-counter";
import { Todos } from "../components/todos";
import { Timer } from "../components/timer";
import { store } from "./app";
import { selectRouterState } from "rxfm-router";

export const Examples = () => {
  const url$ = selectRouterState((x) => x.url.href);
  return (
    <div class="layout">
      <h1>Welcome to RxFM!</h1>
      <pre>url: {url$}</pre>
      <Todos />
      <Timer />
      <ClickCounter />
    </div>
  );
};
