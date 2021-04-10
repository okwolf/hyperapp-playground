import { app } from "hyperapp";
import {
  Dispatch,
  Http,
  HistoryPush,
  HistoryPop,
  ReadFromStorage,
  WriteToStorage,
  RemoveFromStorage
} from "hyperapp-fx";
import html from "./html";
const { main, span, p, button } = html;

const loginTokenKey = "loginToken";

const GetLocationFromHash = state => ({
  ...state,
  route: window.location.hash.substring(1)
});

const Login = state => [
  { ...state, loggingIn: true },
  Http({
    url: "https://www.random.org/cgi-bin/randbyte?nbytes=24&format=h",
    response: "text",
    action: (state, response) => {
      const token = response.replace(/\s/g, "");
      return [
        {
          ...state,
          loggingIn: false,
          token
        },
        WriteToStorage({ key: loginTokenKey, value: token })
      ];
    }
  })
];

const Navigate = (state, route) => [
  { ...state, route },
  HistoryPush({ url: `#${route}` })
];

const Logout = state => [
  { ...state, token: "", route: "/" },
  HistoryPush({ url: "#/" }),
  RemoveFromStorage({ key: loginTokenKey })
];

app({
  init: [
    { route: "/", loggingIn: false, token: "" },
    Dispatch(GetLocationFromHash),
    ReadFromStorage({
      key: loginTokenKey,
      action: (state, { value }) => ({ ...state, token: value })
    })
  ],
  view: ({ route, loggingIn, token }) =>
    main(
      p(`route: ${route}`),
      token
        ? span(
            `token: ${token}`,
            ["home", "profile"].map(name =>
              p(button({ onclick: [Navigate, `/${name}`] }, name))
            ),
            button({ onclick: Logout }, "logout")
          )
        : loggingIn
        ? span("logging in...")
        : button({ onclick: Login }, "login")
    ),
  subscriptions: () => [
    HistoryPop({
      action: GetLocationFromHash
    })
  ],
  node: document.getElementById("app")
});
