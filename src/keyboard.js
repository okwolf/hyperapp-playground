import { app } from "hyperapp";
import { Keyboard } from "hyperapp-fx";
import html from "./html";
const { main, h2 } = html;

const KeySub = Keyboard({
  downs: true,
  ups: true,
  action: (_, keyEvent) => keyEvent.keyCode
});

app({
  init: "Press any key...",
  view: keyCode => main(h2(keyCode)),
  subscriptions: () => [KeySub],
  node: document.getElementById("app")
});
