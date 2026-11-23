import template from "./game-panel.html?raw";
import { html } from "../../../lib/render.js";
import { GAME_MIN, gameEnded, gameRunning, phaseLabel } from "../../../lib/game.js";
import { fmtTime, msOf, plural } from "../../../lib/utils.js";
import { H } from "../state.js";

export default (rows) => {
  const running = gameRunning(H.game), ended = gameEnded(H.game);
  return html(template, {
    ...H,
    running, ended,
    waiting: !running && !ended,
    cantStart: H.busy || !H.gameSolutions,
    minutes: GAME_MIN,
    phase: phaseLabel(H.game),
    endsAt: fmtTime(msOf(H.game.endsAt)),
    connected: plural(rows.length, "collegato", "collegati"),
    sent: plural(rows.filter((r) => r.state === "final").length, "ha inviato", "hanno inviato"),
  });
};
