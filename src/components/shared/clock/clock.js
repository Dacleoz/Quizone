import template from "./clock.html?raw";
import { html } from "../../../lib/render.js";
import { gameEnded, timerText } from "../../../lib/game.js";
import { msOf, plural } from "../../../lib/utils.js";

const $clock = document.getElementById("clock");
let labelFor = () => "";

/** Sticky clock bar, shown while a game runs or after it ended. `label(ended)` gives its caption; `rows`, if given, adds the connected/sent counts. */
export function renderClock(game, label, rows) {
  $clock.hidden = !["running", "ended"].includes(game?.status);
  if ($clock.hidden) return;
  labelFor = label;
  $clock.innerHTML = html(template, {
    meta: rows && {
      players: plural(rows.length, "collegato", "collegati"),
      sent: plural(rows.filter((r) => r.state === "final").length, "ha inviato", "hanno inviato"),
    },
  });
  tickClock(game);
}

/** Refresh every [data-timer] on the page and the clock colours. Called once a second. */
export function tickClock(game) {
  const now = Date.now(), ended = gameEnded(game, now);
  const text = timerText(game, now);
  document.querySelectorAll("[data-timer]").forEach((el) => { el.textContent = text; });
  const lbl = $clock.querySelector("[data-clock-lbl]");
  if (lbl) lbl.textContent = labelFor(ended);
  const left = game?.status === "running" ? msOf(game.endsAt) - now : Infinity;
  $clock.classList.toggle("warn", !ended && left <= 5 * 60000);
  $clock.classList.toggle("over", ended);
}
