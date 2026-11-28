"use client";

import Link from "next/link";
import {
  Leaf,
  LogOut,
  MapPin,
  PackageCheck,
  ShoppingBag,
  UserCircle2,
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

  return (
    <header className="glass-bar sticky top-0 z-40 border-b border-[var(--border-subtle)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[var(--accent-primary)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>

      <Container className="flex h-14 items-center justify-between gap-2 md:h-18 md:gap-4">
        <Link
          href="/"
          className="group inline-flex min-w-0 items-center gap-2 text-[var(--text-primary)]"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-accent-soft)] text-[var(--accent-primary)] transition-transform duration-200 group-hover:scale-105 md:h-10 md:w-10">
            <Leaf className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="whitespace-nowrap font-serif text-base font-bold leading-tight tracking-tight md:text-lg">
              {brandName}
            </span>
            <span className="text-[10px] font-medium tracking-wide text-[var(--text-muted)] md:text-[11px]">
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
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1 text-xs font-semibold text-[var(--text-primary)] md:px-3 md:py-1.5">
                <UserCircle2
                  className="h-4 w-4 text-[var(--accent-primary)]"
                  aria-hidden="true"
                />
                <span className="max-w-20 truncate md:max-w-28">
                  {profile?.name ?? "Customer"}
                </span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void logout()}
                aria-label="Sign out"
                className="min-h-9 px-2.5"
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
              size="sm"
              onClick={onOpenBag}
              className="min-h-9 whitespace-nowrap px-3 md:min-h-11 md:px-4"
              aria-label={`Open order bag, ${totalItems} items`}
            >
              <ShoppingBag className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Order Bag</span>
              <span className="inline sm:hidden">Bag</span>
              <span
                className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-bold ${
                  totalItems > 0
                    ? "bg-white text-[var(--accent-primary)]"
                    : "bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                }`}
              >
                {totalItems}
              </span>
            </Button>
          )}
        </div>
      </Container>
    </header>
  );
}
