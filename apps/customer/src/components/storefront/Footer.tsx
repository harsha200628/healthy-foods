import Link from "next/link";
import { Leaf } from "lucide-react";
import type { StoreSettings } from "@/types/domain";
import { Container } from "@/components/ui/Container";

export function Footer({ settings }: { settings: StoreSettings }) {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)]/70 py-12 text-sm text-[var(--text-secondary)]">
      <Container>
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 text-[var(--text-primary)]">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-accent-soft)] text-[var(--accent-primary)]">
                <Leaf className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="font-serif text-lg font-bold">
                {settings.brandName}
              </span>
            </div>
            <p className="mt-3 max-w-xs leading-relaxed text-[var(--text-muted)]">
              {settings.tagline}. Small-batch bowls crafted fresh every service
              day.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-[var(--text-primary)]">
              Customer Portal
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/#menu"
                  className="transition-colors hover:text-[var(--accent-primary)]"
                >
                  Daily Salad Menu
                </Link>
              </li>
              <li>
                <Link
                  href="/orders"
                  className="transition-colors hover:text-[var(--accent-primary)]"
                >
                  Track My Orders
                </Link>
              </li>
              <li>
                <Link
                  href="/addresses"
                  className="transition-colors hover:text-[var(--accent-primary)]"
                >
                  Saved Delivery Addresses
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-[var(--text-primary)]">
              Kitchen Hours &amp; Contact
            </h3>
            <p className="mt-3 text-[var(--text-muted)]">
              {settings.serviceHours}
            </p>
            <p className="mt-1 text-[var(--text-muted)]">
              {settings.pickupLocation}
            </p>
            <p className="mt-2 font-medium text-[var(--text-primary)]">
              {settings.contactHandle} · {settings.contactEmail}
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-[var(--border-subtle)] pt-6 text-xs text-[var(--text-muted)] sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {settings.brandName}. Student-crafted
            fresh salads.
          </p>
          <p>Securely powered by Firebase Auth &amp; Cloud Firestore.</p>
        </div>
      </Container>
    </footer>
  );
}
