import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { firestoreDb } from "@/lib/firebase";
import type { AddressInput, SavedAddress } from "@/types/domain";

/**
 * Saves a new delivery address under `users/{uid}/addresses`.
 * If `isDefault` is true, unsets `isDefault` on existing addresses atomically.
 */
export async function saveCustomerAddress(
  uid: string,
  input: AddressInput,
): Promise<string> {
  const addressesCol = collection(firestoreDb, "users", uid, "addresses");

  if (input.isDefault) {
    const existing = await getDocs(addressesCol);
    if (!existing.empty) {
      const batch = writeBatch(firestoreDb);
      existing.docs.forEach((d) => {
        if (d.data().isDefault === true) {
          batch.update(d.ref, {
            isDefault: false,
            updatedAt: serverTimestamp(),
          });
        }
      });
      await batch.commit();
    }
  }

  const docRef = await addDoc(addressesCol, {
    label: input.label,
    recipientName: input.recipientName,
    phone: input.phone,
    addressLine1: input.addressLine1,
    addressLine2: input.addressLine2 ?? "",
    landmark: input.landmark ?? "",
    city: input.city,
    postalCode: input.postalCode,
    deliveryNotes: input.deliveryNotes ?? "",
    mapsUrl: input.mapsUrl ?? "",
    isDefault: Boolean(input.isDefault),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function setDefaultCustomerAddress(
  uid: string,
  targetAddressId: string,
): Promise<void> {
  const addressesCol = collection(firestoreDb, "users", uid, "addresses");
  const existing = await getDocs(addressesCol);
  const batch = writeBatch(firestoreDb);

  existing.docs.forEach((d) => {
    batch.update(d.ref, {
      isDefault: d.id === targetAddressId,
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
}

export async function deleteCustomerAddress(
  uid: string,
  addressId: string,
): Promise<void> {
  await deleteDoc(doc(firestoreDb, "users", uid, "addresses", addressId));
}

export function formatAddressOneLine(
  addr: Omit<SavedAddress, "id" | "isDefault">,
): string {
  const parts = [
    addr.addressLine1,
    addr.addressLine2,
    addr.landmark ? `Near ${addr.landmark}` : "",
    addr.city,
    addr.postalCode,
  ].filter(Boolean);
  return parts.join(", ");
}

export async function updateCustomerAddress(
  uid: string,
  addressId: string,
  input: AddressInput,
): Promise<void> {
  await updateDoc(doc(firestoreDb, "users", uid, "addresses", addressId), {
    label: input.label,
    recipientName: input.recipientName,
    phone: input.phone,
    addressLine1: input.addressLine1,
    addressLine2: input.addressLine2 ?? "",
    landmark: input.landmark ?? "",
    city: input.city,
    postalCode: input.postalCode,
    deliveryNotes: input.deliveryNotes ?? "",
    mapsUrl: input.mapsUrl ?? "",
    isDefault: Boolean(input.isDefault),
    updatedAt: serverTimestamp(),
  });
}
