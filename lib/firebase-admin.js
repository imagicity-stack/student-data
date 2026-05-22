import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getServiceAccount() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY."
    );
  }

  // Vercel / .env stores the key with escaped newlines; convert them back.
  privateKey = privateKey.replace(/\\n/g, "\n");

  return { projectId, clientEmail, privateKey };
}

function getApp() {
  const existing = getApps();
  if (existing.length) return existing[0];

  const { projectId, clientEmail, privateKey } = getServiceAccount();
  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export function getDb() {
  // A non-default (named) Firestore database is only used when its ID is passed
  // explicitly; otherwise the Admin SDK always targets the "(default)" database.
  const databaseId = process.env.FIREBASE_DATABASE_ID?.trim();
  return databaseId
    ? getFirestore(getApp(), databaseId)
    : getFirestore(getApp());
}
