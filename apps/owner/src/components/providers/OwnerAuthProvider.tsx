"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import {
  firebaseAuth,
  googleProvider,
  isAllowedOwnerEmail,
  OWNER_ALLOWED_EMAIL,
} from "@/lib/firebase";

interface OwnerAuthContextValue {
  user: User | null;
  loading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const OwnerAuthContext = createContext<OwnerAuthContextValue | null>(null);

export function OwnerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, async (nextUser) => {
      if (nextUser && !isAllowedOwnerEmail(nextUser.email)) {
        await signOut(firebaseAuth);
        setUser(null);
        setAuthError(
          `Access denied for ${nextUser.email ?? "unknown account"}. Sign in strictly with ${OWNER_ALLOWED_EMAIL}.`,
        );
        setLoading(false);
        return;
      }
      setUser(nextUser);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      if (!isAllowedOwnerEmail(result.user.email)) {
        await signOut(firebaseAuth);
        setAuthError(
          `Access denied for ${result.user.email ?? "this Google account"}. Only ${OWNER_ALLOWED_EMAIL} is authorized.`,
        );
      }
    } catch (err) {
      const code =
        typeof err === "object" && err !== null && "code" in err
          ? String((err as { code: unknown }).code)
          : "";
      if (code === "auth/popup-closed-by-user") {
        setAuthError("Sign-in window was closed before completing.");
      } else if (code === "auth/unauthorized-domain") {
        setAuthError(
          "This domain is not in Firebase Authorized Domains. Add localhost in Authentication > Settings.",
        );
      } else {
        setAuthError("Could not sign in with Google. Please try again.");
      }
    }
  };

  const logout = async () => {
    setAuthError(null);
    await signOut(firebaseAuth);
  };

  return (
    <OwnerAuthContext.Provider
      value={{ user, loading, authError, signInWithGoogle, logout }}
    >
      {children}
    </OwnerAuthContext.Provider>
  );
}

export function useOwnerAuth(): OwnerAuthContextValue {
  const ctx = useContext(OwnerAuthContext);
  if (!ctx) {
    throw new Error("useOwnerAuth must be used inside OwnerAuthProvider");
  }
  return ctx;
}
