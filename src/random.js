import { app, h } from "hyperapp";
import { Random } from "hyperapp-fx";
import html from "./html";
const { main, h1, button } = html(h);

const RollDie = state => [
  state,
  Random({
    min: 1,
    max: 7,
    action: (_, randomIndex) => Math.floor(randomIndex)
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
  subscribe: console.log,
  container: document.body
});
