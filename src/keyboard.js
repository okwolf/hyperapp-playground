import { app, h } from "hyperapp";
import { Keyboard } from "hyperapp-fx";
import html from "./html";
const { main, h1 } = html(h);

const KeySub = Keyboard({
  downs: true,
  ups: true,
  action: (_, keyEvent) => keyEvent.keyCode
});

app({
  init: "Press any key...",
  view: keyCode => main(h1(keyCode)),
  subscriptions: () => [KeySub],
  container: document.body
});
