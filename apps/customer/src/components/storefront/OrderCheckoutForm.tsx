"use client";

import Link from "next/link";
import { useEffect, useId, useState, type FormEvent } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Lock,
  MapPin,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { firestoreDb } from "@/lib/firebase";
import { saveCustomerAddress, formatAddressOneLine } from "@/lib/addresses";
import { computeCartSummary, formatPrice, generateOrderCode } from "@/lib/format";
import {
  AddressInputSchema,
  DELIVERY_WINDOWS,
  DELIVERY_WINDOW_LABELS,
  type AddressInput,
  type DeliveryWindow,
  type MenuItem,
} from "@/types/domain";
import { useCustomerAuth } from "@/components/providers/AuthProvider";
import { AddressFormFields } from "@/components/addresses/AddressFormFields";
import { Button } from "@/components/ui/Button";

interface OrderCheckoutFormProps {
  menu: readonly MenuItem[];
  isKitchenOpen: boolean;
  quantities: Record<string, number>;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onClearCart: () => void;
  idPrefix?: string;
}

const EMPTY_NEW_ADDRESS: AddressInput = {
  label: "Hostel / Home",
  recipientName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  city: "",
  postalCode: "",
  deliveryNotes: "",
  mapsUrl: "",
  isDefault: false,
};

