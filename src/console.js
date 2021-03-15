import { app } from "hyperapp";
import { Console } from "hyperapp-fx";
import html from "./html";
const { main, button } = html;

app({
  init: {},
  view: () =>
    main(
      button(
        {
          onclick: state => [
            state,
            Console(
              "Console logs support %ccustom styles",
              "color: blue; font-weight: bold;",
              { objects: "work too" }
            )
          ]
        },
        "Do the log thing!"
      )
    ),
  node: document.getElementById("app")
});
