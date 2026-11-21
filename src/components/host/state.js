import { HOST_UID } from "../../lib/firebase.js";

export const H = {
  user: null, authReady: false, busy: false, error: "", info: "",
  questions: null, solutions: null, games: [],
  code: "", game: null, players: new Map(), grading: new Map(),
  confirmDelete: false, openPlayers: new Set(),
};

export const Q = () => H.questions || [];
export const isHost = () => H.user?.uid === HOST_UID;
export const playerLink = () => `${location.origin}/?g=${H.code}`;
