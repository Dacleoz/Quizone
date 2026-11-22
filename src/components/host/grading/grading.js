import template from "./grading.html?raw";
import { html } from "../../../lib/render.js";
import { answerText } from "../../../lib/game.js";
import { H, Q } from "../state.js";
import { scoreOf, solutionText } from "../scoring.js";

const MODES = [["y", "Giusta"], ["n", "Sbagliata"], ["a", "Auto"]];

export default (rows) => html(template, {
  busy: H.busy,
  empty: { title: "Nessun concorrente", text: "Chi apre il link ed entra con il proprio nome compare qui." },
  players: rows.map((r) => ({
    uid: r.uid,
    name: r.name,
    open: H.openKeys.has(r.uid),
    score: r.state === "final" ? `${r.pts} pt` : `${r.answered}/${Q().length} risposte`,
    answers: scoreOf(r.uid, H.players.get(r.uid)).per.map(({ q, a, auto, ov }) => {
      const current = typeof ov === "boolean" ? (ov ? "y" : "n") : "a";
      return {
        n: q.n,
        answer: answerText(q, a),
        auto: auto ? "giusta" : "sbagliata",
        solution: solutionText(q),
        modes: MODES.map(([mode, label]) => ({ mode, label, pressed: mode === current })),
      };
    }),
  })),
});
