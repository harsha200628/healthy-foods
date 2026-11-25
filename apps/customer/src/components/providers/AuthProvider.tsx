"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { firebaseAuth, firestoreDb } from "@/lib/firebase";
import type { SavedAddress } from "@/types/domain";

interface CustomerProfile {
  readonly name: string;
  readonly phoneNumber: string;
}

interface AuthContextValue {
  user: User | null;
  profile: CustomerProfile | null;
  addresses: readonly SavedAddress[];
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [addresses, setAddresses] = useState<readonly SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;
    let unsubAddresses: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(firebaseAuth, (nextUser) => {
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }
      if (unsubAddresses) {
        unsubAddresses();
        unsubAddresses = null;
      }

      setUser(nextUser);

      if (!nextUser) {
        setProfile(null);
        setAddresses([]);
        setLoading(false);
        return;
      }

      unsubProfile = onSnapshot(
        doc(firestoreDb, "users", nextUser.uid),
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setProfile({
              name: typeof data.name === "string" ? data.name : nextUser.displayName ?? "Customer",
              phoneNumber:
                typeof data.phoneNumber === "string"
                  ? data.phoneNumber
                  : nextUser.phoneNumber ?? "",
            });
          } else {
            setProfile({
              name: nextUser.displayName ?? "Customer",
              phoneNumber: nextUser.phoneNumber ?? "",
            });
          }
          setLoading(false);
        },
        () => {
          setLoading(false);
        },
      );

      const addrQuery = query(
        collection(firestoreDb, "users", nextUser.uid, "addresses"),
        orderBy("createdAt", "desc"),
      );
      unsubAddresses = onSnapshot(
        addrQuery,
        (snap) => {
          const list: SavedAddress[] = snap.docs.map((d) => {
            const raw = d.data();
            return {
              id: d.id,
              label: String(raw.label ?? "Saved"),
              recipientName: String(raw.recipientName ?? ""),
              phone: String(raw.phone ?? ""),
              addressLine1: String(raw.addressLine1 ?? ""),
              addressLine2: String(raw.addressLine2 ?? ""),
              landmark: String(raw.landmark ?? ""),
              city: String(raw.city ?? ""),
              postalCode: String(raw.postalCode ?? ""),
              deliveryNotes: String(raw.deliveryNotes ?? ""),
              mapsUrl: String(raw.mapsUrl ?? ""),
              isDefault: Boolean(raw.isDefault),
            };
          });
          list.sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
          setAddresses(list);
        },
        () => {
          setAddresses([]);
        },
      );
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
      if (unsubAddresses) unsubAddresses();
    };
  }, []);

  const logout = async () => {
    await signOut(firebaseAuth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, addresses, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useCustomerAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useCustomerAuth must be used inside AuthProvider");
  }
  return ctx;
}
