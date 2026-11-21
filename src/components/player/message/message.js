import template from "./message.html?raw";
import { html } from "../../../lib/render.js";
import { P } from "../state.js";

const messages = {
  loading: () => ({ text: "Collegamento alla partita…" }),
  error: () => ({ title: "Non riesco a collegarmi", text: P.error || "Controlla la connessione e ricarica la pagina." }),
  over: () => ({ eyebrow: "Partita conclusa", title: "Il tempo è scaduto", text: "Questa partita è finita. Puoi guardare com'è andata in classifica.", toBoard: true }),
};

/** Informational screens: loading, connection error, game over. */
export default (phase) => html(template, messages[phase]());
