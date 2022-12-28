import RxFM from "rxfm";
import { RouteConfig, RouteMap } from "rxfm-router";
import { Timer } from "../components/timer";
import { Todos } from "../components/todos";
import { TodoItem } from "./app";
import { Examples } from "./examples";

export const appRoutes: RouteMap = {
  "": Timer,

  about: () => (
    <p>
      The <em>inline</em> about page...
    </p>
  ),

  examples: {
    view: Examples,
    children: {
      timer: Timer,
      todos: {
        view: Todos,
        children: {
          ":id": {
            view: ({ id }) => <p>id = {id}</p>,
          } as RouteConfig<{ id: TodoItem["id"] }>,
        },
      },
      inline: {
        view: () => <p>This is another inline component!</p>,
        children: {
          kids: () => <p>but with children</p>,
        },
      },
    },
  },
};
