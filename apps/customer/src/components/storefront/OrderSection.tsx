"use client";

import type { MenuItem } from "@/types/domain";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { OrderCheckoutForm } from "@/components/storefront/OrderCheckoutForm";

interface OrderSectionProps {
  menu: readonly MenuItem[];
  isKitchenOpen: boolean;
  quantities: Record<string, number>;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onClearCart: () => void;
}

export function OrderSection({
  menu,
  isKitchenOpen,
  quantities,
  onIncrement,
  onDecrement,
  onClearCart,
}: OrderSectionProps) {
  return (
    <section
      id="order"
      aria-labelledby="order-heading"
      className="py-16 sm:py-20"
    >
      <Container>
        <div className="grid gap-8 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-card)] sm:p-10 lg:grid-cols-12 lg:gap-10">
          <div className="min-w-0 lg:col-span-5">
            <Badge tone="green" className="mb-3">
              Checkout &amp; Saved Addresses
            </Badge>
            <h2
              id="order-heading"
              className="font-serif text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl"
            >
              Order fresh bowls to your saved address.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)]">
              Your delivery address and optional GPS pin go straight to our
              kitchen so we can accept, prepare, and deliver cleanly.
            </p>

            <ul className="mt-6 space-y-2.5 text-sm text-[var(--text-secondary)]">
              <li>• Reuse saved delivery addresses across every order</li>
              <li>• Add new hostel, home, or office addresses anytime</li>
              <li>• Track Pending → Accepted → Delivered live in My Orders</li>
            </ul>
          </div>

          <div className="min-w-0 lg:col-span-7">
            <OrderCheckoutForm
              menu={menu}
              isKitchenOpen={isKitchenOpen}
              quantities={quantities}
              onIncrement={onIncrement}
              onDecrement={onDecrement}
              onClearCart={onClearCart}
              idPrefix="inline"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
