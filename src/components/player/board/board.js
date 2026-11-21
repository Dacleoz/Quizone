import template from "./board.html?raw";
import { html } from "../../../lib/render.js";
import { phaseLabel, totalPoints } from "../../../lib/game.js";
import { fmtTime, plural } from "../../../lib/utils.js";
import { P, Q, rows, finals, running } from "../state.js";

export default () => {
  const count = Q().length;
  const others = rows().filter((r) => r.state !== "final");
  return html(template, {
    code: P.code,
    count,
    total: totalPoints(Q()),
    phase: phaseLabel(P.game),
    connected: plural(rows().length, "collegato", "collegati"),
    sent: plural(finals().length, "ha inviato", "hanno inviato"),
    timer: P.game?.status === "running",
    empty: !rows().length && {
      title: "Ancora nessun concorrente",
      text: "Chi entra con il proprio nome compare qui subito, con l'avanzamento delle risposte.",
      canJoin: !P.me,
    },
    finals: finals().map((r, i) => ({ ...r, mine: r.uid === P.uid, rank: i + 1, rankCls: i < 3 ? "r" + (i + 1) : "", time: fmtTime(r.finishedAt) })),
    othersTitle: `${running() ? "Stanno rispondendo" : "In sala d'attesa"} · ${others.length}`,
    others: others.map((r) => ({
      ...r, mine: r.uid === P.uid, waiting: r.state === "waiting",
      bar: Q().map((_, i) => ({ on: i < r.answered })),
    })),
  });
};
