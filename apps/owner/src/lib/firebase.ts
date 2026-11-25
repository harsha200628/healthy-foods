import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

export const OWNER_ALLOWED_EMAIL = (
  process.env.NEXT_PUBLIC_OWNER_EMAIL || "gcreddyprofessional@gmail.com"
).toLowerCase();

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
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export function isAllowedOwnerEmail(email: string | null | undefined): boolean {
  return Boolean(email && email.toLowerCase() === OWNER_ALLOWED_EMAIL);
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

const OWNER_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function resolveOwnerAssetUrl(src: string): string {
  if (
    !src ||
    src.startsWith("data:") ||
    src.startsWith("http://") ||
    src.startsWith("https://")
  ) {
    return src;
  }
  if (
    OWNER_BASE_PATH &&
    src.startsWith("/") &&
    !src.startsWith(`${OWNER_BASE_PATH}/`)
  ) {
    return `${OWNER_BASE_PATH}${src}`;
  }
  return src;
}