export function OrderCheckoutForm({
  menu,
  isKitchenOpen,
  quantities,
  onIncrement,
  onDecrement,
  onClearCart,
  idPrefix = "checkout",
}: OrderCheckoutFormProps) {
  const reactId = useId();
  const prefix = `${idPrefix}-${reactId}`;
  const { user, profile, addresses, loading } = useCustomerAuth();

  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [addingAddress, setAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<AddressInput>(EMPTY_NEW_ADDRESS);
  const [addressErrors, setAddressErrors] = useState<
    Partial<Record<keyof AddressInput, string>>
  >({});
  const [pickupWindow, setPickupWindow] =
    useState<DeliveryWindow>("lunch-1230pm");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedCode, setConfirmedCode] = useState<string | null>(null);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const def = addresses.find((a) => a.isDefault) ?? addresses[0];
      if (def) setSelectedAddressId(def.id);
    }
  }, [addresses, selectedAddressId]);

  useEffect(() => {
    if (profile && !newAddress.recipientName) {
      setNewAddress((prev) => ({
        ...prev,
        recipientName: profile.name,
        phone: profile.phoneNumber,
      }));
    }
  }, [profile, newAddress.recipientName]);

  const { lines, totalCents } = computeCartSummary(menu, quantities);

  async function handleSaveNewAddress() {
    if (!user) return;
    setAddressErrors({});
    const parsed = AddressInputSchema.safeParse(newAddress);
    if (!parsed.success) {
      const errs = parsed.error.flatten().fieldErrors;
      setAddressErrors({
        label: errs.label?.[0],
        recipientName: errs.recipientName?.[0],
        phone: errs.phone?.[0],
        addressLine1: errs.addressLine1?.[0],
        city: errs.city?.[0],
        postalCode: errs.postalCode?.[0],
        mapsUrl: errs.mapsUrl?.[0],
      });
      return;
    }

    const newId = await saveCustomerAddress(user.uid, parsed.data);
    setSelectedAddressId(newId);
    setAddingAddress(false);
    setNewAddress({
      ...EMPTY_NEW_ADDRESS,
      recipientName: profile?.name ?? "",
      phone: profile?.phoneNumber ?? "",
    });
  }

  async function handleSubmitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMsg(null);

    if (!user) {
      setErrorMsg("Please sign in to place your order.");
      return;
    }
    if (!isKitchenOpen) {
      setErrorMsg("Kitchen orders are currently paused.");
      return;
    }
    if (lines.length === 0) {
      setErrorMsg("Please add at least one salad bowl to your bag.");
      return;
    }

    const chosenAddress = addresses.find((a) => a.id === selectedAddressId);
    if (!chosenAddress) {
      setErrorMsg("Please select or add a delivery address.");
      return;
    }

    setSubmitting(true);
    try {
      const orderCode = generateOrderCode();
      await addDoc(collection(firestoreDb, "orders"), {
        orderCode,
        customerUid: user.uid,
        customerName: profile?.name ?? chosenAddress.recipientName,
        customerPhone: profile?.phoneNumber || chosenAddress.phone,
        deliveryAddress: {
          label: chosenAddress.label,
          recipientName: chosenAddress.recipientName,
          phone: chosenAddress.phone,
          addressLine1: chosenAddress.addressLine1,
          addressLine2: chosenAddress.addressLine2,
          landmark: chosenAddress.landmark,
          city: chosenAddress.city,
          postalCode: chosenAddress.postalCode,
          deliveryNotes: chosenAddress.deliveryNotes,
          mapsUrl: chosenAddress.mapsUrl,
        },
        pickupWindow: DELIVERY_WINDOW_LABELS[pickupWindow],
        items: lines.map((line) => ({
          itemId: line.item.id,
          itemNumber: line.item.itemNumber,
          title: line.item.title,
          quantity: line.quantity,
          unitPriceCents: line.item.priceCents,
          lineTotalCents: line.lineTotalCents,
        })),
        totalCents,
        status: "pending",
        ownerNote: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      onClearCart();
      setConfirmedCode(orderCode);
    } catch {
      setErrorMsg(
        "Unable to submit your order right now. Please check your connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmedCode) {
    return (
      <div
        className="rounded-3xl border border-[#b7dfc3] bg-[var(--bg-accent-soft)] p-6 text-[var(--text-primary)]"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <CheckCircle2
            className="mt-0.5 h-6 w-6 shrink-0 text-[var(--accent-primary)]"
            aria-hidden="true"
          />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)]">
              Order Sent to Kitchen
            </p>
            <h3 className="mt-1 font-serif text-2xl font-semibold">
              Order {confirmedCode} Received!
            </h3>
            <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
              The kitchen can see your bowls and delivery address. Watch live
              status updates (Accepted / Delivered) in My Orders.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/orders"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--accent-primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--accent-primary-hover)]"
          >
            Track Live Status
          </Link>
          <Button
            variant="outline"
            size="md"
            onClick={() => setConfirmedCode(null)}
          >
            Order More
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmitOrder}
      noValidate
      className="min-w-0 max-w-full space-y-5"
    >
      {/* Cart Selection */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/65 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            Your Bowl Selection
          </p>
          {lines.length > 0 && (
            <button
              type="button"
              onClick={onClearCart}
              className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--danger)]"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Clear all
            </button>
          )}
        </div>

        <ul className="mt-3 divide-y divide-[var(--border-subtle)]">
          {menu
            .filter((m) => m.isAvailable)
            .map((item) => {
              const qty = quantities[item.id] ?? 0;
              return (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 py-2.5 first:pt-1 last:pb-1"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                      <span className="text-[var(--accent-primary)]">
                        {item.itemNumber}
                      </span>{" "}
                      · {item.title}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {formatPrice(item.priceCents)} each
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onDecrement(item.id)}
                      disabled={qty === 0}
                      aria-label={`Decrease quantity for ${item.title}`}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-elevated)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <span className="min-w-6 text-center text-sm font-bold text-[var(--text-primary)]">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => onIncrement(item.id)}
                      aria-label={`Increase quantity for ${item.title}`}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[var(--accent-primary)] text-white transition-colors hover:bg-[var(--accent-primary-hover)]"
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              );
            })}
        </ul>

        <div className="mt-3 flex items-center justify-between border-t border-[var(--border-subtle)] pt-3">
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            Order Total
          </span>
          <span className="font-serif text-xl font-bold text-[var(--text-primary)]">
            {formatPrice(totalCents)}
          </span>
        </div>
      </div>

      {/* Authentication Gate or Saved Addresses */}
      {loading ? (
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 text-sm text-[var(--text-muted)]">
          Checking your account...
        </div>
      ) : !user ? (
        <div className="rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-elevated)]/70 p-5">
          <div className="flex items-start gap-3">
            <Lock
              className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent-primary)]"
              aria-hidden="true"
            />
            <div>
              <h3 className="font-serif text-lg font-semibold text-[var(--text-primary)]">
                Sign in to use saved delivery addresses &amp; place your order
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                New customers create an account with their mobile number and
                password and save a delivery address. Returning customers sign in
                in one tap. Your selected bowls stay saved in your bag!
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <Link
                  href="/login"
                  className="inline-flex min-h-10 items-center justify-center rounded-full bg-[var(--accent-primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--accent-primary-hover)]"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)] px-5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              Select Saved Delivery Address
            </p>
            <button
              type="button"
              onClick={() => setAddingAddress((prev) => !prev)}
              className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-[var(--accent-primary)] hover:underline"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              {addingAddress ? "Cancel New Address" : "Add New Address"}
            </button>
          </div>

          {addresses.length === 0 && !addingAddress && (
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 text-sm text-[var(--text-secondary)]">
              No saved addresses yet. Click <strong>Add New Address</strong>{" "}
              above to save your delivery location.
            </div>
          )}

          {addresses.length > 0 && (
            <div className="space-y-2.5">
              {addresses.map((addr) => {
                const selected = addr.id === selectedAddressId;
                return (
                  <label
                    key={addr.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition-colors ${
                      selected
                        ? "border-[var(--accent-primary)] bg-[var(--bg-accent-soft)]/70"
                        : "border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`${prefix}-address`}
                      checked={selected}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="mt-1 h-4 w-4 accent-[var(--accent-primary)]"
                    />
                    <div className="min-w-0 flex-1 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-[var(--text-primary)]">
                          {addr.label}
                        </span>
                        <span className="text-[var(--text-muted)]">
                          · {addr.recipientName} ({addr.phone})
                        </span>
                      </div>
                      <p className="mt-1 text-[var(--text-secondary)]">
                        {formatAddressOneLine(addr)}
                      </p>
                      {addr.deliveryNotes && (
                        <p className="mt-0.5 text-[var(--text-muted)]">
                          Note: {addr.deliveryNotes}
                        </p>
                      )}
                      {addr.mapsUrl && (
                        <p className="mt-1 inline-flex items-center gap-1 font-medium text-[var(--accent-primary)]">
                          <MapPin className="h-3 w-3" aria-hidden="true" />
                          GPS location attached
                        </p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          {addingAddress && (
            <div className="rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-elevated)]/60 p-4">
              <p className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
                Save a New Delivery Address
              </p>
              <AddressFormFields
                value={newAddress}
                onChange={setNewAddress}
                errors={addressErrors}
                idPrefix={`${prefix}-new-addr`}
              />
              <div className="mt-4 flex justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => void handleSaveNewAddress()}
                >
                  Save &amp; Use This Address
                </Button>
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor={`${prefix}-window`}
              className="block text-sm font-semibold text-[var(--text-primary)]"
            >
              Preferred Delivery Window
            </label>
            <div className="relative mt-1.5">
              <select
                id={`${prefix}-window`}
                value={pickupWindow}
                onChange={(e) =>
                  setPickupWindow(e.target.value as DeliveryWindow)
                }
                style={{ appearance: "none", WebkitAppearance: "none" }}
                className="w-full max-w-full appearance-none rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2.5 pr-10 text-sm text-[var(--text-primary)]"
              >
                {DELIVERY_WINDOWS.map((win) => (
                  <option key={win} value={win}>
                    {DELIVERY_WINDOW_LABELS[win]}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
                aria-hidden="true"
              />
            </div>
          </div>

          {errorMsg && (
            <p
              className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3.5 py-2.5 text-xs font-medium text-[var(--danger)]"
              role="alert"
            >
              {errorMsg}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={submitting || !isKitchenOpen}
            className="w-full"
          >
            {submitting
              ? "Placing Order..."
              : totalCents > 0
                ? `Place Order · ${formatPrice(totalCents)}`
                : "Select Bowls Above to Order"}
          </Button>
        </div>
      )}
    </form>
  );
}
