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
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-heading"
    >
      <div
        className="fixed inset-0 bg-[#112619]/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 flex h-full w-full max-w-lg flex-col border-l border-[var(--border-subtle)] bg-[var(--bg-canvas)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-4">
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

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <OrderCheckoutForm
            menu={menu}
            isKitchenOpen={isKitchenOpen}
            quantities={quantities}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            onClearCart={onClearCart}
            idPrefix="drawer"
          />
        </div>
      </div>
    </div>
  );
}
