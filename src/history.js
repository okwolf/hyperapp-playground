import { app, h } from "hyperapp";
import { HistoryPush, HistoryPop } from "hyperapp-fx";
import html from "./html";
const { main, h2, p, button } = html(h);

const GetLocationFromHash = () => window.location.hash.substring(1);
const routes = ["/home", "/login", "/profile"];
const defaultRoute = "/home";

app({
  init: GetLocationFromHash,
  view: route =>
    main(
      h2(route || defaultRoute),
      ...routes.map(name =>
        p(
          button(
            {
              onclick: () => [name, HistoryPush({ url: `#${name}` })]
            },
            name
          )
        )
      )
    ),
  subscriptions: () => [
    HistoryPop({
      action: GetLocationFromHash
    })
  ],
  node: document.getElementById("app")
});
