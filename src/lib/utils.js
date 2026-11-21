export const norm = (s) => String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

/** Firestore Timestamp | number | undefined -> milliseconds (NaN when missing). */
export const msOf = (t) => (t == null ? NaN : typeof t.toMillis === "function" ? t.toMillis() : Number(t));

export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

export const fmtClock = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

export const fmtTime = (ms) => {
  const d = new Date(ms);
  return isNaN(d) ? "" : d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

export const loadLocal = (key) => { try { return localStorage.getItem(key) || ""; } catch { return ""; } };
export const saveLocal = (key, value) => { try { value ? localStorage.setItem(key, value) : localStorage.removeItem(key); } catch {} };
