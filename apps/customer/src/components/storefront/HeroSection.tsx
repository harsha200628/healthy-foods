import Image from "next/image";
import { Clock, Sparkles } from "lucide-react";
import { resolveAssetUrl } from "@/lib/format";
import type { StoreSettings } from "@/types/domain";
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
      className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] py-3 sm:py-5"
    >
      <Container>
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/65 p-2.5 sm:p-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[var(--bg-surface)] sm:h-16 sm:w-20">
              <Image
                src={resolveAssetUrl("/images/hero-salad.jpg")}
                alt="Healthy Foods fresh daily salad bowls"
                fill
                priority
                sizes="80px"
                className="object-cover"
              />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h1
                  id="hero-heading"
                  className="truncate font-serif text-base font-bold text-[var(--text-primary)] sm:text-xl"
                >
                  {settings.brandName}
                </h1>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    settings.isKitchenOpen
                      ? "bg-[#e3f1e7] text-[#156e39]"
                      : "bg-[#fee2e2] text-[#b91c1c]"
                  }`}
                >
                  {settings.isKitchenOpen ? "Open" : "Paused"}
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">
                {menuCount} fresh salads · {settings.serviceHours}
              </p>
              <p className="mt-0.5 hidden items-center gap-1 text-[11px] text-[var(--text-muted)] sm:inline-flex">
                <Sparkles className="h-3 w-3 text-[var(--accent-primary)]" aria-hidden="true" />
                Triple-washed daily greens · Delivered to your saved address
              </p>
            </div>
          </div>

          <div className="hidden shrink-0 items-center gap-1.5 rounded-xl bg-[var(--bg-surface)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] shadow-2xs sm:flex">
            <Clock className="h-3.5 w-3.5 text-[var(--accent-primary)]" aria-hidden="true" />
            <span>~10 mins prep</span>
          </div>
        </div>
      </Container>
    </section>
  );
}
