import template from "./progress.html?raw";
import { html } from "../../../lib/render.js";
import { Q, answerOf } from "../state.js";

/** Progress bar split into segments sized by each question's points. */
export default (activeIdx = -1) => html(template, {
  segments: Q().map((q, i) => ({ pts: q.pts, cls: i === activeIdx ? "now" : answerOf(q) ? "done" : "" })),
});
