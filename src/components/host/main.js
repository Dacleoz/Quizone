import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebase.js";
import { delegate, trackOpen } from "../../lib/render.js";
import { tickClock } from "../shared/clock/clock.js";
import { H, isHost } from "./state.js";
import { render } from "./view.js";
import { startHost, stopHost, checkEnded } from "./data.js";
import { actions, importFile } from "./actions.js";

delegate(actions);
trackOpen(H.openPlayers);
document.addEventListener("change", ({ target: t }) => {
  if (t.dataset.input === "quiz" && t.files[0]) importFile(t.files[0]);
});

setInterval(() => { tickClock(H.game); checkEnded(); }, 1000);

onAuthStateChanged(auth, (user) => {
  H.user = user; H.authReady = true;
  isHost() ? startHost() : stopHost();
  render();
});
