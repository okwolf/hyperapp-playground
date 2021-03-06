import { app } from "hyperapp";
import { Animation, Random, Merge } from "hyperapp-fx";
import html from "./html";
const { main, div, input, svg, path, circle, line } = html;

const initialState = {
  theme: {
    color: "white",
    width: 2,
    trailColor: "grey",
    trailWidth: 0.5
  },
  time: 0,
  delta: 0,
  deltaS: 0,
  g: 0.98,
  friction: 0,
  timeScale: 20,

  l1: 150,
  m1: 15,
  x1: 0,
  y1: 0,
  a1: (3 * Math.PI) / 4,
  av1: 0,
  aa1: 0,

  l2: 125,
  m2: 10,
  x2: 0,
  y2: 0,
  a2: Math.PI / 3,
  av2: 0,
  aa2: 0,

  trailPath: ""
};

const updateTime = time => ({ time: lastTime, delta: lastDelta }) => ({
  time,
  delta: time && lastTime ? time - lastTime : lastDelta
});

const updateDelta = ({ delta, timeScale }) => ({
  deltaS: Math.min(delta, timeScale) / timeScale
});

const updateVelocities = ({ deltaS, av1, aa1, av2, aa2, friction }) => ({
  av1: (av1 + aa1 * deltaS) * (1 - friction),
  av2: (av2 + aa2 * deltaS) * (1 - friction)
});

const updateAccelerations = ({ g, l1, l2, m1, m2, a1, a2, av1, av2 }) => ({
  aa1:
    (-g * (2 * m1 + m2) * Math.sin(a1) -
      m2 * g * Math.sin(a1 - 2 * a2) -
      2 *
        Math.sin(a1 - a2) *
        m2 *
        (av2 * av2 * l2 + av1 * av1 * l1 * Math.cos(a1 - a2))) /
    (l1 * (2 * m1 + m2 - m2 * Math.cos(2 * a1 - 2 * a2))),
  aa2:
    (2 *
      Math.sin(a1 - a2) *
      (av1 * av1 * l1 * (m1 + m2) +
        g * (m1 + m2) * Math.cos(a1) +
        av2 * av2 * l2 * m2 * Math.cos(a1 - a2))) /
    (l2 * (2 * m1 + m2 - m2 * Math.cos(2 * a1 - 2 * a2)))
});

const updateAngles = ({ deltaS, a1, av1, a2, av2 }) => ({
  a1: a1 + av1 * deltaS,
  a2: a2 + av2 * deltaS
});

const updateRod1 = ({ l1, a1 }) => ({
  x1: l1 * Math.sin(a1),
  y1: l1 * Math.cos(a1)
});

const updateRod2 = ({ l2, a2, x1, y1 }) => ({
  x2: x1 + l2 * Math.sin(a2),
  y2: y1 + l2 * Math.cos(a2)
});

const updateTrail = ({ trailPath, x2, y2 }) => ({
  trailPath: trailPath ? `${trailPath} L ${x2} ${y2}` : `M${x2} ${y2}`
});

const UpdateAnimation = (state, time) => [
  state,
  Merge(updateTime(time)),
  Merge(updateDelta),
  Merge(updateVelocities),
  Merge(updateAccelerations),
  Merge(updateAngles),
  Merge(updateRod1),
  Merge(updateRod2),
  Merge(updateTrail)
];

const AnimationSub = Animation(UpdateAnimation);

const randomAngleProps = {
  min: Math.PI / 2,
  max: (3 * Math.PI) / 2
};

const RandomizeInitialState = Random({
  values: [{ min: 40, max: 80 }, randomAngleProps, randomAngleProps],
  action: (state, [timeScale, a1, a2]) => ({
    ...state,
    timeScale,
    a1,
    a2
  })
});

const SetValueFor = key => (state, { target: { value } }) => ({
  ...state,
  [key]: value
});

const view = ({
  theme: { color, width, trailColor, trailWidth },
  x1,
  y1,
  m1,
  l1,
  x2,
  y2,
  m2,
  l2,
  trailPath,
  g,
  timeScale,
  friction
}) =>
  main(
    div(
      { class: "top" },
      input({
        type: "range",
        min: 0.5,
        max: 1,
        step: 0.001,
        value: g,
        oninput: SetValueFor("g")
      }),
      input({
        type: "range",
        min: 1,
        max: 200,
        value: timeScale,
        oninput: SetValueFor("timeScale")
      }),
      input({
        type: "range",
        min: 50,
        max: 200,
        value: l1,
        oninput: SetValueFor("l1")
      }),
      input({
        type: "range",
        min: 50,
        max: 200,
        value: l2,
        oninput: SetValueFor("l2")
      }),
      input({
        type: "range",
        min: 0,
        max: 0.01,
        step: 0.0001,
        value: friction,
        oninput: SetValueFor("friction")
      })
    ),
    svg(
      {
        viewBox: "0 0 400 300",
        style: {
          strokeWidth: width
        },
        stroke: color
      },
      path({
        d: trailPath,
        style: {
          strokeWidth: trailWidth
        },
        fill: "transparent",
        stroke: trailColor
      }),
      circle({ cx: 0, cy: 0, r: width, fill: color }),
      line({ x1: 0, y1: 0, x2: x1, y2: y1 }),
      circle({ cx: x1, cy: y1, r: m1, fill: color }),
      line({ x1, y1, x2, y2 }),
      circle({ cx: x2, cy: y2, r: m2, fill: color })
    )
  );

app({
  init: [initialState, RandomizeInitialState],
  view,
  subscriptions: () => [AnimationSub],
  node: document.getElementById("app")
});
