import { mount } from "../../lib/render.js";
import { renderClock, tickClock } from "../shared/clock/clock.js";
import { P, rows, playPhase, playKey } from "./state.js";
import tabs from "./tabs/tabs.js";
import message from "./message/message.js";
import codeForm from "./code-form/code-form.js";
import nameForm from "./name-form/name-form.js";
import lobby from "./lobby/lobby.js";
import question from "./question/question.js";
import review from "./review/review.js";
import results from "./results/results.js";
import board from "./board/board.js";

const $view = document.getElementById("view");
const $tabs = document.getElementById("tabs");
const screens = { nocode: codeForm, notfound: codeForm, name: nameForm, lobby, question, review, results };

export function renderChrome() {
  $tabs.hidden = P.status !== "ready";
  if (!$tabs.hidden) $tabs.innerHTML = tabs();
  renderClock(P.game, rows(), (ended) => (ended ? "Tempo scaduto" : "Tempo rimasto"));
}

export function renderView() {
  P.playKey = playKey();
  const phase = playPhase();
  mount($view, P.view === "board" && P.status === "ready" ? board() : (screens[phase] || message)(phase));
  tickClock(P.game);
}

export function render() { renderChrome(); renderView(); }

export const setSaved = (text) => { const el = $view.querySelector("[data-saved]"); if (el) el.textContent = text; };
