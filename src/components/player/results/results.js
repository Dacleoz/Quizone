import template from "./results.html?raw";
import { html } from "../../../lib/render.js";
import { totalPoints } from "../../../lib/game.js";
import { plural } from "../../../lib/utils.js";
import { P, Q, rows, finals, answerOf } from "../state.js";

export default () => {
  const row = rows().find((r) => r.uid === P.uid && r.state === "final");
  const still = rows().length - finals().length;
  const solutions = P.reveal?.solutions || [];
  return html(template, {
    me: P.me,
    heading: P.me.status === "submitted" ? "Risposte inviate" : "Tempo scaduto · risposte inviate in automatico",
    score: row && {
      pts: row.pts,
      total: totalPoints(Q()),
      summary: `${row.right} risposte giuste su ${Q().length}`,
      still: still && plural(still, "persona sta", "persone stanno"),
    },
    graded: !!row?.ok,
    items: Q().map((q, i) => {
      const ok = row?.ok?.[i];
      return {
        n: q.n, text: q.text, answer: answerOf(q, P.me.answers || {}),
        solution: ok === false && solutions[i],
        verdict: ok != null && { cls: ok ? "ok" : "bad", label: ok ? "+" + q.pts : "0" },
      };
    }),
  });
};
