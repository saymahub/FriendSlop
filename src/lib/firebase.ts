import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { readFirebaseEnv } from './firebaseEnv';

const app = initializeApp(readFirebaseEnv());

export const auth = getAuth(app);
export const db = getFirestore(app);

/**
 * Point at the local emulators when asked to.
 *
 * This is the switch that keeps development away from real answers: with it on,
 * nothing reaches the live project, and the danger zone can be tested without
 * consequence. The emulators run `firestore.rules`, so rule changes get proven
 * locally before they are published.
 */
export const usingEmulators = import.meta.env.VITE_USE_EMULATORS === 'true';

if (usingEmulators) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}
