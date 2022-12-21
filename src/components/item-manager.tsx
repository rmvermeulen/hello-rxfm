import { append, evolve } from "rambda";
import RxFM from "rxfm";
import { BehaviorSubject } from "rxjs";
import { mapState } from "../store/state";

export const ItemManager = () => {
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
          mapState(
            evolve({
              items: append(editedItem.value) as (s: string[]) => string[],
            })
          );
          editedItem.next("");
        }}
      >
        Add
      </button>
    </div>
  );
};
