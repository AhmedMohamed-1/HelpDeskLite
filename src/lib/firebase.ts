import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  browserPopupRedirectResolver,
  type Auth,
} from "firebase/auth";
import { getDatabase, type Database } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA5ESqS2tkFch5YjiVkrAz9ZyUmoFQ98XM",
  authDomain: "helpdesklite.firebaseapp.com",
  databaseURL: "https://helpdesklite-default-rtdb.firebaseio.com",
  projectId: "helpdesklite",
  storageBucket: "helpdesklite.firebasestorage.app",
  messagingSenderId: "596416121618",
  appId: "1:596416121618:web:5300f72a1846ccaf3281cb",
  measurementId: "G-56EL8KHQR2",
};

let app: FirebaseApp | undefined;
let authRef: Auth | undefined;
let dbRef: Database | undefined;

function getApplication() {
  if (!app) app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return app;
}

/** Client-only: call inside effects, handlers, or after hydration. */
export function firebaseAuth() {
  if (!authRef) {
    const application = getApplication();
    try {
      // Mobile browsers partition storage; try IndexedDB first, then fall back
      // so the session still survives the OAuth round-trip.
      authRef = initializeAuth(application, {
        persistence: [
          indexedDBLocalPersistence,
          browserLocalPersistence,
          browserSessionPersistence,
        ],
        popupRedirectResolver: browserPopupRedirectResolver,
      });
    } catch {
      authRef = getAuth(application);
    }
  }
  return authRef;
}

export function firebaseDb() {
  if (!dbRef) dbRef = getDatabase(getApplication());
  return dbRef;
}
