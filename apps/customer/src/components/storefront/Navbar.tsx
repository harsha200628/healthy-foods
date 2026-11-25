"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Leaf,
  LogOut,
  MapPin,
  Menu,
  PackageCheck,
  ShoppingBag,
  UserCircle2,
  X,
} from "lucide-react";
import { useCustomerAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

interface NavbarProps {
  totalItems?: number;
  onOpenBag?: () => void;
  brandName?: string;
}

export function Navbar({
  totalItems = 0,
  onOpenBag,
  brandName = "Healthy Foods",
}: NavbarProps) {
  const { user, profile, logout } = useCustomerAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]/95 backdrop-blur-md">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[var(--accent-primary)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>

      <Container className="flex h-16 items-center justify-between gap-2 sm:h-18 sm:gap-4">
        <Link
          href="/"
          className="group inline-flex min-w-0 items-center gap-2.5 text-[var(--text-primary)]"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-accent-soft)] text-[var(--accent-primary)] transition-transform duration-200 group-hover:scale-105 sm:h-10 sm:w-10">
            <Leaf className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="whitespace-nowrap font-serif text-base font-bold leading-tight tracking-tight sm:text-lg">
              {brandName}
            </span>
            <span className="hidden text-[11px] font-medium tracking-wide text-[var(--text-muted)] sm:block">
              Fresh Daily Salads
            </span>
          </span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-6 text-sm font-medium text-[var(--text-secondary)] md:flex"
        >
          <Link
            href="/#menu"
            className="whitespace-nowrap py-2 transition-colors hover:text-[var(--accent-primary)]"
          >
            Menu
          </Link>
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 whitespace-nowrap py-2 transition-colors hover:text-[var(--accent-primary)]"
          >
            <PackageCheck className="h-4 w-4" aria-hidden="true" />
            <span>My Orders</span>
          </Link>
          <Link
            href="/addresses"
            className="inline-flex items-center gap-1.5 whitespace-nowrap py-2 transition-colors hover:text-[var(--accent-primary)]"
          >
            <MapPin className="h-4 w-4" aria-hidden="true" />
            <span>Addresses</span>
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)]">
                <UserCircle2
                  className="h-4 w-4 text-[var(--accent-primary)]"
                  aria-hidden="true"
                />
                <span className="max-w-28 truncate">
                  {profile?.name ?? "Customer"}
                </span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void logout()}
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/login"
                className="inline-flex min-h-10 items-center rounded-full px-3.5 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex min-h-10 items-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-elevated)]"
              >
                Create Account
              </Link>
            </div>
          )}

          {onOpenBag && (
            <Button
              variant={totalItems > 0 ? "primary" : "outline"}
              size="md"
              onClick={onOpenBag}
              className="whitespace-nowrap px-3 sm:px-4"
              aria-label={`Open order bag, ${totalItems} items`}
            >
              <ShoppingBag className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Order Bag</span>
              <span className="inline sm:hidden">Bag</span>
              <span
                className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-bold ${
                  totalItems > 0
                    ? "bg-white/20 text-white"
                    : "bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                }`}
              >
                {totalItems}
              </span>
            </Button>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] md:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Menu className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </Container>

      {mobileMenuOpen && (
        <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-2 text-sm font-semibold text-[var(--text-primary)]">
            <Link
              href="/#menu"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-3 py-2.5 hover:bg-[var(--bg-elevated)]"
            >
              Browse Salad Menu
            </Link>
            <Link
              href="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-3 py-2.5 hover:bg-[var(--bg-elevated)]"
            >
              My Orders
            </Link>
            <Link
              href="/addresses"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-3 py-2.5 hover:bg-[var(--bg-elevated)]"
            >
              Saved Delivery Addresses
            </Link>
            <div className="mt-2 border-t border-[var(--border-subtle)] pt-3">
              {user ? (
                <div className="flex items-center justify-between gap-2 px-3">
                  <span className="text-xs text-[var(--text-secondary)]">
                    Signed in as <strong>{profile?.name ?? "Customer"}</strong>
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      void logout();
                    }}
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 text-sm font-semibold"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex min-h-10 items-center justify-center rounded-full bg-[var(--accent-primary)] px-4 text-sm font-semibold text-white"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
