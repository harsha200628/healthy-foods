"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  ClipboardList,
  Leaf,
  LogOut,
  Settings,
  ShieldCheck,
  UtensilsCrossed,
} from "lucide-react";
import { OWNER_ALLOWED_EMAIL } from "@/lib/firebase";
import { useOwnerAuth } from "@/components/providers/OwnerAuthProvider";

const NAV_ITEMS = [
  { href: "/", label: "Orders", desktopLabel: "Live Orders", icon: ClipboardList },
  { href: "/menu", label: "Menu", desktopLabel: "Menu & Photos", icon: UtensilsCrossed },
  { href: "/settings", label: "Settings", desktopLabel: "Kitchen Settings", icon: Settings },
] as const;

export function OwnerGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const { user, loading, authError, signInWithGoogle, logout } = useOwnerAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-canvas)] px-4">
        <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-8 py-6 text-sm font-medium text-[var(--text-secondary)] shadow-[var(--shadow-card)]">
          Checking owner session...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[var(--bg-canvas)] px-4 py-8">
        <div className="w-full max-w-md rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-card)] sm:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--bg-accent-soft)] text-[var(--accent-primary)]">
              <Leaf className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-serif text-xl font-bold text-[var(--text-primary)]">
                Healthy Foods
              </p>
              <p className="text-xs font-medium text-[var(--text-muted)]">
                Owner Kitchen Portal
              </p>
            </div>
          </div>

          <div className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-[#c4e3cc] bg-[var(--bg-accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent-primary)]">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Google Sign-In Only
          </div>

          <h1 className="mt-4 font-serif text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">
            Owner Kitchen Sign In
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
            Manage your salad menu, upload photos, view customer delivery
            locations, and accept, decline, or mark orders delivered. Restricted
            strictly to{" "}
            <span className="break-words font-semibold text-[var(--text-primary)]">
              {OWNER_ALLOWED_EMAIL}
            </span>
            .
          </p>

          {authError && (
            <p
              className="mt-4 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-xs font-medium text-[var(--danger)]"
              role="alert"
            >
              {authError}
            </p>
          )}

          <button
            type="button"
            onClick={() => void signInWithGoogle()}
            className="mt-6 flex min-h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-[var(--accent-primary)] px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--accent-primary-hover)] active:scale-[0.99]"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="currentColor"
            >
              <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z" />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] pb-24 md:pb-8">
      <header className="glass-bar sticky top-0 z-40 border-b border-[var(--border-subtle)]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 md:h-16 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--bg-accent-soft)] text-[var(--accent-primary)]">
              <Leaf className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-serif text-base font-bold leading-tight text-[var(--text-primary)]">
                Healthy Foods
              </p>
              <p className="text-[10px] font-semibold text-[var(--accent-primary)] sm:text-[11px]">
                Kitchen Console
              </p>
            </div>
          </Link>

          <nav
            aria-label="Owner desktop navigation"
            className="hidden items-center gap-1.5 md:flex"
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = normalized === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-[var(--accent-primary)] text-white"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{item.desktopLabel}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)] lg:inline-block">
              {user.email}
            </span>
            <button
              type="button"
              onClick={() => void logout()}
              aria-label="Sign out"
              className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-8 lg:px-8">
        {children}
      </main>

      {/* Native-feeling mobile bottom tab bar */}
      <nav
        aria-label="Owner mobile navigation"
        className="glass-bar pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border-subtle)] md:hidden"
      >
        <div className="mx-auto grid max-w-md grid-cols-3 px-2 pt-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = normalized === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-1 text-[11px] font-semibold transition-colors active:scale-95 ${
                  active
                    ? "text-[var(--accent-primary)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                <span
                  className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                    active ? "bg-[var(--bg-accent-soft)]" : ""
                  }`}
                >
                  <Icon className="h-[19px] w-[19px]" aria-hidden="true" />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
