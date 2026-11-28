"use client";

import Image from "next/image";
import { useEffect } from "react";
import { Check, Clock, Flame, Minus, Plus, X } from "lucide-react";
import { formatPrice, resolveAssetUrl } from "@/lib/format";
import type { MenuItem } from "@/types/domain";
import { Badge } from "@/components/ui/Badge";

interface ItemDetailSheetProps {
  item: MenuItem | null;
  quantity: number;
  isKitchenOpen: boolean;
  onClose: () => void;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
}

export function ItemDetailSheet({
  item,
  quantity,
  isKitchenOpen,
  onClose,
  onIncrement,
  onDecrement,
}: ItemDetailSheetProps) {
  useEffect(() => {
    if (!item) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [item, onClose]);

  if (!item) return null;

  const canOrder = isKitchenOpen && item.isAvailable;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center md:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="item-sheet-title"
    >
      <div
        className="fixed inset-0 bg-[#112619]/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="pb-safe relative z-10 flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-[26px] bg-[var(--bg-surface)] shadow-2xl md:max-w-md md:rounded-3xl">
        <div className="flex justify-center pt-2.5 md:hidden" aria-hidden="true">
          <span className="h-1 w-10 rounded-full bg-[var(--border-strong)]" />
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close item details"
          className="absolute right-3.5 top-3.5 z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/90 text-[var(--text-primary)] shadow-sm backdrop-blur-sm"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="relative aspect-[16/10] w-full shrink-0 bg-[var(--bg-elevated)]">
          <Image
            src={resolveAssetUrl(item.imageUrl)}
            alt={item.title}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 448px"
            className="object-cover"
          />
          <span className="absolute left-3.5 top-3.5 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[var(--text-primary)] shadow-xs">
            {item.itemNumber}
          </span>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2
                id="item-sheet-title"
                className="font-serif text-xl font-bold text-[var(--text-primary)]"
              >
                {item.title}
              </h2>
              {item.tagline && (
                <p className="mt-0.5 text-xs font-medium text-[var(--accent-primary)]">
                  {item.tagline}
                </p>
              )}
            </div>
            <p className="font-serif text-xl font-bold text-[var(--text-primary)]">
              {formatPrice(item.priceCents)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-elevated)] px-2.5 py-1 font-medium text-[var(--text-primary)]">
              <Flame className="h-3.5 w-3.5 text-[var(--accent-primary)]" aria-hidden="true" />
              {item.calories} kcal · {item.proteinGrams}g protein
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-elevated)] px-2.5 py-1 font-medium text-[var(--text-primary)]">
              <Clock className="h-3.5 w-3.5 text-[var(--accent-primary)]" aria-hidden="true" />
              {item.prepMinutes} mins
            </span>
          </div>

          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
            {item.description}
          </p>

          {item.dietaryTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.dietaryTags.map((tag) => (
                <Badge key={tag} tone="green">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/70 p-3 text-xs">
            <p className="font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Ingredients &amp; Dressing
            </p>
            <p className="mt-1 leading-relaxed text-[var(--text-secondary)]">
              {item.ingredients.join(" · ")}
            </p>
            {item.dressing && (
              <p className="mt-1.5 font-semibold text-[var(--text-primary)]">
                Dressing: {item.dressing}
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 sm:px-5">
          {!canOrder ? (
            <button
              type="button"
              disabled
              className="min-h-11 w-full rounded-xl bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-muted)]"
            >
              {!isKitchenOpen ? "Kitchen Paused" : "Sold Out"}
            </button>
          ) : quantity === 0 ? (
            <button
              type="button"
              onClick={() => onIncrement(item.id)}
              className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--accent-primary)] text-sm font-bold text-white shadow-sm hover:bg-[var(--accent-primary-hover)] active:scale-[0.99]"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Add to Bag · {formatPrice(item.priceCents)}</span>
            </button>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center rounded-xl border border-[var(--accent-primary)] bg-[var(--bg-accent-soft)] p-1">
                <button
                  type="button"
                  onClick={() => onDecrement(item.id)}
                  aria-label="Decrease quantity"
                  className="flex h-9 w-10 cursor-pointer items-center justify-center rounded-lg bg-white text-[var(--accent-primary)]"
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </button>
                <span className="inline-flex min-w-10 items-center justify-center gap-1 text-sm font-bold text-[var(--text-primary)]">
                  <Check className="h-3.5 w-3.5 text-[var(--accent-primary)]" aria-hidden="true" />
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => onIncrement(item.id)}
                  aria-label="Increase quantity"
                  className="flex h-9 w-10 cursor-pointer items-center justify-center rounded-lg bg-[var(--accent-primary)] text-white"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="min-h-11 flex-1 cursor-pointer rounded-xl bg-[var(--accent-primary)] px-4 text-sm font-bold text-white"
              >
                Done · {formatPrice(item.priceCents * quantity)}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
