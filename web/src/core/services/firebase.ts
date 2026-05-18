import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import {
  initializeFirestore,
  memoryLocalCache,
  connectFirestoreEmulator,
} from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// In-memory cache. The IndexedDB-backed persistentLocalCache trips a
// "FIRESTORE INTERNAL ASSERTION FAILED: Unexpected state" bug in the SDK's
// watch-stream target tracking; memory cache keeps live listeners working.
export const db = initializeFirestore(app, {
  localCache: memoryLocalCache(),
});

// Functions region must match the deployed region (doc 04 §1).
export const functions = getFunctions(app, 'us-central1');

export const storage = getStorage(app);

// When VITE_USE_EMULATOR is set, route every SDK at the local Emulator Suite.
if (import.meta.env.VITE_USE_EMULATOR === 'true') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);
  connectStorageEmulator(storage, '127.0.0.1', 9199);
}
