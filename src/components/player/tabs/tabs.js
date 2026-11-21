import template from "./tabs.html?raw";
import { html } from "../../../lib/render.js";
import { P, rows } from "../state.js";

export default () => html(template, {
  tabs: [
    { key: "play", label: "Gioca" },
    { key: "board", label: "Classifica", count: rows().length },
  ].map((t) => ({ ...t, current: P.view === t.key })),
});
