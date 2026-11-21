import Mustache from "mustache";
import error from "../components/shared/error.html?raw";
import emptyState from "../components/shared/empty-state.html?raw";
import answerList from "../components/shared/answer-list.html?raw";

const partials = { error, emptyState, answerList };

export const html = (template, view) => Mustache.render(template, view, partials);

/** Replace the content of `el` and focus the first [data-autofocus] field on wide screens. */
export function mount(el, markup) {
  el.innerHTML = markup;
  const field = el.querySelector("[data-autofocus]");
  if (field && matchMedia("(min-width: 561px)").matches) field.focus({ preventScroll: true });
}

/** Single delegated listener: elements carry data-act="name", handled by actions[name](dataset, el). */
export function delegate(actions) {
  document.addEventListener("click", (ev) => {
    const t = ev.target.closest("button[data-act], a[data-act]");
    if (t && !t.disabled) actions[t.dataset.act]?.(t.dataset, t);
  });
  document.addEventListener("submit", (ev) => {
    ev.preventDefault();
    actions[ev.target.dataset.act]?.(ev.target.dataset, ev.target);
  });
}

/** Keep track of which <details data-key> are open across re-renders. */
export function trackOpen(set) {
  document.addEventListener("toggle", ({ target: d }) => {
    if (d.dataset?.key) d.open ? set.add(d.dataset.key) : set.delete(d.dataset.key);
  }, true);
}
