import { answerText, gameEnded, gameRunning } from "../../lib/game.js";

const params = new URLSearchParams(location.search);

export const P = {
  code: (params.get("g") || "").toUpperCase().replace(/[^A-Z0-9]/g, ""),
  uid: null,
  status: "loading", // loading | nocode | notfound | ready | error
  view: params.get("v") === "classifica" ? "board" : "play",
  questions: null, game: null, board: null, reveal: null,
  me: null, meLoaded: false, name: "", answers: {}, answersLoaded: false,
  step: "q", idx: 0, busy: false, error: "", playKey: "",
};

export const Q = () => P.questions || [];
export const ended = () => gameEnded(P.game);
export const running = () => gameRunning(P.game);
export const rows = () => P.board?.rows || [];
export const finals = () => rows().filter((r) => r.state === "final");
export const nameKey = () => "quiz2026-name-" + P.code;
export const answerOf = (q, answers = P.answers) => answerText(q, answers["q" + q.n]);

export function playPhase() {
  if (["nocode", "notfound", "error"].includes(P.status)) return P.status;
  if (P.status !== "ready" || !P.questions || !P.game || !P.meLoaded) return "loading";
  if (P.me && (P.me.status === "submitted" || ended())) return "results";
  if (!P.me) return ended() ? "over" : "name";
  if (!running()) return "lobby";
  return P.step === "review" ? "review" : "question";
}
export const playKey = () => { const ph = playPhase(); return ph + "|" + (ph === "question" ? P.idx : ""); };
