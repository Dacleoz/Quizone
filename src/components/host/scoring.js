// Scoring runs only on the host page: it is the only client allowed to read the solutions.
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase.js";
import { ARROW, LETTERS, answeredCount, gameEnded, resultsOpen } from "../../lib/game.js";
import { msOf, norm } from "../../lib/utils.js";
import { H, Q } from "./state.js";

const solFor = (n) => H.gameSolutions?.find((s) => s.n === n);

function autoCheck(q, a) {
  const s = solFor(q.n);
  if (!s) return false;
  if (q.type === "choice") return a === s.correct;
  if (q.type === "order") return a === s.order.join(ARROW);
  const t = ` ${norm(a)} `;
  // Every group ({ any: [...] }) must match at least one of its accepted words.
  return !!t.trim() && s.groups.every((g) => g.any.some((w) => t.includes(` ${norm(w)} `)));
}

export function solutionText(q) {
  const s = solFor(q.n);
  if (!s) return "?";
  if (q.type === "order") return s.order.join(ARROW);
  return q.type === "choice" ? `${LETTERS[s.correct]}) ${q.options[s.correct]}` : s.solution;
}

export function scoreOf(uid, p) {
  const grading = H.grading.get(uid) || {};
  const per = Q().map((q) => {
    const a = p.answers?.["q" + q.n];
    const auto = autoCheck(q, a);
    const ov = grading["q" + q.n];
    return { q, a, auto, ov, ok: typeof ov === "boolean" ? ov : auto };
  });
  const right = per.filter((x) => x.ok);
  return { per, right: right.length, pts: right.reduce((s, x) => s + x.q.pts, 0) };
}

/**
 * Leaderboard rows: final scores first (by points, then finish time), then players still answering.
 * `end` decides when unsubmitted answers count as final: the host sees it at the end time,
 * the public board only once resultsOpen() (players can still save answers until then).
 */
export function computeRows(end = gameEnded(H.game)) {
  const now = Date.now();
  const waiting = !H.game || H.game.status === "waiting";
  const list = [...H.players].filter(([, p]) => p?.name).map(([uid, p]) => {
    const row = { uid, name: p.name, answered: answeredCount(Q(), p.answers) };
    if (p.status !== "submitted" && !end) return { ...row, state: waiting ? "waiting" : "playing" };
    const sc = scoreOf(uid, p);
    const finishedAt = msOf(p.submittedAt) || msOf(H.game.endsAt) || now;
    return { ...row, state: "final", pts: sc.pts, right: sc.right, finishedAt, elapsedSec: Math.round((finishedAt - msOf(H.game.startedAt)) / 1000), ok: end ? sc.per.map((x) => x.ok) : null };
  });
  const finals = list.filter((r) => r.state === "final").sort((a, b) => b.pts - a.pts || a.finishedAt - b.finishedAt);
  const others = list.filter((r) => r.state !== "final").sort((a, b) => b.answered - a.answered || a.name.localeCompare(b.name));
  return [...finals, ...others];
}

/* ---------- public board + solutions reveal, written whenever something changes ---------- */
let timer, writing = false, pending = false, lastBoard = "", lastReveal = "";

export const resetPublished = () => { lastBoard = lastReveal = ""; };
export function scheduleBoard() { clearTimeout(timer); timer = setTimeout(writeBoard, 600); }

async function writeBoard() {
  if (!H.code || !H.game || !H.gameSolutions) return;
  const rows = computeRows(resultsOpen(H.game));
  const key = H.code + JSON.stringify(rows);
  if (key !== lastBoard) {
    if (writing) { pending = true; return; }
    writing = true;
    try { await setDoc(doc(db, "games", H.code, "public", "board"), { rows, updatedAt: serverTimestamp() }); lastBoard = key; }
    catch (e) { H.error = "Classifica non aggiornata: " + (e.code || e.message); }
    writing = false;
    if (pending) { pending = false; scheduleBoard(); }
  }
  if (!resultsOpen(H.game)) return;
  const solutions = Q().map(solutionText);
  const revealKey = H.code + JSON.stringify(solutions);
  if (revealKey === lastReveal) return;
  try { await setDoc(doc(db, "games", H.code, "public", "reveal"), { solutions }); lastReveal = revealKey; } catch {}
}
