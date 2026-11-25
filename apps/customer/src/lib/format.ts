import type { MenuItem } from "@/types/domain";

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function countCartItems(quantities: Record<string, number>): number {
  return Object.values(quantities).reduce((sum, q) => sum + (q > 0 ? q : 0), 0);
}

export function computeCartSummary(
  menu: readonly MenuItem[],
  quantities: Record<string, number>,
): {
  lines: {
    item: MenuItem;
    quantity: number;
    lineTotalCents: number;
  }[];
  totalCents: number;
} {
  const lines: {
    item: MenuItem;
    quantity: number;
    lineTotalCents: number;
  }[] = [];
  let totalCents = 0;

  for (const item of menu) {
    const qty = quantities[item.id] ?? 0;
    if (qty > 0 && item.isAvailable) {
      const lineTotalCents = item.priceCents * qty;
      lines.push({ item, quantity: qty, lineTotalCents });
      totalCents += lineTotalCents;
    }
  }

  return { lines, totalCents };
}

export function generateOrderCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "HF-";
  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)] ?? "X";
  }
  return code;
}
