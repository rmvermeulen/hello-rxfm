import RxFM from "rxfm";
import { timer } from "rxjs";

export const Timer = () => (
  <div>
    You've been looking at this page for:
    <span style={{ fontWeight: "bold" }}> {timer(0, 1000)}s </span>
    so far!
  </div>
);
