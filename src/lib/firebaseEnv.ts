/**
 * Reads the Firebase config from the environment.
 *
 * Values live in `.env.local`, which is gitignored; `.env.example` lists the keys.
 * These identify the project rather than authorise anything, so they are safe in
 * the bundle — Firestore rules are what actually protect the data.
 */

export type FirebaseEnv = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

const KEYS = {
  apiKey: 'VITE_FIREBASE_API_KEY',
  authDomain: 'VITE_FIREBASE_AUTH_DOMAIN',
  projectId: 'VITE_FIREBASE_PROJECT_ID',
  storageBucket: 'VITE_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'VITE_FIREBASE_APP_ID',
} as const;

/**
 * Fails loudly at startup rather than letting a missing key surface later as an
 * unexplained permission error halfway through a questionnaire.
 */
export function readFirebaseEnv(): FirebaseEnv {
  const entries = Object.entries(KEYS) as [keyof FirebaseEnv, string][];
  const missing = entries.filter(([, variable]) => !import.meta.env[variable]).map(([, variable]) => variable);

  if (missing.length > 0) {
    throw new Error(
      `Missing Firebase config: ${missing.join(', ')}. Copy .env.example to .env.local and fill it in.`,
    );
  }

  return Object.fromEntries(
    entries.map(([field, variable]) => [field, import.meta.env[variable] as string]),
  ) as FirebaseEnv;
}
