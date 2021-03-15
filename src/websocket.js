import { app } from "hyperapp";
import { WebSocketSend, WebSocketListen } from "hyperapp-fx";
import html from "./html";
const { main, h1, button } = html;

const ORDER_URL = "wss://ws.bitstamp.net";

const OrderMessage = (state, message) => ({
  ...state,
  lastPrice: state.currentPrice,
  currentPrice: JSON.parse(message.data).data.price
});

const BtcOrderSubSend = WebSocketSend({
  url: ORDER_URL,
  data: JSON.stringify({
    event: "bts:subscribe",
    data: { channel: "live_orders_btcusd" }
  })
});

const BtcOrderSub = WebSocketListen({
  url: ORDER_URL,
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
      button({ onclick: TogglePaused }, paused ? "RESUME" : "PAUSE")
    ),
  subscriptions: ({ paused } = {}) => (paused ? [] : [BtcOrderSub]),
  node: document.getElementById("app")
});
