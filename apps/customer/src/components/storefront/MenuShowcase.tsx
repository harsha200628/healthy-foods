"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Clock, Minus, Plus, Search, Star, X } from "lucide-react";
import { formatPrice, resolveAssetUrl } from "@/lib/format";
import type { MenuItem } from "@/types/domain";
import { Container } from "@/components/ui/Container";

interface MenuShowcaseProps {
  items: readonly MenuItem[];
  isStarterPreview: boolean;
  isKitchenOpen: boolean;
  quantities: Record<string, number>;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onSelectItem: (item: MenuItem) => void;
}

export function MenuShowcase({
  items,
  isStarterPreview,
  isKitchenOpen,
  quantities,
  onIncrement,
  onDecrement,
  onSelectItem,
}: MenuShowcaseProps) {
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [searchText, setSearchText] = useState("");

  const availableTags = useMemo(() => {
    const set = new Set<string>();
    for (const item of items) {
      for (const tag of item.dietaryTags) {
        if (tag.trim()) set.add(tag.trim());
      }
    }
    return ["All", ...Array.from(set)];
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return items.filter((item) => {
      const matchesTag =
        selectedTag === "All" || item.dietaryTags.includes(selectedTag);
      if (!matchesTag) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.itemNumber.toLowerCase().includes(q) ||
        item.ingredients.some((ing) => ing.toLowerCase().includes(q)) ||
        item.dietaryTags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [items, selectedTag, searchText]);

  return (
    <section
      id="menu"
      aria-labelledby="menu-heading"
      className="py-4 sm:py-8"
    >
      <Container>
        {/* Compact app-style search bar */}
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search salads, ingredients..."
            aria-label="Search salads"
            className="h-11 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] pl-10 pr-9 text-sm text-[var(--text-primary)] shadow-2xs placeholder:text-[var(--text-muted)]"
          />
          {searchText && (
            <button
              type="button"
              onClick={() => setSearchText("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Horizontal compact filter pills */}
        {availableTags.length > 1 && (
          <div
            className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
            role="tablist"
            aria-label="Filter salads by dietary tag"
          >
            {availableTags.map((tag) => {
              const active = selectedTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedTag(tag)}
                  className={`min-h-8 shrink-0 cursor-pointer rounded-full border px-3.5 text-xs font-semibold transition-colors ${
                    active
                      ? "border-[var(--accent-primary)] bg-[var(--accent-primary)] text-white"
                      : "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        )}

        {/* Section title row */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <h2
            id="menu-heading"
            className="text-sm font-bold text-[var(--text-primary)] sm:text-base"
          >
            Fresh Salads ({filteredItems.length})
          </h2>
          {isStarterPreview && (
            <span className="text-[11px] font-medium text-[var(--text-muted)]">
              Starter Menu
            </span>
          )}
        </div>

        {/* Compact 2-column food-app grid on mobile, 3-4 cols on larger screens */}
        {filteredItems.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 text-center text-sm text-[var(--text-secondary)]">
            No salads matched your filter.{" "}
            <button
              type="button"
              onClick={() => {
                setSelectedTag("All");
                setSearchText("");
              }}
              className="cursor-pointer font-semibold text-[var(--accent-primary)] underline"
            >
              Show all
            </button>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filteredItems.map((item) => {
              const qty = quantities[item.id] ?? 0;
              const canOrder = isKitchenOpen && item.isAvailable;

              return (
                <article
                  key={item.id}
                  className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2 shadow-2xs transition-shadow hover:shadow-md sm:p-2.5"
                >
                  <div>
                    {/* Square compact photo */}
                    <button
                      type="button"
                      onClick={() => onSelectItem(item)}
                      className="group relative block aspect-square w-full cursor-pointer overflow-hidden rounded-xl bg-[var(--bg-elevated)] text-left"
                      aria-label={`View details for ${item.title}`}
                    >
                      <Image
                        src={resolveAssetUrl(item.imageUrl)}
                        alt={`${item.itemNumber} — ${item.title}`}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
                          !item.isAvailable ? "opacity-55 grayscale-[30%]" : ""
                        }`}
                      />
                      <span className="absolute left-1.5 top-1.5 rounded-md bg-white/92 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--text-primary)] shadow-2xs backdrop-blur-xs">
                        {item.itemNumber}
                      </span>
                      {!item.isAvailable && (
                        <span className="absolute inset-x-1.5 bottom-1.5 rounded-md bg-[#b91c1c]/90 py-0.5 text-center text-[10px] font-bold text-white">
                          Sold Out
                        </span>
                      )}
                    </button>

                    {/* Micro metadata line (veg dot + prep/protein pill) */}
                    <div className="mt-2 flex items-center justify-between gap-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--accent-primary)]">
                        <span
                          className="inline-flex h-3 w-3 items-center justify-center rounded-[3px] border border-[var(--accent-primary)]"
                          aria-hidden="true"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)]" />
                        </span>
                        <span className="truncate">
                          {item.proteinGrams}g protein
                        </span>
                      </span>

                      <span className="inline-flex shrink-0 items-center gap-0.5 rounded bg-[#e6f2ea] px-1.5 py-0.5 text-[10px] font-bold text-[#156e39]">
                        <Star className="h-2.5 w-2.5 fill-current" aria-hidden="true" />
                        {item.calories}
                      </span>
                    </div>

                    {/* Crisp 2-line title */}
                    <button
                      type="button"
                      onClick={() => onSelectItem(item)}
                      className="mt-1 block w-full cursor-pointer text-left"
                    >
                      <h3 className="line-clamp-2 min-h-[2.25rem] text-[13px] font-bold leading-snug text-[var(--text-primary)] sm:text-sm">
                        {item.title}
                      </h3>
                    </button>

                    <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {item.prepMinutes} mins
                    </p>
                  </div>

                  {/* Compact Price + ADD / Stepper footer */}
                  <div className="mt-2.5 flex items-center justify-between gap-1.5 pt-1">
                    <span className="rounded bg-[#fef3c7] px-1.5 py-0.5 text-xs font-extrabold text-[var(--text-primary)] sm:text-sm">
                      {formatPrice(item.priceCents)}
                    </span>

                    {!canOrder ? (
                      <span className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 py-1.5 text-[11px] font-bold text-[var(--text-muted)]">
                        {!item.isAvailable ? "Out" : "Closed"}
                      </span>
                    ) : qty === 0 ? (
                      <button
                        type="button"
                        onClick={() => onIncrement(item.id)}
                        aria-label={`Add ${item.title} to bag`}
                        className="min-h-8 min-w-[64px] cursor-pointer rounded-lg border border-[var(--border-strong)] bg-white px-3 py-1 text-xs font-extrabold tracking-wide text-[var(--accent-primary)] shadow-2xs transition-colors hover:border-[var(--accent-primary)] hover:bg-[var(--bg-accent-soft)] active:scale-95"
                      >
                        ADD
                      </button>
                    ) : (
                      <div
                        className="inline-flex h-8 items-center rounded-lg bg-[var(--accent-primary)] text-white shadow-2xs"
                        role="group"
                        aria-label={`${item.title} quantity`}
                      >
                        <button
                          type="button"
                          onClick={() => onDecrement(item.id)}
                          aria-label={`Remove one ${item.title}`}
                          className="flex h-8 w-7 cursor-pointer items-center justify-center rounded-l-lg hover:bg-[var(--accent-primary-hover)]"
                        >
                          <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <span className="min-w-5 text-center text-xs font-extrabold">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => onIncrement(item.id)}
                          aria-label={`Add one more ${item.title}`}
                          className="flex h-8 w-7 cursor-pointer items-center justify-center rounded-r-lg hover:bg-[var(--accent-primary-hover)]"
                        >
                          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Container>
    </section>
  );
}
