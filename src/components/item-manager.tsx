import RxFM, { mapToComponents } from "rxfm";
import { BehaviorSubject } from "rxjs";
import { store } from "../app/app";

export const ItemManager = () => {
  const items$ = store.selectState("items");
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
      <ul>{items$.pipe(mapToComponents((item) => <li>{item}</li>))}</ul>
    </div>
  );
};
