import template from "./question.html?raw";
import { html } from "../../../lib/render.js";
import { LETTERS } from "../../../lib/game.js";
import { plural } from "../../../lib/utils.js";
import { P, Q } from "../state.js";
import progress from "../progress/progress.js";

export default () => {
  const q = Q()[P.idx];
  const a = P.answers["q" + q.n];
  return html(template, {
    q,
    progress: progress(P.idx),
    count: Q().length,
    points: plural(q.pts, "punto", "punti"),
    options: q.type === "choice" ? q.options.map((text, i) => ({ i, text, letter: LETTERS[i], pressed: a === i })) : [],
    answer: a ?? "",
    first: P.idx === 0,
    last: P.idx === Q().length - 1,
  });
};
