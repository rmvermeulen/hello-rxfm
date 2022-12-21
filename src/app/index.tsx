import { App } from "./app";
import "./styles.css";

App().subscribe((element) => document.body.appendChild(element));
