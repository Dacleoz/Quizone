import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase.js";
import { answeredCount } from "../../lib/game.js";
import { norm, saveLocal } from "../../lib/utils.js";
import { P, Q, rows, ended, running, nameKey } from "./state.js";
import { render, renderView, setSaved } from "./view.js";

const meRef = () => doc(db, "games", P.code, "players", P.uid);
const answersPatch = () => ({ answers: { ...P.answers }, answered: answeredCount(Q(), P.answers) });
const scrollTop = () => window.scrollTo({ top: 0 });

function friendly(e, fallback) {
  if (e?.code === "permission-denied") return "Operazione non consentita: la partita potrebbe essere già finita.";
  if (e?.code === "unavailable") return "Connessione assente. Riprova tra poco.";
  return fallback;
}

/* ---------- autosave: one write at a time, retried while the game runs ---------- */
let saveTimer, saving = false, savePending = false;

export function scheduleSave() {
  clearTimeout(saveTimer);
  setSaved("Salvataggio…");
  saveTimer = setTimeout(flushSave, 1200);
}

async function flushSave() {
  clearTimeout(saveTimer);
  if (P.me?.status !== "playing" || !running()) return;
  if (saving) { savePending = true; return; }
  saving = true;
  try { await updateDoc(meRef(), answersPatch()); setSaved("Risposte salvate"); }
  catch { setSaved("Non salvato, riprovo…"); savePending = running(); }
  saving = false;
  if (savePending) { savePending = false; setTimeout(flushSave, 1000); }
}

export async function submit(auto) {
  if (P.me?.status !== "playing" || (P.busy && !auto)) return;
  if (!auto && ended()) return render();
  clearTimeout(saveTimer);
  P.busy = true; P.error = "";
  if (!auto) renderView();
  for (let i = 0; saving && i < 50; i++) await new Promise((r) => setTimeout(r, 100));
  try { await updateDoc(meRef(), { ...answersPatch(), status: "submitted", submittedAt: serverTimestamp() }); }
  catch (e) { if (!auto) P.error = friendly(e, "Invio non riuscito. Controlla la connessione e riprova."); }
  P.busy = false; render();
}

async function join() {
  if (P.busy) return;
  const name = P.name.trim();
  P.error = !name ? "Scrivi un nome per entrare in classifica."
    : rows().some((r) => r.uid !== P.uid && norm(r.name) === norm(name)) ? "Questo nome è già in gara: scegline un altro." : "";
  if (P.error) return renderView();
  saveLocal(nameKey(), name);
  P.busy = true; renderView();
  try { await setDoc(meRef(), { name, status: "playing", answers: {}, answered: 0, joinedAt: serverTimestamp() }); }
  catch (e) { P.error = friendly(e, "Non è stato possibile entrare. Riprova."); }
  P.busy = false; render();
}

/* ---------- navigation ---------- */
function goQ(i) { P.step = "q"; P.idx = i; P.error = ""; renderView(); scrollTop(); }
function goReview() { P.step = "review"; P.error = ""; flushSave(); renderView(); scrollTop(); }
export const next = () => (P.idx === Q().length - 1 ? goReview() : goQ(P.idx + 1));

export const actions = {
  join,
  next,
  submit: () => submit(false),
  prev: () => goQ(Math.max(0, P.idx - 1)),
  goto: ({ i }) => goQ(Number(i)),
  choose: ({ i }, el) => {
    if (!running()) return;
    P.answers["q" + Q()[P.idx].n] = Number(i);
    el.parentElement.querySelectorAll(".opt").forEach((b) => b.setAttribute("aria-pressed", String(b === el)));
    scheduleSave();
  },
};
