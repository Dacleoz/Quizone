import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Public web config: access is enforced by firestore.rules.
const app = initializeApp({
  apiKey: "AIzaSyD6KRuqDNRTQ9AHE9nQGcaz3vD7jMOcRSY",
  authDomain: "quiz-christmas.firebaseapp.com",
  projectId: "quiz-christmas",
  storageBucket: "quiz-christmas.firebasestorage.app",
  messagingSenderId: "732422273754",
  appId: "1:732422273754:web:1b0d2b3e8a597451e603e3",
});

export const auth = getAuth(app);
export const db = getFirestore(app);
export const HOST_UID = "E2aag03sFtgYAugJwAD1LQHIoxA2";
