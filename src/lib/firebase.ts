import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let firestoreInstance: Firestore;
try {
  if (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId.trim() !== '') {
    firestoreInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  } else {
    firestoreInstance = getFirestore(app);
  }
} catch (e) {
  console.warn('Failed to initialize custom databaseId, falling back to default', e);
  firestoreInstance = getFirestore(app);
}

export const db: Firestore = firestoreInstance;
export const auth: Auth = getAuth(app);
export const projectId = firebaseConfig.projectId;
export const firestoreDatabaseId = firebaseConfig.firestoreDatabaseId;
export default app;
