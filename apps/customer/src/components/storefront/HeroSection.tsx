import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Sparkles, Sprout } from "lucide-react";
import { resolveAssetUrl } from "@/lib/format";
import type { StoreSettings } from "@/types/domain";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";

export function HeroSection({
  settings,
  menuCount,
}: {
  settings: StoreSettings;
  menuCount: number;
}) {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden border-b border-[var(--border-subtle)] py-6 sm:py-12 lg:py-20"
    >
      <Container>
        <div className="grid items-center gap-6 lg:grid-cols-12 lg:gap-12">
          {/* Mobile-first visual banner card on top for phones, right side on desktop */}
          <div className="min-w-0 lg:order-2 lg:col-span-6">
            <div className="relative overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2 shadow-[var(--shadow-card)] sm:p-2.5">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-[var(--bg-elevated)] lg:aspect-[4/3]">
                <Image
                  src={resolveAssetUrl("/images/hero-salad.jpg")}
                  alt="Freshly prepared artisan salad bowl from Healthy Foods with greens, avocado, cherry tomatoes, and citrus vinaigrette"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 rounded-2xl bg-[var(--bg-canvas)]/88 px-3.5 py-2 text-xs backdrop-blur-md lg:hidden">
                  <span className="font-semibold text-[var(--text-primary)]">
                    {settings.isKitchenOpen ? "Open · Fresh Batch Today" : "Orders Paused"}
                  </span>
                  <span className="font-medium text-[var(--text-muted)]">
                    {menuCount} Bowls
                  </span>
                </div>
              </div>

              <div className="mt-2.5 hidden flex-wrap items-center justify-between gap-2 rounded-2xl bg-[var(--bg-elevated)] px-4 py-3 text-xs text-[var(--text-secondary)] lg:flex">
                <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
                  <Sparkles
                    className="h-3.5 w-3.5 text-[var(--accent-primary)]"
                    aria-hidden="true"
                  />
                  {settings.brandName} Kitchen
                </span>
                <span className="inline-flex items-center gap-1.5 text-[var(--text-muted)]">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {settings.serviceHours}
                </span>
              </div>
            </div>
          </div>

          <div className="min-w-0 lg:order-1 lg:col-span-6">
            <div className="mb-3 flex flex-wrap items-center gap-2 sm:mb-5">
              <Badge tone="green" className="gap-1.5 px-3 py-1">
                <Sprout className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Fresh Daily Salads</span>
              </Badge>
              <Badge tone={settings.isKitchenOpen ? "warm" : "danger"}>
                {settings.isKitchenOpen ? "Kitchen Open" : "Orders Paused"}
              </Badge>
            </div>

            <h1
              id="hero-heading"
              className="font-serif text-[1.85rem] font-semibold leading-[1.15] tracking-tight text-[var(--text-primary)] sm:text-5xl lg:text-[3.25rem]"
            >
              Crisp, honest salads prepared fresh every morning.
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--text-secondary)] sm:mt-5 sm:text-lg">
              Small-batch bowls crafted daily with triple-washed greens, roasted
              proteins, and house-whisked dressings—delivered straight to your
              saved address.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-8 sm:flex sm:flex-wrap sm:items-center sm:gap-3.5">
              <a
                href="#menu"
                className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[var(--accent-primary)] px-4 text-sm font-semibold text-white shadow-sm transition-[transform,background-color] duration-150 hover:bg-[var(--accent-primary-hover)] active:scale-[0.98] sm:px-6 sm:text-base"
              >
                <span>Order Bowls</span>
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              </a>

              <Link
                href="/orders"
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 text-sm font-semibold text-[var(--text-primary)] transition-[transform,background-color] duration-150 hover:bg-[var(--bg-elevated)] active:scale-[0.98] sm:px-6 sm:text-base"
              >
                Track Orders
              </Link>
            </div>

            <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-[var(--border-subtle)] pt-4 sm:mt-10 sm:gap-4 sm:pt-6">
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  Menu
                </dt>
                <dd className="mt-0.5 font-serif text-base font-semibold text-[var(--text-primary)] sm:text-xl">
                  {menuCount} {menuCount === 1 ? "Bowl" : "Bowls"}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  Address
                </dt>
                <dd className="mt-0.5 font-serif text-base font-semibold text-[var(--text-primary)] sm:text-xl">
                  1-Tap Reuse
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  Updates
                </dt>
                <dd className="mt-0.5 font-serif text-base font-semibold text-[var(--text-primary)] sm:text-xl">
                  Live Status
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </Container>
    </section>
  );
}
