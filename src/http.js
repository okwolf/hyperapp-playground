import { app, h } from "hyperapp";
import { Http } from "hyperapp-fx";
import html from "./html";
const { main, input, button, div, h2 } = html(h);

const SuccessResponse = (state, response) => ({
  ...state,
  response,
  error: null,
  fetching: false
});

const ErrorResponse = (state, error) => ({
  ...state,
  response: null,
  error,
  fetching: false
});

const SendHttp = state => [
  { ...state, response: "...", error: null, fetching: true },
  Http({
    url: state.url,
    response: "text",
    action: SuccessResponse,
    error: ErrorResponse
  })
];

const UpdateUrl = (state, { target: { value } }) => ({ ...state, url: value });

app({
  init: {
    response: null,
    error: null,
    url: "https://httpstat.us/200",
    fetching: false
  },
  view: ({ response, error, url, fetching }) =>
    main(
      div(
        { class: "container" },
        input({
          autofocus: true,
          value: url,
          disabled: fetching,
          onInput: UpdateUrl
        }),
        button(
          {
            onClick: SendHttp
          },
          "Send"
        )
      ),
      div({ class: "container" }, h2(`Response: ${response}`)),
      div(
        { class: "container" },
        h2(`Error: ${error && (error.statusText || error.message)}`)
      )
    ),
  subscribe: console.log,
  container: document.body
});
