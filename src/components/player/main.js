import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../lib/firebase.js";
import { delegate } from "../../lib/render.js";
import { loadLocal } from "../../lib/utils.js";
import { tickClock } from "../shared/clock/clock.js";
import { P, Q, finals, ended, running, playPhase, playKey, nameKey, answerOf } from "./state.js";
import { render, renderChrome, renderView } from "./view.js";
import { actions, scheduleSave, submit, next, penalize } from "./actions.js";

let unsubs = [], autoTried = false, endedSeen = false, away = false;

/* data changed: refresh without disturbing someone who is typing */
function onData() {
  if (P.me && !P.answersLoaded) {
    P.answers = { ...P.me.answers }; P.answersLoaded = true;
    const first = Q().findIndex((q) => !answerOf(q));
    P.idx = first < 0 ? Math.max(0, Q().length - 1) : first;
  }
  if (!P.me && P.answersLoaded) { P.answers = {}; P.answersLoaded = false; P.idx = 0; P.step = "q"; autoTried = false; }
  renderChrome();
  const typing = ["name", "question", "review", "nocode", "notfound"].includes(playPhase());
  if (P.view !== "play" || !typing || playKey() !== P.playKey) renderView();
}

function watchGame() {
  unsubs.forEach((u) => u());
  Object.assign(P, { status: "loading", game: null, board: null, reveal: null, me: null, meLoaded: false, answersLoaded: false });
  P.name = loadLocal(nameKey()) || P.name;
  render();
  const fail = (e) => { P.status = "error"; P.error = e?.code === "unavailable" ? "Connessione assente. Riprova tra poco." : ""; render(); };
  const ref = (...path) => doc(db, "games", P.code, ...path);
  unsubs = [
    onSnapshot(ref(), (s) => {
      if (!s.exists()) { P.status = "notfound"; return render(); }
      P.game = s.data(); P.status = "ready"; endedSeen = ended();
      onData();
    }, fail),
    onSnapshot(ref("public", "board"), (s) => { P.board = s.data() || null; onData(); }, () => {}),
    onSnapshot(ref("public", "reveal"), (s) => { P.reveal = s.data() || null; onData(); }, () => {}),
    onSnapshot(ref("players", P.uid), (s) => { P.me = s.data() || null; P.meLoaded = true; onData(); }, fail),
  ];
}

delegate({
  ...actions,
  winner: () => import("./winner/winner.js").then((m) => m.default(finals()[0].name)),
  enterCode: (_, form) => {
    const code = form.elements.code.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!code) return;
    const u = new URL(location.href); u.searchParams.set("g", code); history.replaceState(null, "", u);
    P.code = code; watchGame();
  },
});
document.addEventListener("input", ({ target: t }) => {
  if (t.dataset.input === "name") P.name = t.value;
  if (t.dataset.input === "answer" && running()) { P.answers["q" + Q()[P.idx].n] = t.value; scheduleSave(); }
});
// leaving the tab while answering (e.g. to search online) costs PENALTY_PTS on return
document.addEventListener("visibilitychange", () => {
  const inGame = ["question", "review"].includes(playPhase());
  if (document.hidden) { away = inGame; return; }
  if (away && inGame) penalize();
  away = false;
});
document.addEventListener("keydown", (ev) => {
  if (ev.key === "Enter" && ev.target.dataset.input === "answer") { ev.preventDefault(); next(); }
});

setInterval(() => {
  tickClock(P.game);
  const e = ended();
  if (e !== endedSeen) { endedSeen = e; onData(); }
  if (e && P.me?.status === "playing" && !autoTried) { autoTried = true; submit(true); }
}, 1000);

onAuthStateChanged(auth, (user) => {
  if (!user) {
    signInAnonymously(auth).catch(() => {
      P.status = "error"; P.error = "Accesso non riuscito: verifica che l'accesso anonimo sia attivo nel progetto Firebase."; render();
    });
    return;
  }
  if (P.uid) return;
  P.uid = user.uid;
  if (P.code) watchGame(); else { P.status = "nocode"; render(); }
});
