"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import type { MenuItem } from "@/types/domain";
import { OrderCheckoutForm } from "@/components/storefront/OrderCheckoutForm";

interface OrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  menu: readonly MenuItem[];
  isKitchenOpen: boolean;
  quantities: Record<string, number>;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onClearCart: () => void;
}

export function OrderDrawer({
  isOpen,
  onClose,
  menu,
  isKitchenOpen,
  quantities,
  onIncrement,
  onDecrement,
  onClearCart,
}: OrderDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center md:items-stretch md:justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-heading"
    >
      <div
        className="fixed inset-0 bg-[#112619]/45 backdrop-blur-[3px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile: iOS bottom sheet; Desktop: Right-side drawer */}
      <div className="pb-safe relative z-10 flex max-h-[90dvh] w-full flex-col rounded-t-[28px] border-t border-[var(--border-subtle)] bg-[var(--bg-canvas)] shadow-2xl md:h-full md:max-h-full md:max-w-lg md:rounded-none md:border-l md:border-t-0">
        {/* Mobile sheet drag handle */}
        <div className="flex justify-center pt-2.5 md:hidden" aria-hidden="true">
          <span className="h-1 w-10 rounded-full bg-[var(--border-strong)]" />
        </div>

        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-3.5 sm:px-6 sm:py-4">
          <div>
            <h2
              id="drawer-heading"
              className="font-serif text-xl font-semibold text-[var(--text-primary)]"
            >
              Your Salad Bag
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Delivered to your saved address
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close order bag"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-elevated)]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
          <OrderCheckoutForm
            menu={menu}
            isKitchenOpen={isKitchenOpen}
            quantities={quantities}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            onClearCart={onClearCart}
            onClose={onClose}
            idPrefix="drawer"
          />
        </div>
      </div>
    </div>
  );
}
