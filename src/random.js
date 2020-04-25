import { app, h } from "hyperapp";
import { Random } from "hyperapp-fx";
import html from "./html";
const { main, h1, button } = html(h);

const RollDie = state => [
  state,
  Random({
    min: 1,
    max: 6,
    int: true,
    action: (_, roll) => roll
  })
];

app({
  init: RollDie,
  view: dieValue =>
    main(
      h1(dieValue),
      button(
        {
          onclick: RollDie
        },
        "Roll"
      )
    ),
  subscriptions: console.log,
  node: document.getElementById("app")
});
