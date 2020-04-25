import { app, h } from "hyperapp";
import { Debounce, Throttle } from "hyperapp-fx";
import html from "./html";
const { main, div, h3, input, button } = html(h);

const initialState = {
  debounceWait: 1000,
  debounceCount: 0,
  throttleRate: 1000,
  throttleCount: 0
};

const DebounceInc = state => ({
  ...state,
  debounceCount: state.debounceCount + 1
});

const DebouncedClick = state => [
  state,
  Debounce({
    wait: state.debounceWait,
    action: DebounceInc
  })
];
const ThrottleInc = state => ({
  ...state,
  throttleCount: state.throttleCount + 1
});

const ThrottledClick = state => [
  state,
  Throttle({
    rate: state.throttleRate,
    action: ThrottleInc
  })
];

const SetValueFor = key => (state, { target: { value } }) => ({
  ...state,
  [key]: value
});

const view = ({ debounceWait, debounceCount, throttleRate, throttleCount }) =>
  main(
    h3("Debounce"),
    div(
      { class: "control-bar" },
      input({
        type: "range",
        min: 100,
        max: 2000,
        value: debounceWait,
        oninput: SetValueFor("debounceWait")
      }),
      debounceWait,
      "ms"
    ),
    button({ onClick: DebouncedClick }, debounceCount),
    h3("Throttle"),
    div(
      { class: "control-bar" },
      input({
        type: "range",
        min: 100,
        max: 2000,
        value: throttleRate,
        oninput: SetValueFor("throttleRate")
      }),
      throttleRate,
      "ms"
    ),
    button({ onClick: ThrottledClick }, throttleCount)
  );

app({
  init: initialState,
  view,
  node: document.getElementById("app")
});
