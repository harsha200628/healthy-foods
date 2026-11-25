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
      className="relative overflow-hidden border-b border-[var(--border-subtle)] py-12 sm:py-16 lg:py-20"
    >
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="min-w-0 lg:col-span-6">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <Badge tone="green" className="gap-1.5 px-3 py-1">
                <Sprout className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{settings.tagline}</span>
              </Badge>
              <Badge tone={settings.isKitchenOpen ? "warm" : "danger"}>
                {settings.isKitchenOpen ? "Kitchen Open Today" : "Orders Paused"}
              </Badge>
            </div>

            <h1
              id="hero-heading"
              className="font-serif text-4xl font-semibold leading-[1.12] tracking-tight text-[var(--text-primary)] sm:text-5xl lg:text-[3.25rem]"
            >
              Crisp, honest salads prepared fresh every morning.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
              Small-batch bowls crafted daily with triple-washed greens, roasted
              proteins, and house-whisked dressings—delivered straight to your
              saved address.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <a
                href="#menu"
                className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--accent-primary)] px-6 text-base font-semibold text-white shadow-sm transition-[transform,background-color] duration-150 hover:bg-[var(--accent-primary-hover)] active:scale-[0.98]"
              >
                <span>Browse Fresh Bowls</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>

              <Link
                href="/orders"
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)] px-6 text-base font-semibold text-[var(--text-primary)] transition-[transform,background-color] duration-150 hover:bg-[var(--bg-elevated)] active:scale-[0.98]"
              >
                Track My Orders
              </Link>
            </div>

            <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-[var(--border-subtle)] pt-6">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  Fresh Menu
                </dt>
                <dd className="mt-1 font-serif text-xl font-semibold text-[var(--text-primary)]">
                  {menuCount} {menuCount === 1 ? "Bowl" : "Bowls"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  Account
                </dt>
                <dd className="mt-1 font-serif text-xl font-semibold text-[var(--text-primary)]">
                  Saved Address
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  Tracking
                </dt>
                <dd className="mt-1 font-serif text-xl font-semibold text-[var(--text-primary)]">
                  Live Status
                </dd>
              </div>
            </dl>
          </div>

          <div className="min-w-0 lg:col-span-6">
            <div className="relative overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2.5 shadow-[var(--shadow-card)]">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[var(--bg-elevated)]">
                <Image
                  src={resolveAssetUrl("/images/hero-salad.jpg")}
                  alt="Freshly prepared artisan salad bowl from Healthy Foods with greens, avocado, cherry tomatoes, and citrus vinaigrette"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>

              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[var(--bg-elevated)] px-4 py-3 text-xs text-[var(--text-secondary)]">
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
        </div>
      </Container>
    </section>
  );
}
