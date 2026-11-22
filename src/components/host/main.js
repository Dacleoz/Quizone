import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase.js";
import { delegate, trackOpen } from "../../lib/render.js";
import { tickClock } from "../shared/clock/clock.js";
import { H, isHost } from "./state.js";
import { render } from "./view.js";
import { startHost, stopHost, checkEnded } from "./data.js";
import { actions, importFile } from "./actions.js";

delegate(actions);
trackOpen(H.openKeys);
document.addEventListener("change", ({ target: t }) => {
  if (t.dataset.input === "quiz" && t.files[0]) importFile(t.files[0]);
});

setInterval(() => { tickClock(H.game); checkEnded(); }, 1000);

// Conduttore = account con un documento in hosts/{uid} (gestiti dalla console Firebase).
onAuthStateChanged(auth, async (user) => {
  const host = user && !user.isAnonymous
    && (await getDoc(doc(db, "hosts", user.uid)).catch(() => null))?.exists();
  if (user !== auth.currentUser) return; // l'account è cambiato durante la lettura
  Object.assign(H, { user, isHost: !!host, authReady: true });
  isHost() ? startHost() : stopHost();
  render();
});
