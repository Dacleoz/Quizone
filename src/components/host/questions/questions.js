import template from "./questions.html?raw";
import { html } from "../../../lib/render.js";
import { totalPoints } from "../../../lib/game.js";
import { H } from "../state.js";

export default () => {
  const qs = H.questions || [], n = qs.length;
  const loaded = n && H.solutions?.length === n && `${n} domande · ${totalPoints(qs)} punti`;
  return html(template, { loaded, open: H.openKeys.has("questions") });
};
