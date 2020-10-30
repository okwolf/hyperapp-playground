import { app, h } from "hyperapp";
import { Animation, Merge, Dispatch, Random, Keyboard } from "hyperapp-fx";
import html from "./html";
const { main, img, h1, h2, p, button, div } = html(h);
const [gear, score, highscore, instructions] = [
  "gear",
  "score",
  "highscore",
  "instructions"
].map(className => div.bind(null, { className }));

const ROAD_WIDTH = 360;
const BIKE_WIDTH = 16;
const BIKE_HEIGHT = 48;
const BIKE_PADDING = 2;
const MAX_ANIMATION_DURATION = 4;

const initialState = {
  started: false,
  paused: false,
  time: 0,
  boost: 1,
  points: 0,
  recordScore: 0,
  delta: 0,
  lastAddedBikeAt: 0,
  roadWidth: ROAD_WIDTH,
  moveRight: 0,
  moveLeft: 0,
  bikes: [],
  player: {
    x: ROAD_WIDTH / 2 - BIKE_WIDTH / 2,
    y: window.innerHeight * 0.7
  }
};

const UpdateTime = time => ({
  time: lastTime,
  delta: lastDelta,
  points,
  boost
}) => ({
  time,
  delta: time && lastTime ? time - lastTime : lastDelta,
  points: points + boost
});

const AddBike = state =>
  Random({
    values: [
      { int: true, max: state.roadWidth - BIKE_WIDTH },
      { int: true, min: 1, max: 3 },
      { int: true, max: 2 }
    ],
    action: (state, [x, speed, bikeIndex]) => ({
      ...state,
      bikes: [
        ...state.bikes,
        {
          x,
          y: -100,
          speed,
          image: `images/bike${bikeIndex}.png`
        }
      ]
    })
  });

const AddBikeIfTime = state =>
  state.time - state.lastAddedBikeAt > 500 / state.boost
    ? [{ ...state, lastAddedBikeAt: state.time }, AddBike(state)]
    : state;

const MoveBikes = state => ({
  bikes: state.bikes
    .map(bike => ({
      ...bike,
      y: bike.y + bike.speed * state.boost * 0.6
    }))
    .filter(bike => bike.y < window.innerHeight)
});

const MovePlayer = state => {
  const { moveLeft, moveRight, player, boost, roadWidth, bikes } = state;
  return {
    ...state,
    player: {
      ...state.player,
      x: Math.min(
        Math.max(
          0,
          player.x +
            Math.min(moveRight * (boost + 1), 4) +
            Math.max(-1 * moveLeft * (boost + 1), -4)
        ),
        roadWidth - BIKE_WIDTH
      )
    }
  };
};

const UpdateAnimation = (state, time) => {
  const { bikes, player, started, points, recordScore } = state;
  const collision =
    bikes.filter(
      bike =>
        player.x < bike.x + BIKE_WIDTH - BIKE_PADDING &&
        player.x + BIKE_WIDTH - BIKE_PADDING > bike.x &&
        player.y < bike.y + BIKE_HEIGHT - BIKE_PADDING &&
        BIKE_HEIGHT - BIKE_PADDING + player.y > bike.y
    ).length > 0;
  return [
    !started
      ? initialState
      : collision
      ? {
          ...initialState,
          started: true,
          recordScore: points > recordScore ? points : recordScore
        }
      : state,
    Merge(UpdateTime(time)),
    Dispatch(AddBikeIfTime),
    Merge(MovePlayer),
    Merge(MoveBikes)
  ];
};

const UpdateOnKeyPress = (state, e) => ({
  ...state,
  moveLeft: e.keyCode === 37 ? (e.type === "keydown" ? 1 : 0) : state.moveLeft,
  moveRight:
    e.keyCode === 39 ? (e.type === "keydown" ? 1 : 0) : state.moveRight,
  boost:
    e.type === "keyup" && e.keyCode === 38
      ? Math.min(6, state.boost + 1)
      : e.type === "keyup" && e.keyCode === 40
      ? Math.max(1, state.boost - 1)
      : state.boost,
  paused:
    e.type === "keydown" && e.keyCode === 32 ? !state.paused : state.paused
});

const AnimationSub = Animation(UpdateAnimation);

const KeySub = Keyboard({
  downs: true,
  ups: true,
  action: UpdateOnKeyPress
});

const view = ({
  roadWidth,
  player: { x: playerX, y: playerY },
  bikes,
  boost,
  points,
  started,
  paused,
  recordScore
}) =>
  main(
    div(
      {
        className: "road",
        style: {
          width: `${roadWidth}px`,
          animationDuration: `${paused ? 0 : MAX_ANIMATION_DURATION / boost}s`
        }
      },
      ...bikes.map(({ x, y, image }) =>
        div(
          {
            className: "bike",
            style: { transform: `translate(${x}px, ${y}px)` }
          },
          img({ src: image })
        )
      ),
      div(
        {
          className: "player",
          style: {
            transform: `translate(${playerX}px, ${playerY}px)`
          }
        },
        img({ src: "images/player.png" })
      )
    ),
    gear(boost),
    score(points),
    recordScore > 0 && highscore(`${recordScore} Highscore`),
    !started &&
      instructions(
        h1("Saigon"),
        h2("Racer"),
        p(`
        The roads here in old Saigon are known to be hard to navigate..
        Use the left and right arrow keys to dodge traffic and get as far down the road as possible.
        Use the up and down arrows to change gear.
        The faster you go the bigger your score!
      `),
        button(
          {
            onclick: state => ({ ...state, started: true })
          },
          "START RIDING"
        )
      )
  );

app({
  init: initialState,
  view,
  subscriptions: ({ paused }) => [!paused && AnimationSub, KeySub],
  node: document.getElementById("app")
});
