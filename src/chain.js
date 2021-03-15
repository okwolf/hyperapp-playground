import { app } from "hyperapp";
import { Dispatch, Delay } from "hyperapp-fx";
import html from "./html";
const { main, h2, button } = html;

// implements the proposed chaining API
const chainFxEffect = (originalDispatch, fx) => {
  let fxIndex = 0;
  const dispatchNextLink = dispatch => {
    if (fx.length > fxIndex) {
      const [nextDispatch, nextAction] = fx[fxIndex];
      fxIndex++;
      dispatch(state => [
        state,
        [
          nextDispatch[0],
          {
            ...nextDispatch[1],
            action: (nextState, data) => [
              nextState,
              Dispatch([nextAction, data]),
              [dispatchNextLink]
            ]
          }
        ]
      ]);
    }
  };
  dispatchNextLink(originalDispatch);
};
const ChainFX = ({ fx }) => [chainFxEffect, fx];

const NextMissleStep = ({ action } = {}) => Delay({ wait: 1000, action });

const LaunchStep = state => ({
  ...state,
  stage: 1,
  abortable: true,
  aborted: false,
  message: "preparing launchpad"
});

const PrimeMissilesStep = (state, time) =>
  state.aborted
    ? state
    : { ...state, time, stage: state.stage + 1, message: "priming missiles" };

const FireBoostersStep = (state, time) =>
  state.aborted
    ? state
    : { ...state, time, stage: state.stage + 1, message: "firing boosters" };

const ReleasePayloadStep = (state, time) =>
  state.aborted
    ? state
    : {
        ...state,
        time,
        stage: state.stage + 1,
        message: "releasing payload"
      };

const TargetDestroyedStep = (state, time) =>
  state.aborted
    ? state
    : {
        ...state,
        time,
        abortable: false,
        stage: state.stage + 1,
        message: "target destroyed"
      };

// here we use the proposed chaining API
const Launch = state => [
  state,
  Dispatch(LaunchStep),
  ChainFX({
    fx: [
      [NextMissleStep(), PrimeMissilesStep],
      [NextMissleStep(), FireBoostersStep],
      [NextMissleStep(), ReleasePayloadStep],
      [NextMissleStep(), TargetDestroyedStep]
    ]
  })
];

// here is the type of boilerplate the API skips
const LaunchWithoutChain = state => [
  state,
  Dispatch(LaunchStep),
  NextMissleStep({ action: PrimeMissiles })
];

const PrimeMissiles = (state, time) => [
  state,
  Dispatch([PrimeMissilesStep, time]),
  NextMissleStep({ action: FireBoosters })
];

const FireBoosters = (state, time) => [
  state,
  Dispatch([FireBoostersStep, time]),
  NextMissleStep({ action: ReleasePayload })
];

const ReleasePayload = (state, time) => [
  state,
  Dispatch([ReleasePayloadStep, time]),
  NextMissleStep({ action: TargetDestroyedStep })
];

const Abort = state => ({
  ...state,
  stage: 0,
  abortable: false,
  aborted: true,
  message: "aborted"
});

app({
  init: {
    time: 0,
    stage: 0,
    abortable: false,
    aborted: false,
    message: "ready"
  },
  view: ({ time, stage, abortable, message }) =>
    main(
      h2(`[${time.toFixed(0)}] stage ${stage}: ${message}`),
      (stage === 0 || !abortable) && button({ onclick: Launch }, "launch"),
      abortable && button({ onclick: Abort }, "abort")
    ),
  node: document.getElementById("app")
});
