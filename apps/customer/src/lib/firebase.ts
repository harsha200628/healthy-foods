import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function createFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

export const firebaseApp: FirebaseApp = createFirebaseApp();
export const firebaseAuth: Auth = getAuth(firebaseApp);
export const firestoreDb: Firestore = getFirestore(firebaseApp);

/**
 * Normalizes country code + mobile digits into strict E.164 format (e.g., "+919876543210").
 */
export function toE164Phone(countryCode: string, mobileDigits: string): string {
  const cleanCode = countryCode.startsWith("+")
    ? `+${countryCode.slice(1).replace(/\D/g, "")}`
    : `+${countryCode.replace(/\D/g, "")}`;
  const digits = mobileDigits.replace(/\D/g, "");
  return `${cleanCode}${digits}`;
}

/**
 * Deterministic internal credential identifier derived from verified E.164 phone number,
 * enabling password-only logins after initial OTP verification.
 */
export function phoneToAuthIdentifier(e164Phone: string): string {
  const digits = e164Phone.replace(/\D/g, "");
  return `hf.${digits}@users.healthyfoods.app`;
}
