export const H = {
  user: null, isHost: false, authReady: false, busy: false, error: "", info: "",
  questions: null, solutions: null, games: [],
  code: "", game: null, players: new Map(), grading: new Map(),
  confirmDelete: false, openPlayers: new Set(),
};

export const Q = () => H.questions || [];
export const isHost = () => H.isHost;
export const playerLink = () => `${location.origin}/?g=${H.code}`;
