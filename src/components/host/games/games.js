import template from "./games.html?raw";
import { html } from "../../../lib/render.js";
import { H, Q } from "../state.js";

const labels = { running: "in corso", ended: "finita", waiting: "in attesa" };

export default () => html(template, {
  ...H,
  disabled: H.busy || !Q().length,
  games: H.games.map((g) => ({ id: g.id, current: g.id === H.code, label: labels[g.status] || labels.waiting })),
});
