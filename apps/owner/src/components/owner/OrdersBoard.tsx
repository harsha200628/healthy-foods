"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  Check,
  CheckCheck,
  ExternalLink,
  MapPin,
  Phone,
  XCircle,
} from "lucide-react";
import { firestoreDb, formatPrice } from "@/lib/firebase";
import type { OrderRecord, OrderStatus } from "@/types/owner";

type FilterTab = "all" | OrderStatus;

const STATUS_BADGE: Record<
  OrderStatus,
  { label: string; classes: string }
> = {
  pending: {
    label: "Pending",
    classes: "bg-[#fef3c7] text-[#b45309] border-[#fde68a]",
  },
  accepted: {
    label: "Accepted",
    classes: "bg-[#e3f1e7] text-[#156e39] border-[#b7dfc3]",
  },
  delivered: {
    label: "Delivered",
    classes: "bg-[#eef2f6] text-[#334155] border-[#cbd5e1]",
  },
  declined: {
    label: "Declined",
    classes: "bg-[#fee2e2] text-[#b91c1c] border-[#fecaca]",
  },
};

export function OrdersBoard() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [notesByOrder, setNotesByOrder] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(firestoreDb, "orders"),
      orderBy("createdAt", "desc"),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const next: OrderRecord[] = snap.docs.map((d) => {
          const raw = d.data();
          const created = raw.createdAt as { toMillis?: () => number } | null;
          return {
            id: d.id,
            orderCode: String(raw.orderCode ?? d.id),
            customerUid: String(raw.customerUid ?? ""),
            customerName: String(raw.customerName ?? ""),
            customerPhone: String(raw.customerPhone ?? ""),
            deliveryAddress: raw.deliveryAddress as OrderRecord["deliveryAddress"],
            pickupWindow: String(raw.pickupWindow ?? ""),
            items: Array.isArray(raw.items) ? raw.items : [],
            totalCents: Number(raw.totalCents ?? 0),
            status: (raw.status as OrderStatus) ?? "pending",
            ownerNote: String(raw.ownerNote ?? ""),
            createdAtMs: created?.toMillis ? created.toMillis() : Date.now(),
          };
        });
        setOrders(next);
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
    );

    return () => unsub();
  }, []);

  const counts = useMemo(() => {
    const map: Record<FilterTab, number> = {
      all: orders.length,
      pending: 0,
      accepted: 0,
      delivered: 0,
      declined: 0,
    };
    for (const o of orders) {
      map[o.status] += 1;
    }
    return map;
  }, [orders]);

  const activePrepTally = useMemo(() => {
    const totals = new Map<string, { label: string; qty: number }>();
    for (const o of orders) {
      if (o.status !== "pending" && o.status !== "accepted") continue;
      for (const line of o.items) {
        const key = `${line.itemNumber} · ${line.title}`;
        const prev = totals.get(key);
        totals.set(key, {
          label: key,
          qty: (prev?.qty ?? 0) + line.quantity,
        });
      }
    }
    return Array.from(totals.values());
  }, [orders]);

  const filteredOrders =
    activeTab === "all"
      ? orders
      : orders.filter((o) => o.status === activeTab);

  async function updateOrderStatus(order: OrderRecord, nextStatus: OrderStatus) {
    setActionError(null);
    setUpdatingId(order.id);
    try {
      const note = (notesByOrder[order.id] ?? order.ownerNote ?? "").trim();
      await updateDoc(doc(firestoreDb, "orders", order.id), {
        status: nextStatus,
        ownerNote: note,
        updatedAt: serverTimestamp(),
      });
    } catch {
      setActionError("Could not update order status. Please retry.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[var(--text-primary)]">
            Live Orders &amp; Delivery Queue
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Accept or decline incoming customer orders, view exact delivery
            locations, and mark bowls delivered.
          </p>
        </div>
      </div>

      {/* Active Prep Summary */}
      <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-card)]">
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)]">
          Active Kitchen Prep Tally (Pending + Accepted)
        </p>
        {activePrepTally.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            No pending or accepted bowls to prep right now.
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2.5">
            {activePrepTally.map((entry) => (
              <span
                key={entry.label}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3.5 py-1.5 text-xs font-semibold text-[var(--text-primary)]"
              >
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent-primary)] px-1.5 text-white">
                  {entry.qty}
                </span>
                {entry.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Filter Tabs — horizontally scrollable on mobile */}
      <div
        className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
        role="tablist"
        aria-label="Order filters"
      >
        {(
          [
            { id: "all", label: "All" },
            { id: "pending", label: "Pending" },
            { id: "accepted", label: "Accepted" },
            { id: "delivered", label: "Delivered" },
            { id: "declined", label: "Declined" },
          ] as const
        ).map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex min-h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border px-4 text-xs font-semibold transition-colors ${
                active
                  ? "border-[var(--accent-primary)] bg-[var(--accent-primary)] text-white"
                  : "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[11px] ${
                  active ? "bg-white/20 text-white" : "bg-[var(--bg-elevated)]"
                }`}
              >
                {counts[tab.id]}
              </span>
            </button>
          );
        })}
      </div>

      {actionError && (
        <p
          className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-xs font-medium text-[var(--danger)]"
          role="alert"
        >
          {actionError}
        </p>
      )}

      {loading ? (
        <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 text-sm text-[var(--text-muted)]">
          Listening for live orders...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 text-center text-sm text-[var(--text-secondary)]">
          No orders in this filter yet.
        </div>
      ) : (
        <div className="space-y-5">
          {filteredOrders.map((order) => {
            const addr = order.deliveryAddress;
            const fullAddress = [
              addr.addressLine1,
              addr.addressLine2,
              addr.landmark ? `Near ${addr.landmark}` : "",
              addr.city,
              addr.postalCode,
            ]
              .filter(Boolean)
              .join(", ");

            const fallbackMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
            const mapHref = addr.mapsUrl || fallbackMapUrl;
            const badge = STATUS_BADGE[order.status] ?? STATUS_BADGE.pending;
            const isBusy = updatingId === order.id;

            return (
              <article
                key={order.id}
                className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-card)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-sm font-bold text-[var(--text-primary)]">
                        {order.orderCode}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badge.classes}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">
                      {order.pickupWindow} ·{" "}
                      {new Date(order.createdAtMs).toLocaleString()}
                    </p>
                  </div>

                  <p className="font-serif text-2xl font-bold text-[var(--text-primary)]">
                    {formatPrice(order.totalCents)}
                  </p>
                </div>

                <div className="mt-5 grid gap-5 lg:grid-cols-12">
                  {/* Items Ordered */}
                  <div className="lg:col-span-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Ordered Bowls
                    </p>
                    <ul className="mt-2 divide-y divide-[var(--border-subtle)] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/55 px-4 text-sm">
                      {order.items.map((line, i) => (
                        <li
                          key={`${line.itemId}-${i}`}
                          className="flex items-center justify-between gap-2 py-2.5"
                        >
                          <span className="font-medium text-[var(--text-primary)]">
                            {line.quantity}× {line.itemNumber} — {line.title}
                          </span>
                          <span className="font-semibold">
                            {formatPrice(line.lineTotalCents)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Delivery Location & Customer Info */}
                  <div className="lg:col-span-7">
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Customer &amp; Delivery Location
                    </p>
                    <div className="mt-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/65 p-4 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-bold text-[var(--text-primary)]">
                          {order.customerName} ({addr.label})
                        </p>
                        <a
                          href={`tel:${addr.phone || order.customerPhone}`}
                          className="inline-flex items-center gap-1 rounded-full border border-[var(--border-strong)] bg-white px-3 py-1 text-xs font-semibold text-[var(--accent-primary)] hover:bg-[var(--bg-accent-soft)]"
                        >
                          <Phone className="h-3 w-3" aria-hidden="true" />
                          {addr.phone || order.customerPhone}
                        </a>
                      </div>

                      <p className="mt-2 text-sm text-[var(--text-secondary)]">
                        {fullAddress}
                      </p>

                      {addr.deliveryNotes && (
                        <p className="mt-1.5 text-xs font-medium text-[var(--text-primary)]">
                          Delivery Note: {addr.deliveryNotes}
                        </p>
                      )}

                      <a
                        href={mapHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-[var(--accent-primary)] shadow-xs ring-1 ring-[var(--border-subtle)] hover:bg-[var(--bg-accent-soft)]"
                      >
                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>
                          {addr.mapsUrl
                            ? "Open Customer GPS Pin"
                            : "Open Address in Google Maps"}
                        </span>
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Owner Note & Actions */}
                <div className="mt-5 flex flex-col gap-3 border-t border-[var(--border-subtle)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <input
                    type="text"
                    value={notesByOrder[order.id] ?? order.ownerNote}
                    onChange={(e) =>
                      setNotesByOrder((prev) => ({
                        ...prev,
                        [order.id]: e.target.value,
                      }))
                    }
                    placeholder="Optional note for customer (e.g., ETA 15 mins, at gate)"
                    aria-label={`Kitchen note for order ${order.orderCode}`}
                    className="min-w-0 flex-1 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2 text-xs text-[var(--text-primary)]"
                  />

                  <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
                    {order.status === "pending" && (
                      <>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => void updateOrderStatus(order, "accepted")}
                          className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[var(--accent-primary)] px-4 text-xs font-semibold text-white hover:bg-[var(--accent-primary-hover)] disabled:opacity-50"
                        >
                          <Check className="h-4 w-4" aria-hidden="true" />
                          Accept
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => void updateOrderStatus(order, "declined")}
                          className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-[#fecaca] bg-[#fef2f2] px-4 text-xs font-semibold text-[var(--danger)] hover:bg-[#fee2e2] disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4" aria-hidden="true" />
                          Decline
                        </button>
                      </>
                    )}

                    {order.status === "accepted" && (
                      <>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => void updateOrderStatus(order, "delivered")}
                          className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[var(--accent-primary)] px-4 text-xs font-semibold text-white hover:bg-[var(--accent-primary-hover)] disabled:opacity-50"
                        >
                          <CheckCheck className="h-4 w-4" aria-hidden="true" />
                          Delivered
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => void updateOrderStatus(order, "declined")}
                          className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-[#fecaca] bg-[#fef2f2] px-4 text-xs font-semibold text-[var(--danger)] hover:bg-[#fee2e2] disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4" aria-hidden="true" />
                          Decline
                        </button>
                      </>
                    )}

                    {(order.status === "delivered" ||
                      order.status === "declined") && (
                      <span className="col-span-2 text-xs font-medium text-[var(--text-muted)]">
                        Completed ({badge.label})
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
