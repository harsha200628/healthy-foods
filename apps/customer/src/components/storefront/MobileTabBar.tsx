"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, PackageCheck, UserCircle2, UtensilsCrossed } from "lucide-react";
import { useCustomerAuth } from "@/components/providers/AuthProvider";

export function MobileTabBar() {
  const pathname = usePathname();
  const { user } = useCustomerAuth();

  const normalized = pathname.replace(/\/+$/, "") || "/";

  const tabs = [
    {
      href: "/",
      label: "Menu",
      icon: UtensilsCrossed,
      active: normalized === "/",
    },
    {
      href: "/orders",
      label: "Orders",
      icon: PackageCheck,
      active: normalized === "/orders",
    },
    {
      href: "/addresses",
      label: "Addresses",
      icon: MapPin,
      active: normalized === "/addresses",
    },
    {
      href: user ? "/addresses" : "/login",
      label: user ? "Account" : "Sign In",
      icon: UserCircle2,
      active: normalized === "/login" || normalized === "/signup",
    },
  ] as const;

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="glass-bar pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border-subtle)] md:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-4 px-2 pt-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-1 text-[11px] font-semibold transition-colors active:scale-95 ${
                tab.active
                  ? "text-[var(--accent-primary)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <span
                className={`flex h-7 w-11 items-center justify-center rounded-full transition-colors ${
                  tab.active ? "bg-[var(--bg-accent-soft)]" : ""
                }`}
              >
                <Icon className="h-[19px] w-[19px]" aria-hidden="true" />
              </span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
