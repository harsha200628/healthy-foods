"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Check, MapPin, Plus, Trash2 } from "lucide-react";
import {
  deleteCustomerAddress,
  formatAddressOneLine,
  saveCustomerAddress,
  setDefaultCustomerAddress,
} from "@/lib/addresses";
import { AddressInputSchema, type AddressInput } from "@/types/domain";
import { useCustomerAuth } from "@/components/providers/AuthProvider";
import { AddressFormFields } from "@/components/addresses/AddressFormFields";
import { MobileTabBar } from "@/components/storefront/MobileTabBar";
import { Navbar } from "@/components/storefront/Navbar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

const EMPTY_ADDRESS: AddressInput = {
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

export default function AddressesPage() {
  const { user, profile, addresses, loading } = useCustomerAuth();
  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState<AddressInput>(EMPTY_ADDRESS);
  const [errors, setErrors] = useState<
    Partial<Record<keyof AddressInput, string>>
  >({});
  const [saving, setSaving] = useState(false);

  async function handleAddAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setErrors({});

    const parsed = AddressInputSchema.safeParse({
      ...formState,
      recipientName: formState.recipientName.trim() || profile?.name || "",
      phone: formState.phone.trim() || profile?.phoneNumber || "",
    });

    if (!parsed.success) {
      const errs = parsed.error.flatten().fieldErrors;
      setErrors({
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

    setSaving(true);
    try {
      await saveCustomerAddress(user.uid, parsed.data);
      setShowForm(false);
      setFormState(EMPTY_ADDRESS);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] pb-24 md:pb-12">
      <Navbar />
      <main id="main-content" className="py-6 sm:py-14">
        <Container className="max-w-3xl">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--accent-primary)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Salad Menu
          </Link>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl font-semibold text-[var(--text-primary)]">
                Saved Delivery Addresses
              </h1>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Reuse your saved hostel, home, or office addresses across every
                salad order.
              </p>
            </div>
            {user && (
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setFormState({
                    ...EMPTY_ADDRESS,
                    recipientName: profile?.name ?? "",
                    phone: profile?.phoneNumber ?? "",
                    isDefault: addresses.length === 0,
                  });
                  setShowForm((v) => !v);
                }}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>{showForm ? "Close Form" : "Add Address"}</span>
              </Button>
            )}
          </div>

          {loading ? (
            <div className="mt-8 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 text-sm text-[var(--text-muted)]">
              Loading your saved addresses...
            </div>
          ) : !user ? (
            <div className="mt-8 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 text-center">
              <p className="text-base font-medium text-[var(--text-primary)]">
                Sign in to view or manage your saved delivery addresses.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <Link
                  href="/login"
                  className="inline-flex min-h-11 items-center rounded-full bg-[var(--accent-primary)] px-6 text-sm font-semibold text-white"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex min-h-11 items-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)] px-6 text-sm font-semibold"
                >
                  Create Account
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              {showForm && (
                <form
                  onSubmit={handleAddAddress}
                  noValidate
                  className="rounded-3xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-card)]"
                >
                  <h2 className="mb-4 font-serif text-xl font-semibold text-[var(--text-primary)]">
                    Add New Delivery Location
                  </h2>
                  <AddressFormFields
                    value={formState}
                    onChange={setFormState}
                    errors={errors}
                    idPrefix="addr-page"
                  />
                  <div className="mt-6 flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={saving}>
                      {saving ? "Saving..." : "Save Address"}
                    </Button>
                  </div>
                </form>
              )}

              {addresses.length === 0 ? (
                <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 text-center text-sm text-[var(--text-secondary)]">
                  You don&apos;t have any saved delivery addresses yet. Click{" "}
                  <strong>Add Address</strong> above to save one.
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((addr) => (
                    <article
                      key={addr.id}
                      className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-xs"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-serif text-xl font-semibold text-[var(--text-primary)]">
                              {addr.label}
                            </h2>
                            {addr.isDefault && (
                              <Badge tone="green">Default</Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium text-[var(--text-secondary)]">
                            {addr.recipientName} · {addr.phone}
                          </p>
                          <p className="text-sm text-[var(--text-secondary)]">
                            {formatAddressOneLine(addr)}
                          </p>
                          {addr.deliveryNotes && (
                            <p className="text-xs text-[var(--text-muted)]">
                              Delivery note: {addr.deliveryNotes}
                            </p>
                          )}
                          {addr.mapsUrl && (
                            <a
                              href={addr.mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 pt-1 text-xs font-semibold text-[var(--accent-primary)] hover:underline"
                            >
                              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                              View pinned map location
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {!addr.isDefault && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                void setDefaultCustomerAddress(user.uid, addr.id)
                              }
                            >
                              <Check className="h-3.5 w-3.5" aria-hidden="true" />
                              Set Default
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`Delete ${addr.label}`}
                            onClick={() =>
                              void deleteCustomerAddress(user.uid, addr.id)
                            }
                          >
                            <Trash2
                              className="h-4 w-4 text-[var(--danger)]"
                              aria-hidden="true"
                            />
                          </Button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </Container>
      </main>
      <MobileTabBar />
    </div>
  );
}
