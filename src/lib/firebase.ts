import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialisation de l'application Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const databaseId = (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)')
  ? firebaseConfig.firestoreDatabaseId
  : undefined;

// Configuration Firestore avec Long Polling pour garantir la connectivité
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, databaseId);

export const auth = getAuth(app);

export default app;