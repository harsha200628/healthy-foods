"use client";

import { useEffect, useState, type FormEvent } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { CheckCircle2 } from "lucide-react";
import { DEFAULT_STORE_SETTINGS } from "@/data/starter-seed";
import { firestoreDb } from "@/lib/firebase";
import { StoreSettingsFormSchema, type StoreSettings } from "@/types/owner";

export function SettingsForm() {
  const [settings, setSettings] = useState<StoreSettings>(
    DEFAULT_STORE_SETTINGS,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    getDoc(doc(firestoreDb, "storeSettings", "public"))
      .then((snap) => {
        if (snap.exists()) {
          const raw = snap.data();
          setSettings({
            brandName: String(raw.brandName ?? DEFAULT_STORE_SETTINGS.brandName),
            pickupLocation: String(
              raw.pickupLocation ?? DEFAULT_STORE_SETTINGS.pickupLocation,
            ),
            serviceHours: String(
              raw.serviceHours ?? DEFAULT_STORE_SETTINGS.serviceHours,
            ),
            contactEmail: String(
              raw.contactEmail ?? DEFAULT_STORE_SETTINGS.contactEmail,
            ),
            contactHandle: String(
              raw.contactHandle ?? DEFAULT_STORE_SETTINGS.contactHandle,
            ),
            isKitchenOpen: Boolean(
              raw.isKitchenOpen ?? DEFAULT_STORE_SETTINGS.isKitchenOpen,
            ),
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMsg(null);
    setSavedBanner(false);

    const parsed = StoreSettingsFormSchema.safeParse(settings);
    if (!parsed.success) {
      setErrorMsg(parsed.error.issues[0]?.message ?? "Check settings fields.");
      return;
    }

    setSaving(true);
    try {
      await setDoc(doc(firestoreDb, "storeSettings", "public"), {
        ...parsed.data,
        updatedAt: serverTimestamp(),
      });
      setSavedBanner(true);
    } catch {
      setErrorMsg("Could not save settings. Please retry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-[var(--text-primary)]">
          Kitchen Settings
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Control whether your kitchen is accepting orders, and update your
          pickup area, hours, and contact info.
        </p>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 text-sm text-[var(--text-muted)]">
          Loading settings...
        </div>
      ) : (
        <form
          onSubmit={handleSave}
          noValidate
          className="space-y-5 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-card)]"
        >
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/70 p-4">
            <div>
              <p className="font-semibold text-[var(--text-primary)]">
                Accepting Customer Orders
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Turn off when sold out or closed for the day.
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.isKitchenOpen}
              onChange={(e) =>
                setSettings((p) => ({ ...p, isKitchenOpen: e.target.checked }))
              }
              className="h-5 w-5 accent-[var(--accent-primary)]"
            />
          </label>

          <div>
            <label
              htmlFor="set-brand"
              className="block text-sm font-semibold text-[var(--text-primary)]"
            >
              Business Name
            </label>
            <input
              id="set-brand"
              type="text"
              value={settings.brandName}
              onChange={(e) =>
                setSettings((p) => ({ ...p, brandName: e.target.value }))
              }
              className="mt-1.5 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="set-area"
              className="block text-sm font-semibold text-[var(--text-primary)]"
            >
              Delivery / Pickup Area
            </label>
            <input
              id="set-area"
              type="text"
              value={settings.pickupLocation}
              onChange={(e) =>
                setSettings((p) => ({ ...p, pickupLocation: e.target.value }))
              }
              className="mt-1.5 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="set-hours"
              className="block text-sm font-semibold text-[var(--text-primary)]"
            >
              Service Hours
            </label>
            <input
              id="set-hours"
              type="text"
              value={settings.serviceHours}
              onChange={(e) =>
                setSettings((p) => ({ ...p, serviceHours: e.target.value }))
              }
              className="mt-1.5 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="set-email"
                className="block text-sm font-semibold text-[var(--text-primary)]"
              >
                Public Contact Email
              </label>
              <input
                id="set-email"
                type="email"
                value={settings.contactEmail}
                onChange={(e) =>
                  setSettings((p) => ({ ...p, contactEmail: e.target.value }))
                }
                className="mt-1.5 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="set-handle"
                className="block text-sm font-semibold text-[var(--text-primary)]"
              >
                Instagram / Social Handle
              </label>
              <input
                id="set-handle"
                type="text"
                value={settings.contactHandle}
                onChange={(e) =>
                  setSettings((p) => ({ ...p, contactHandle: e.target.value }))
                }
                className="mt-1.5 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>

          {savedBanner && (
            <p
              className="inline-flex w-full items-center gap-2 rounded-xl border border-[#b7dfc3] bg-[var(--bg-accent-soft)] px-4 py-3 text-xs font-semibold text-[var(--accent-primary)]"
              role="status"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Settings saved and synced live to the Customer Website!
            </p>
          )}

          {errorMsg && (
            <p
              className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-xs font-medium text-[var(--danger)]"
              role="alert"
            >
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="min-h-11 w-full cursor-pointer rounded-full bg-[var(--accent-primary)] px-6 text-sm font-semibold text-white hover:bg-[var(--accent-primary-hover)] disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Kitchen Settings"}
          </button>
        </form>
      )}
    </div>
  );
}
