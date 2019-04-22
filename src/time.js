import { app, h } from "hyperapp";
import { Now, Interval } from "hyperapp-fx";
import html from "./html";
const { main, h1 } = html(h);

const UpdateDate = (_, date) =>
  date.toLocaleString("uk", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric"
  });

const InitialTime = Now({
  asDate: true,
  action: UpdateDate
});

const TimeSub = Interval({
  every: 100,
  asDate: true,
  action: UpdateDate
});

app({
  init: ["", InitialTime],
  view: time => main(h1(time)),
  container: document.body,
  subscriptions: () => [TimeSub]
});
