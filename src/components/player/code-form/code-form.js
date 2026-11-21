import template from "./code-form.html?raw";
import { html } from "../../../lib/render.js";
import { P } from "../state.js";

export default (phase) => html(template, {
  code: P.code,
  error: phase === "notfound" && `Nessuna partita con il codice ${P.code}. Controlla il link o il codice ricevuto dal conduttore.`,
});
