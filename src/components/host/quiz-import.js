import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase.js";

/** Error whose message is shown as-is to the host. */
export class UserError extends Error {}
const fail = (msg) => { throw new UserError(msg); };

function validate(data) {
  const list = Array.isArray(data?.questions) ? data.questions : fail('Il file non contiene un elenco "questions".');
  if (!list.length) fail("Il file non contiene domande.");
  list.forEach((q, i) => {
    const where = `Domanda ${i + 1}: `;
    if (typeof q.n !== "number" || typeof q.pts !== "number" || typeof q.text !== "string") fail(where + "servono n, pts e text.");
    if (q.type === "choice") {
      if (!Array.isArray(q.options) || q.options.length < 2) fail(where + "servono almeno due opzioni.");
      if (typeof q.correct !== "number" || q.options[q.correct] == null) fail(where + '"correct" deve indicare un\'opzione (0 = A).');
    } else if (q.type === "open") {
      if (!Array.isArray(q.groups) || !q.groups.length || !q.groups.every((g) => Array.isArray(g) && g.length)) fail(where + '"groups" deve contenere le risposte accettate.');
      if (typeof q.solution !== "string") fail(where + 'manca "solution".');
    } else if (q.type === "order") {
      if (!Array.isArray(q.items) || q.items.length < 2 || new Set(q.items).size !== q.items.length) fail(where + '"items" deve contenere almeno due elementi diversi, nell\'ordine giusto.');
    } else fail(where + '"type" deve essere "open", "choice" o "order".');
  });
  return list;
}

/** Random order that is never the correct one (players see this, the solution keeps `items`). */
function shuffle(items) {
  const a = [...items];
  while (a.every((x, i) => x === items[i])) a.sort(() => Math.random() - 0.5);
  return a;
}

export async function importQuiz(file) {
  let data;
  try { data = JSON.parse(await file.text()); } catch { fail("Il file non è un JSON valido."); }
  const list = validate(data);
  const questions = list.map(({ n, pts, type, text, options, hint, items }) => ({ n, pts, type, text, ...(options && { options }), ...(hint && { hint }), ...(items && { items: shuffle(items) }) }));
  const solutions = list.map((q) => (q.type === "choice"
    ? { n: q.n, type: q.type, correct: q.correct }
    : q.type === "order" ? { n: q.n, type: q.type, order: q.items }
    // Firestore rejects nested arrays, so each group is stored as an object.
    : { n: q.n, type: q.type, solution: q.solution, groups: q.groups.map((g) => ({ any: g.map(String) })) }));
  await setDoc(doc(db, "quiz", "solutions"), { list: solutions, updatedAt: serverTimestamp() });
  await setDoc(doc(db, "quiz", "questions"), { list: questions, updatedAt: serverTimestamp() });
}
