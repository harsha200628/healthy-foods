"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Check, ChevronDown, Clock, Flame, Minus, Plus } from "lucide-react";
import { formatPrice, resolveAssetUrl } from "@/lib/format";
import type { MenuItem } from "@/types/domain";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

interface MenuShowcaseProps {
  items: readonly MenuItem[];
  isStarterPreview: boolean;
  isKitchenOpen: boolean;
  quantities: Record<string, number>;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
}

export function MenuShowcase({
  items,
  isStarterPreview,
  isKitchenOpen,
  quantities,
  onIncrement,
  onDecrement,
}: MenuShowcaseProps) {
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});

  const availableTags = useMemo(() => {
    const set = new Set<string>();
    for (const item of items) {
      for (const tag of item.dietaryTags) {
        if (tag.trim()) set.add(tag.trim());
      }
    }
    return ["All", ...Array.from(set)];
  }, [items]);

  const filteredItems =
    selectedTag === "All"
      ? items
      : items.filter((item) => item.dietaryTags.includes(selectedTag));

  function toggleDetails(id: string) {
    setExpandedDetails((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <section
      id="menu"
      aria-labelledby="menu-heading"
      className="py-10 sm:py-16 lg:py-20"
    >
      <Container>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <Badge tone="warm" className="mb-2.5">
              Fresh Daily Menu
            </Badge>
            <h2
              id="menu-heading"
              className="font-serif text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl"
            >
              Today&apos;s Signature Bowls
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)] sm:mt-3 sm:text-base">
              Tap to add bowls to your bag. Every dressing is packed fresh on
              the side.
            </p>
          </div>

          {isStarterPreview && (
            <Badge tone="neutral" className="w-fit">
              Starter Preview
            </Badge>
          )}
        </div>

        {/* Mobile-friendly horizontally scrollable dietary filter pills */}
        {availableTags.length > 1 && (
          <div
            className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
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
                  className={`min-h-9 shrink-0 cursor-pointer rounded-full border px-4 text-xs font-semibold transition-colors ${
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

        <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:gap-6 md:grid-cols-2 lg:gap-8">
          {filteredItems.map((item) => {
            const qty = quantities[item.id] ?? 0;
            const canOrder = isKitchenOpen && item.isAvailable;
            const isExpanded = Boolean(expandedDetails[item.id]);

            return (
              <article
                key={item.id}
                className="card-lift flex flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)]"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--bg-elevated)] sm:aspect-[4/3]">
                  <Image
                    src={resolveAssetUrl(item.imageUrl)}
                    alt={`${item.itemNumber} — ${item.title}`}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className={`img-zoom object-cover ${
                      !item.isAvailable ? "opacity-60 grayscale-[30%]" : ""
                    }`}
                  />
                  <div className="absolute left-3 top-3 flex items-center gap-2 sm:left-4 sm:top-4">
                    <span className="inline-flex items-center rounded-full border border-white/40 bg-[var(--bg-canvas)]/92 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--text-primary)] shadow-sm backdrop-blur-md">
                      {item.itemNumber}
                    </span>
                    {!item.isAvailable && (
                      <Badge tone="danger">Sold Out</Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-serif text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">
                        {item.title}
                      </h3>
                      {item.tagline && (
                        <p className="mt-0.5 text-xs font-medium text-[var(--accent-primary)] sm:mt-1 sm:text-sm">
                          {item.tagline}
                        </p>
                      )}
                    </div>
                    <p className="shrink-0 font-serif text-lg font-bold text-[var(--text-primary)] sm:text-xl">
                      {formatPrice(item.priceCents)}
                    </p>
                  </div>

                  <p className="mt-2.5 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {item.description}
                  </p>

                  {item.dietaryTags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {item.dietaryTags.map((tag) => (
                        <Badge key={tag} tone="green">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Collapsible on mobile for clean app rhythm, always visible on sm+ */}
                  <button
                    type="button"
                    onClick={() => toggleDetails(item.id)}
                    aria-expanded={isExpanded}
                    className="mt-3 inline-flex w-fit cursor-pointer items-center gap-1 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] sm:hidden"
                  >
                    <span>
                      {isExpanded
                        ? "Hide ingredients & dressing"
                        : "View ingredients & dressing"}
                    </span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  <div
                    className={`mt-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/70 p-3.5 ${
                      isExpanded ? "block" : "hidden sm:block"
                    }`}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      Key Ingredients &amp; Dressing
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                      {item.ingredients.length > 0
                        ? item.ingredients.join(" · ")
                        : "Seasonal farm greens"}
                    </p>
                    {item.dressing && (
                      <p className="mt-1.5 text-xs font-medium text-[var(--text-primary)]">
                        Dressing: {item.dressing}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-3.5 sm:mt-5 sm:pt-4">
                    <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-[var(--text-muted)]">
                      <span className="inline-flex items-center gap-1">
                        <Flame className="h-3.5 w-3.5" aria-hidden="true" />
                        {item.calories} kcal · {item.proteinGrams}g
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                        {item.prepMinutes}m
                      </span>
                    </div>

                    {!canOrder ? (
                      <Button variant="outline" size="md" disabled>
                        {!isKitchenOpen ? "Paused" : "Sold Out"}
                      </Button>
                    ) : qty === 0 ? (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => onIncrement(item.id)}
                        aria-label={`Add ${item.itemNumber} (${item.title}) to order bag`}
                      >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        <span>Add</span>
                      </Button>
                    ) : (
                      <div
                        className="inline-flex items-center gap-1 rounded-full border border-[var(--border-strong)] bg-[var(--bg-accent-soft)] p-1"
                        role="group"
                        aria-label={`${item.itemNumber} quantity controls`}
                      >
                        <button
                          type="button"
                          onClick={() => onDecrement(item.id)}
                          aria-label={`Remove one ${item.title}`}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-elevated)]"
                        >
                          <Minus className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <span className="inline-flex min-w-9 items-center justify-center gap-1 px-1.5 text-sm font-bold text-[var(--text-primary)]">
                          <Check
                            className="h-3.5 w-3.5 text-[var(--accent-primary)]"
                            aria-hidden="true"
                          />
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => onIncrement(item.id)}
                          aria-label={`Add one more ${item.title}`}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[var(--accent-primary)] text-white transition-colors hover:bg-[var(--accent-primary-hover)]"
                        >
                          <Plus className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
