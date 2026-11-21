import template from "./review.html?raw";
import { html } from "../../../lib/render.js";
import { answeredCount } from "../../../lib/game.js";
import { P, Q, answerOf } from "../state.js";
import progress from "../progress/progress.js";

export default () => {
  const missing = Q().length - answeredCount(Q(), P.answers);
  return html(template, {
    ...P,
    progress: progress(),
    items: Q().map((q, i) => ({ i, n: q.n, text: q.text, answer: answerOf(q), editable: true })),
    missing: missing === 1 ? "Una domanda è" : missing ? `${missing} domande sono` : "",
    lastIdx: Q().length - 1,
  });
};
