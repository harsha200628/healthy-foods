"use client";

import { useState } from "react";
import { LocateFixed } from "lucide-react";
import type { AddressInput } from "@/types/domain";
import { Button } from "@/components/ui/Button";

interface AddressFormFieldsProps {
  value: AddressInput;
  onChange: (next: AddressInput) => void;
  errors?: Partial<Record<keyof AddressInput, string>>;
  idPrefix: string;
  showDefaultCheckbox?: boolean;
}

export function AddressFormFields({
  value,
  onChange,
  errors = {},
  idPrefix,
  showDefaultCheckbox = true,
}: AddressFormFieldsProps) {
  const [locating, setLocating] = useState(false);
  const [geoMessage, setGeoMessage] = useState<string | null>(null);

  function updateField<K extends keyof AddressInput>(
    key: K,
    fieldVal: AddressInput[K],
  ) {
    onChange({ ...value, [key]: fieldVal });
  }

  function handleUseCurrentLocation() {
    if (!("geolocation" in navigator)) {
      setGeoMessage("GPS location is not supported in this browser.");
      return;
    }
    setLocating(true);
    setGeoMessage(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        updateField("mapsUrl", `https://maps.google.com/?q=${lat},${lng}`);
        setGeoMessage("GPS pin added to Google Maps link.");
        setLocating(false);
      },
      () => {
        setGeoMessage(
          "Could not access GPS permission. You can still type your address or paste a Maps link.",
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`${idPrefix}-label`}
            className="block text-sm font-semibold text-[var(--text-primary)]"
          >
            Address Label
          </label>
          <input
            id={`${idPrefix}-label`}
            type="text"
            value={value.label}
            onChange={(e) => updateField("label", e.target.value)}
            placeholder="Home, Hostel, Office"
            className="mt-1.5 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm text-[var(--text-primary)]"
          />
          {errors.label && (
            <p className="mt-1 text-xs font-medium text-[var(--danger)]">
              {errors.label}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={`${idPrefix}-recipient`}
            className="block text-sm font-semibold text-[var(--text-primary)]"
          >
            Recipient Name
          </label>
          <input
            id={`${idPrefix}-recipient`}
            type="text"
            value={value.recipientName}
            onChange={(e) => updateField("recipientName", e.target.value)}
            placeholder="Full name for delivery"
            className="mt-1.5 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm text-[var(--text-primary)]"
          />
          {errors.recipientName && (
            <p className="mt-1 text-xs font-medium text-[var(--danger)]">
              {errors.recipientName}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor={`${idPrefix}-phone`}
          className="block text-sm font-semibold text-[var(--text-primary)]"
        >
          Delivery Contact Phone
        </label>
        <input
          id={`${idPrefix}-phone`}
          type="tel"
          value={value.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          placeholder="+919876543210"
          className="mt-1.5 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm text-[var(--text-primary)]"
        />
        {errors.phone && (
          <p className="mt-1 text-xs font-medium text-[var(--danger)]">
            {errors.phone}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor={`${idPrefix}-line1`}
          className="block text-sm font-semibold text-[var(--text-primary)]"
        >
          House / Hostel / Street Address
        </label>
        <input
          id={`${idPrefix}-line1`}
          type="text"
          value={value.addressLine1}
          onChange={(e) => updateField("addressLine1", e.target.value)}
          placeholder="Room 204, Cedar Block, MG Road"
          className="mt-1.5 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm text-[var(--text-primary)]"
        />
        {errors.addressLine1 && (
          <p className="mt-1 text-xs font-medium text-[var(--danger)]">
            {errors.addressLine1}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`${idPrefix}-line2`}
            className="block text-sm font-semibold text-[var(--text-primary)]"
          >
            Apartment / Floor (Optional)
          </label>
          <input
            id={`${idPrefix}-line2`}
            type="text"
            value={value.addressLine2 ?? ""}
            onChange={(e) => updateField("addressLine2", e.target.value)}
            placeholder="2nd Floor, East Wing"
            className="mt-1.5 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm text-[var(--text-primary)]"
          />
        </div>

        <div>
          <label
            htmlFor={`${idPrefix}-landmark`}
            className="block text-sm font-semibold text-[var(--text-primary)]"
          >
            Nearby Landmark (Optional)
          </label>
          <input
            id={`${idPrefix}-landmark`}
            type="text"
            value={value.landmark ?? ""}
            onChange={(e) => updateField("landmark", e.target.value)}
            placeholder="Near Main Library Gate"
            className="mt-1.5 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm text-[var(--text-primary)]"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`${idPrefix}-city`}
            className="block text-sm font-semibold text-[var(--text-primary)]"
          >
            City / Area
          </label>
          <input
            id={`${idPrefix}-city`}
            type="text"
            value={value.city}
            onChange={(e) => updateField("city", e.target.value)}
            placeholder="Hyderabad"
            className="mt-1.5 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm text-[var(--text-primary)]"
          />
          {errors.city && (
            <p className="mt-1 text-xs font-medium text-[var(--danger)]">
              {errors.city}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={`${idPrefix}-postal`}
            className="block text-sm font-semibold text-[var(--text-primary)]"
          >
            PIN / Postal Code
          </label>
          <input
            id={`${idPrefix}-postal`}
            type="text"
            value={value.postalCode}
            onChange={(e) => updateField("postalCode", e.target.value)}
            placeholder="500001"
            className="mt-1.5 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm text-[var(--text-primary)]"
          />
          {errors.postalCode && (
            <p className="mt-1 text-xs font-medium text-[var(--danger)]">
              {errors.postalCode}
            </p>
          )}
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor={`${idPrefix}-maps`}
            className="block text-sm font-semibold text-[var(--text-primary)]"
          >
            Delivery Location Link / GPS Pin (Optional)
          </label>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleUseCurrentLocation}
            disabled={locating}
          >
            <LocateFixed className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{locating ? "Locating..." : "Pin My Location"}</span>
          </Button>
        </div>
        <input
          id={`${idPrefix}-maps`}
          type="url"
          value={value.mapsUrl ?? ""}
          onChange={(e) => updateField("mapsUrl", e.target.value)}
          placeholder="https://maps.google.com/?q=..."
          className="mt-1.5 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm text-[var(--text-primary)]"
        />
        {geoMessage && (
          <p className="mt-1 text-xs text-[var(--accent-primary)]">
            {geoMessage}
          </p>
        )}
        {errors.mapsUrl && (
          <p className="mt-1 text-xs font-medium text-[var(--danger)]">
            {errors.mapsUrl}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor={`${idPrefix}-notes`}
          className="block text-sm font-semibold text-[var(--text-primary)]"
        >
          Delivery Instructions (Optional)
        </label>
        <input
          id={`${idPrefix}-notes`}
          type="text"
          value={value.deliveryNotes ?? ""}
          onChange={(e) => updateField("deliveryNotes", e.target.value)}
          placeholder="Call at hostel gate, leave with security..."
          className="mt-1.5 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm text-[var(--text-primary)]"
        />
      </div>

      {showDefaultCheckbox && (
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[var(--text-secondary)]">
          <input
            type="checkbox"
            checked={Boolean(value.isDefault)}
            onChange={(e) => updateField("isDefault", e.target.checked)}
            className="h-4 w-4 accent-[var(--accent-primary)]"
          />
          <span>Set as my default delivery address</span>
        </label>
      )}
    </div>
  );
}
