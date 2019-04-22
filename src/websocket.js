import { app, h } from "hyperapp";
import { WebSocketSend, WebSocketListen } from "hyperapp-fx";
import html from "./html";
const { main, h1, button } = html(h);

const ORDER_URL = "wss://ws.pusherapp.com/app/de504dc5763aeef9ff52";

const OrderMessage = (state, message) => {
  const data = JSON.parse(message.data);
  return data.event === "order_created"
    ? {
        ...state,
        lastPrice: state.currentPrice,
        currentPrice: JSON.parse(data.data).price
      }
    : state;
};

const BtcOrderSubSend = WebSocketSend({
  url: "wss://ws.pusherapp.com/app/de504dc5763aeef9ff52",
  data: JSON.stringify({
    event: "pusher:subscribe",
    data: { channel: "live_orders" }
  })
});

const BtcOrderSub = WebSocketListen({
  url: "wss://ws.pusherapp.com/app/de504dc5763aeef9ff52",
  action: OrderMessage
});

const TogglePaused = state =>
  state.paused
    ? [{ ...state, paused: false }, BtcOrderSubSend]
    : { ...state, paused: true };

app({
  init: [
    {
      paused: false,
      lastPrice: null,
      currentPrice: null
    },
    BtcOrderSubSend
  ],
  view: ({ lastPrice, currentPrice, paused } = {}) =>
    main(
      h1(
        {
          class: currentPrice < lastPrice ? "decreased" : "increased"
        },
        currentPrice ? `$${currentPrice.toFixed(2)}` : "Loading..."
      ),
      button({ onClick: TogglePaused }, paused ? "RESUME" : "PAUSE")
    ),
  subscriptions: ({ paused } = {}) => (paused ? [] : [BtcOrderSub]),
  container: document.body
});
