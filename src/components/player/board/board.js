import template from "./board.html?raw";
import { html, trackOpen } from "../../../lib/render.js";
import { phaseLabel, totalPoints } from "../../../lib/game.js";
import { fmtTime, plural } from "../../../lib/utils.js";
import { P, Q, rows, finals, running } from "../state.js";

const openKeys = new Set();
trackOpen(openKeys); // keep the solutions dropdown open across re-renders

export default () => {
  const count = Q().length;
  const others = rows().filter((r) => r.state !== "final");
  const solutions = (P.reveal?.solutions || []).map((text, i) => ({ n: Q()[i]?.n, text }));
  return html(template, {
    code: P.code,
    count,
    total: totalPoints(Q()),
    phase: phaseLabel(P.game),
    connected: plural(rows().length, "collegato", "collegati"),
    sent: plural(finals().length, "ha inviato", "hanno inviato"),
    empty: !rows().length && {
      title: "Ancora nessun concorrente",
      text: "Chi entra con il proprio nome compare qui subito, con l'avanzamento delle risposte.",
    },
    finals: finals().map((r, i) => ({ ...r, mine: r.uid === P.uid, rank: i + 1, first: i === 0, rankCls: i < 3 ? "r" + (i + 1) : "", time: fmtTime(r.finishedAt) })),
    othersTitle: `${running() ? "Stanno rispondendo" : "In sala d'attesa"} · ${others.length}`,
    others: others.map((r) => ({
      ...r, mine: r.uid === P.uid, waiting: r.state === "waiting",
      bar: Q().map((_, i) => ({ on: i < r.answered })),
    })),
    solutions,
    solutionsOpen: openKeys.has("solutions"),
  });
};
