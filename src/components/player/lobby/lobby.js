import template from "./lobby.html?raw";
import { html } from "../../../lib/render.js";
import { GAME_MIN } from "../../../lib/game.js";
import { plural } from "../../../lib/utils.js";
import { P, rows } from "../state.js";

export default () => {
  const names = rows().length ? rows().map((r) => ({ name: r.name, mine: r.uid === P.uid })) : [{ name: P.me.name, mine: true }];
  return html(template, { ...P, minutes: GAME_MIN, names, connected: plural(rows().length, "persona collegata", "persone collegate") });
};
