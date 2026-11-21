import { fmtClock, msOf } from "./utils.js";

export const GAME_MIN = 30;
export const LETTERS = ["A", "B", "C", "D", "E", "F"];

export const answerText = (q, a) => q.type === "choice"
  ? (typeof a === "number" && q.options?.[a] != null ? `${LETTERS[a]}) ${q.options[a]}` : "")
  : String(a ?? "").trim();

export const answeredCount = (questions, answers) => questions.filter((q) => answerText(q, answers?.["q" + q.n])).length;
export const totalPoints = (questions) => questions.reduce((s, q) => s + (q.pts || 0), 0);

/** Effective game state, using the local clock against the stored end time. */
export const gameEnded = (game, now = Date.now()) => !!game && (game.status === "ended" || (game.status === "running" && now >= msOf(game.endsAt)));
/**
 * Players may still save answers for 60 s after the end (see firestore.rules), so per-answer results
 * and solutions are published only after this delay; the extra 30 s absorb clock drift.
 */
export const REVEAL_DELAY_MS = 90_000;
export const resultsOpen = (game, now = Date.now()) => gameEnded(game, now) && now >= msOf(game.endsAt) + REVEAL_DELAY_MS;
export const gameRunning = (game, now = Date.now()) => game?.status === "running" && !gameEnded(game, now);
export const phaseLabel = (game) => gameRunning(game) ? "Partita in corso" : gameEnded(game) ? "Partita conclusa" : "In attesa di avvio";

export function timerText(game, now = Date.now()) {
  if (!game || game.status === "waiting") return fmtClock(GAME_MIN * 60000);
  return gameEnded(game, now) ? "00:00" : fmtClock(msOf(game.endsAt) - now);
}
