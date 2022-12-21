import RxFM from "rxfm";
import { BehaviorSubject } from "rxjs";

export const ClickCounter = () => {
  const clicks = new BehaviorSubject(0);

  return (
    <button
      onClick={() => clicks.next(clicks.value + 1)}
      style={{ marginTop: "10px" }}
    >
      Clicks: {clicks}
    </button>
  );
};
