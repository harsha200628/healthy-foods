"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { ArrowLeft, MapPin, PackageCheck } from "lucide-react";
import { firebaseAuth, firestoreDb } from "@/lib/firebase";
import { formatAddressOneLine } from "@/lib/addresses";
import { formatPrice } from "@/lib/format";
import type { OrderRecord, OrderStatus } from "@/types/domain";
import { useCustomerAuth } from "@/components/providers/AuthProvider";
import { MobileTabBar } from "@/components/storefront/MobileTabBar";
import { Navbar } from "@/components/storefront/Navbar";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";

const STATUS_META: Record<
  OrderStatus,
  { label: string; tone: "warm" | "green" | "danger" | "neutral"; hint: string }
> = {
  pending: {
    label: "Pending Kitchen Confirmation",
    tone: "warm",
    hint: "Waiting for the kitchen to accept your order.",
  },
  accepted: {
    label: "Accepted · Preparing",
    tone: "green",
    hint: "Your salads are being freshly prepared!",
  },
  delivered: {
    label: "Delivered",
    tone: "neutral",
    hint: "Marked delivered to your saved location.",
  },
  declined: {
    label: "Declined",
    tone: "danger",
    hint: "Kitchen could not fulfill this batch.",
  },
};

export default function MyOrdersPage() {
  const { user, loading } = useCustomerAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading) return;
    const currentUser = user ?? firebaseAuth.currentUser;
    if (!currentUser) {
      setOrders([]);
      setFetching(false);
      return;
    }

    const q = query(
      collection(firestoreDb, "orders"),
      where("customerUid", "==", currentUser.uid),
      orderBy("createdAt", "desc"),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: OrderRecord[] = snap.docs.map((d) => {
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
        setOrders(list);
        setFetching(false);
      },
      () => {
        setFetching(false);
      },
    );

    return () => unsub();
  }, [user, loading]);

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] pb-24 md:pb-12">
      <Navbar />
      <main id="main-content" className="py-6 sm:py-14">
        <Container className="max-w-3xl">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--accent-primary)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Salad Menu
          </Link>

          <div className="flex items-center gap-3">
            <PackageCheck
              className="h-7 w-7 text-[var(--accent-primary)]"
              aria-hidden="true"
            />
            <div>
              <h1 className="font-serif text-3xl font-semibold text-[var(--text-primary)]">
                My Orders (Live Status)
              </h1>
              <p className="text-sm text-[var(--text-secondary)]">
                Updates automatically when the kitchen accepts or delivers your
                bowls.
              </p>
            </div>
          </div>

          {loading || fetching ? (
            <div className="mt-8 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 text-sm text-[var(--text-muted)]">
              Loading your orders...
            </div>
          ) : !user ? (
            <div className="mt-8 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 text-center">
              <p className="text-base font-medium text-[var(--text-primary)]">
                Sign in with your mobile number and password to view your order
                history.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <Link
                  href="/login"
                  className="inline-flex min-h-11 items-center rounded-full bg-[var(--accent-primary)] px-6 text-sm font-semibold text-white"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex min-h-11 items-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)] px-6 text-sm font-semibold"
                >
                  Create Account
                </Link>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 text-center">
              <p className="text-base font-medium text-[var(--text-primary)]">
                No orders yet.
              </p>
              <Link
                href="/#menu"
                className="mt-4 inline-flex min-h-11 items-center rounded-full bg-[var(--accent-primary)] px-6 text-sm font-semibold text-white"
              >
                Browse Fresh Salads
              </Link>
            </div>
          ) : (
            <div className="mt-8 space-y-5">
              {orders.map((order) => {
                const statusInfo = STATUS_META[order.status] ?? STATUS_META.pending;
                return (
                  <article
                    key={order.id}
                    className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-card)]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                          Order {order.orderCode}
                        </p>
                        <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">
                          {order.pickupWindow}
                        </p>
                      </div>
                      <Badge tone={statusInfo.tone}>{statusInfo.label}</Badge>
                    </div>

                    <p className="mt-2 text-xs text-[var(--text-muted)]">
                      {statusInfo.hint}
                    </p>

                    {order.ownerNote && (
                      <div className="mt-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3.5 py-2.5 text-xs text-[var(--text-primary)]">
                        <strong>Kitchen Note:</strong> {order.ownerNote}
                      </div>
                    )}

                    <ul className="mt-4 divide-y divide-[var(--border-subtle)] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/50 px-4 text-sm">
                      {order.items.map((line, idx) => (
                        <li
                          key={`${line.itemId}-${idx}`}
                          className="flex items-center justify-between py-2.5"
                        >
                          <span>
                            {line.quantity}× {line.itemNumber} — {line.title}
                          </span>
                          <span className="font-semibold">
                            {formatPrice(line.lineTotalCents)}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-3 text-sm">
                      <div className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                        <MapPin
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--accent-primary)]"
                          aria-hidden="true"
                        />
                        <span>
                          <strong>{order.deliveryAddress.label}:</strong>{" "}
                          {formatAddressOneLine(order.deliveryAddress)}
                        </span>
                      </div>
                      <p className="font-serif text-lg font-bold text-[var(--text-primary)]">
                        {formatPrice(order.totalCents)}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </Container>
      </main>
      <MobileTabBar />
    </div>
  );
}
