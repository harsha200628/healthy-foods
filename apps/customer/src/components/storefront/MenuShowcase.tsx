"use client";

import Image from "next/image";
import { Check, Clock, Flame, Minus, Plus } from "lucide-react";
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
  return (
    <section
      id="menu"
      aria-labelledby="menu-heading"
      className="py-16 sm:py-20"
    >
      <Container>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <Badge tone="warm" className="mb-3">
              Fresh Daily Menu
            </Badge>
            <h2
              id="menu-heading"
              className="font-serif text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl"
            >
              Today&apos;s Signature Bowls
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[var(--text-secondary)]">
              Updated live from our kitchen—every bowl is made fresh to order
              with crisp greens and dressing packed on the side.
            </p>
          </div>

          {isStarterPreview && (
            <Badge tone="neutral">Starter Preview · Ready for Kitchen Seed</Badge>
          )}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {items.map((item) => {
            const qty = quantities[item.id] ?? 0;
            const canOrder = isKitchenOpen && item.isAvailable;

            return (
              <article
                key={item.id}
                className="card-lift flex flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)]"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--bg-elevated)]">
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
                  <div className="absolute left-4 top-4 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full border border-white/40 bg-[var(--bg-canvas)]/95 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] shadow-sm backdrop-blur-sm">
                      {item.itemNumber}
                    </span>
                    {!item.isAvailable && (
                      <Badge tone="danger">Sold Out</Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-serif text-2xl font-semibold text-[var(--text-primary)]">
                        {item.title}
                      </h3>
                      {item.tagline && (
                        <p className="mt-1 text-sm font-medium text-[var(--accent-primary)]">
                          {item.tagline}
                        </p>
                      )}
                    </div>
                    <p className="shrink-0 font-serif text-xl font-bold text-[var(--text-primary)]">
                      {formatPrice(item.priceCents)}
                    </p>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {item.description}
                  </p>

                  {item.dietaryTags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {item.dietaryTags.map((tag) => (
                        <Badge key={tag} tone="green">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/70 p-3.5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      Key Ingredients &amp; Dressing
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-secondary)]">
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

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border-subtle)] pt-4">
                    <div className="flex items-center gap-4 text-xs font-medium text-[var(--text-muted)]">
                      <span className="inline-flex items-center gap-1">
                        <Flame className="h-3.5 w-3.5" aria-hidden="true" />
                        {item.calories} kcal · {item.proteinGrams}g protein
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                        {item.prepMinutes}m prep
                      </span>
                    </div>

                    {!canOrder ? (
                      <Button variant="outline" size="md" disabled>
                        {!isKitchenOpen ? "Kitchen Paused" : "Sold Out"}
                      </Button>
                    ) : qty === 0 ? (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => onIncrement(item.id)}
                        aria-label={`Add ${item.itemNumber} (${item.title}) to order bag`}
                      >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        <span>Add Bowl</span>
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
                        <span className="inline-flex min-w-10 items-center justify-center gap-1 px-2 text-sm font-bold text-[var(--text-primary)]">
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
