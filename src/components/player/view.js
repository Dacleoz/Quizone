import { mount } from "../../lib/render.js";
import { GAME_MIN } from "../../lib/game.js";
import { renderClock, tickClock } from "../shared/clock/clock.js";
import { P, playPhase, playKey } from "./state.js";
import message from "./message/message.js";
import codeForm from "./code-form/code-form.js";
import nameForm from "./name-form/name-form.js";
import lobby from "./lobby/lobby.js";
import question from "./question/question.js";
import review from "./review/review.js";
import results from "./results/results.js";
import board from "./board/board.js";

const $view = document.getElementById("view");
const $subtitle = document.getElementById("subtitle");
const screens = { nocode: codeForm, notfound: codeForm, name: nameForm, lobby, question, review, results };

export function renderChrome() {
  // leaderboard (projector link ?v=classifica): game info, no clock; players: the opposite
  if (P.view === "board") $subtitle.textContent = P.status === "ready" ? `Partita ${P.code} · ${GAME_MIN} minuti` : "";
  else renderClock(P.game, (ended) => (ended ? "Tempo scaduto" : "Tempo rimasto"));
}

export function renderView() {
  P.playKey = playKey();
  const phase = playPhase();
  mount($view, P.view === "board" && P.status === "ready" ? board() : (screens[phase] || message)(phase));
  tickClock(P.game);
}

export function render() { renderChrome(); renderView(); }

export const setSaved = (text) => { const el = $view.querySelector("[data-saved]"); if (el) el.textContent = text; };
