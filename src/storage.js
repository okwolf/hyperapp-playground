import { app, h } from "hyperapp";
import {
  ReadFromStorage,
  WriteToStorage,
  RemoveFromStorage
} from "hyperapp-fx";
import html from "./html";
const { main, input, button } = html(h);

const storageKey = "storageKey";

app({
  init: [
    "",
    ReadFromStorage({ key: storageKey, action: (_, { value }) => value })
  ],
  view: storageValue =>
    main(
      input({
        value: storageValue,
        oninput: (_, { target: { value } }) => [
          value,
          WriteToStorage({ key: storageKey, value })
        ]
      }),
      button(
        { onclick: () => ["", RemoveFromStorage({ key: storageKey })] },
        "Remove"
      )
    ),
  node: document.getElementById("app")
});
