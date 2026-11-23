import template from "./questions.html?raw";
import { html } from "../../../lib/render.js";
import { totalPoints } from "../../../lib/game.js";
import { H, Q } from "../state.js";

export default () => {
  const n = Q().length;
  const loaded = n && H.solutions?.length === n && `${n} domande · ${totalPoints(Q())} punti`;
  return html(template, { loaded, open: H.openKeys.has("questions") });
};
