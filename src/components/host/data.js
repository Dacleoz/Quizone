// Firestore subscriptions of the host page.
import { doc, collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase.js";
import { gameEnded, resultsOpen } from "../../lib/game.js";
import { loadLocal, saveLocal } from "../../lib/utils.js";
import { H } from "./state.js";
import { render, renderView } from "./view.js";
import { resetPublished, scheduleBoard } from "./scoring.js";

const CODE_KEY = "quiz2026-host-code";
const docsMap = (s) => new Map(s.docs.map((d) => [d.id, d.data()]));
let baseUnsubs = [], gameUnsubs = [], endedSeen = "";
const endState = () => `${gameEnded(H.game)}|${resultsOpen(H.game)}`;

export function onData() { render(); scheduleBoard(); }

export function selectGame(code) {
  gameUnsubs.forEach((u) => u());
  Object.assign(H, { code, game: null, gameSolutions: null, players: new Map(), grading: new Map(), confirmDelete: false });
  H.openKeys.forEach((k) => k !== "questions" && H.openKeys.delete(k)); // stesso Set usato da trackOpen
  resetPublished();
  saveLocal(CODE_KEY, code);
  render();
  if (!code) return (gameUnsubs = []);
  gameUnsubs = [
    onSnapshot(doc(db, "games", code), (s) => {
      if (!s.exists()) return H.code === code && selectGame("");
      H.game = s.data(); endedSeen = endState(); onData();
    }, () => {}),
    onSnapshot(collection(db, "games", code, "players"), (s) => { H.players = docsMap(s); onData(); }, () => {}),
    onSnapshot(collection(db, "games", code, "grading"), (s) => { H.grading = docsMap(s); onData(); }, () => {}),
    onSnapshot(doc(db, "games", code, "secret", "solutions"), (s) => { H.gameSolutions = s.data()?.list || null; onData(); }, () => {}),
  ];
}

/** Called once a second: re-score when the end time passes and again when results open. */
export function checkEnded() {
  const e = endState();
  if (H.game && e !== endedSeen) { endedSeen = e; onData(); }
}

export function startHost() {
  baseUnsubs.forEach((u) => u());
  baseUnsubs = [
    onSnapshot(doc(db, "quiz", "questions"), (s) => { H.questions = s.data()?.list || []; onData(); }, () => {}),
    onSnapshot(doc(db, "quiz", "solutions"), (s) => { H.solutions = s.data()?.list || null; onData(); },
      (e) => { H.error = `Non riesco a leggere le soluzioni (${e.code}).`; renderView(); }),
    onSnapshot(query(collection(db, "games"), orderBy("createdAt", "desc"), limit(12)), (s) => {
      H.games = s.docs.map((d) => ({ id: d.id, ...d.data() })); renderView();
    }, () => {}),
  ];
  selectGame(loadLocal(CODE_KEY));
}

export function stopHost() {
  [...baseUnsubs, ...gameUnsubs].forEach((u) => u());
  baseUnsubs = gameUnsubs = [];
  Object.assign(H, { code: "", game: null, games: [], questions: null, solutions: null });
}
