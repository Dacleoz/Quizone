import { html, mount } from "../../lib/render.js";
import { renderClock, tickClock } from "../shared/clock/clock.js";
import { H, Q, isHost } from "./state.js";
import { computeRows, solutionText } from "./scoring.js";
import accountTpl from "./account/account.html?raw";
import loginTpl from "./login/login.html?raw";
import solutionsTpl from "../shared/solutions.html?raw";
import deleteTpl from "./delete-game/delete-game.html?raw";
import questions from "./questions/questions.js";
import games from "./games/games.js";
import share, { drawQr } from "./share/share.js";
import gamePanel from "./game-panel/game-panel.js";
import grading from "./grading/grading.js";

const $view = document.getElementById("view");
const $account = document.getElementById("account");

export function renderView() {
  if (!H.authReady) return;
  if (!isHost()) {
    const wrongAccount = H.user && !H.user.isAnonymous && H.user.email;
    return mount($view, html(loginTpl, { ...H, wrongAccount }));
  }
  const rows = computeRows();
  mount($view, questions() + games() + (H.game ? [
    share(),
    gamePanel(rows),
    grading(rows),
    html(solutionsTpl, {
      solutions: Q().map((q) => ({ n: q.n, text: solutionText(q) })),
      solutionsOpen: H.openKeys.has("solutions"),
    }),
    html(deleteTpl, H),
  ].join("") : ""));
  drawQr($view);
  tickClock(H.game);
}

export function render() {
  $account.innerHTML = html(accountTpl, { email: H.user && !H.user.isAnonymous && H.user.email });
  renderClock(isHost() && H.game, () => `Partita ${H.code}`, computeRows());
  renderView();
}
