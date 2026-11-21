import template from "./name-form.html?raw";
import { html } from "../../../lib/render.js";
import { GAME_MIN } from "../../../lib/game.js";
import { P, Q, running } from "../state.js";

export default () => html(template, {
  ...P,
  phase: running() ? "Partita in corso" : "Sala d'attesa",
  button: running() ? "Entra e gioca" : "Entra in sala d'attesa",
  minutes: GAME_MIN,
  count: Q().length,
});
