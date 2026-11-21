import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, collection, getDoc, getDocs, setDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { auth, db } from "../../lib/firebase.js";
import { GAME_MIN } from "../../lib/game.js";
import { msOf } from "../../lib/utils.js";
import { H } from "./state.js";
import { render, renderView } from "./view.js";
import { selectGame } from "./data.js";
import { importQuiz, UserError } from "./quiz-import.js";

/** Run a write with busy/error/info handling. */
async function run(fn, okMsg = "") {
  if (H.busy) return;
  Object.assign(H, { busy: true, error: "", info: "" });
  renderView();
  try { await fn(); H.info = okMsg; }
  catch (e) { H.error = e instanceof UserError ? e.message : `Operazione non riuscita (${e?.code || e?.message || "errore"}).`; }
  H.busy = false; render();
}

function newCode() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  return [...crypto.getRandomValues(new Uint32Array(5))].map((x) => chars[x % chars.length]).join("");
}

const gameRef = () => doc(db, "games", H.code);
const minutesFromNow = (min, from = Date.now()) => Timestamp.fromMillis(from + min * 60000);

const LOGIN_ERRORS = {
  "auth/invalid-credential": "Email o password non corrette.",
  "auth/wrong-password": "Email o password non corrette.",
  "auth/user-not-found": "Email o password non corrette.",
  "auth/invalid-email": "Email o password non corrette.",
  "auth/too-many-requests": "Troppi tentativi: riprova tra qualche minuto.",
};

export const importFile = (file) => run(() => importQuiz(file), "Domande caricate.");

export const actions = {
  login: (_, form) => run(async () => {
    try { await signInWithEmailAndPassword(auth, form.elements.email.value.trim(), form.elements.password.value); }
    catch (e) { throw new UserError(LOGIN_ERRORS[e.code] || `Accesso non riuscito (${e.code}).`); }
  }),
  logout: () => signOut(auth),
  selectGame: ({ code }) => selectGame(code),
  newGame: () => run(async () => {
    let code = newCode();
    for (let i = 0; i < 5 && (await getDoc(doc(db, "games", code))).exists(); i++) code = newCode();
    await setDoc(doc(db, "games", code), { status: "waiting", createdAt: serverTimestamp(), durationMin: GAME_MIN });
    selectGame(code);
  }, "Partita creata: manda il link ai giocatori."),
  startGame: () => run(() => updateDoc(gameRef(), { status: "running", startedAt: serverTimestamp(), endsAt: minutesFromNow(GAME_MIN) })),
  addFive: () => run(() => updateDoc(gameRef(), { status: "running", endsAt: minutesFromNow(5, Math.max(msOf(H.game.endsAt), Date.now())) })),
  endNow: () => run(() => updateDoc(gameRef(), { status: "ended", endsAt: Timestamp.now() })),
  grade: ({ uid, n, mode }) => {
    const cur = { ...H.grading.get(uid) };
    if (mode === "a") delete cur["q" + n]; else cur["q" + n] = mode === "y";
    const ref = doc(db, "games", H.code, "grading", uid);
    return run(() => (Object.keys(cur).length ? setDoc(ref, cur) : deleteDoc(ref)));
  },
  askDelete: () => { H.confirmDelete = true; renderView(); },
  cancelDelete: () => { H.confirmDelete = false; renderView(); },
  deleteGame: () => {
    const code = H.code;
    return run(async () => {
      for (const sub of ["players", "grading", "public"]) {
        for (const d of (await getDocs(collection(db, "games", code, sub))).docs) await deleteDoc(d.ref);
      }
      await deleteDoc(doc(db, "games", code));
      selectGame("");
    }, `Partita ${code} eliminata.`);
  },
  copy: ({ link }, btn) => navigator.clipboard.writeText(link).then(() => {
    btn.textContent = "Link copiato";
    setTimeout(() => { btn.textContent = "Copia link giocatori"; }, 1800);
  }, () => getSelection().selectAllChildren(document.querySelector(".linkbox"))),
};
