import RxFM, { DefaultProps, mapToComponents } from "rxfm";
import { BehaviorSubject, switchMap } from "rxjs";
import { TodoItem, store } from "../app/app";
import { Props, PropsRx, ensureObservable } from "../utils";
import { of } from "rambda";

export const Todo = ({ todo }: Props<{ todo: TodoItem }>) => (
  <div class="todo-item">
    <p>{todo.text}</p>
    <input type="checkbox" disabled checked={todo.isCompleted} />
  </div>
);

export const Todos = () => {
  const todos = store.selectState("todos");
  const editedItem = new BehaviorSubject("");
  return (
    <div>
      <p>You entered: "{editedItem}"</p>
      <input
        type="text"
        placeholder="Enter item"
        value={editedItem}
        onInput={(e) => editedItem.next(e.target.value)}
      />
      <button
        onClick={() => {
          store.dispatch({
            type: "add item",
            payload: editedItem.value,
          });

          editedItem.next("");
        }}
      >
        Add
      </button>
      <ul>
        {todos.pipe(
          mapToComponents((item) => (
            <li>{item.pipe(switchMap((todo) => <Todo todo={todo} />))}</li>
          ))
        )}
      </ul>
    </div>
  );
};
