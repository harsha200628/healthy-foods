import { Droplets, MapPin, ShieldCheck } from "lucide-react";
import type { StoreSettings } from "@/types/domain";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";

const PILLARS = [
  {
    step: "01",
    title: "Verify Once, Sign In Fast",
    description:
      "Create your account once with Mobile + OTP + Password, save your delivery address, and log in anytime with just your password.",
    icon: ShieldCheck,
  },
  {
    step: "02",
    title: "Fresh Morning Kitchen Prep",
    description:
      "Greens are triple-washed, chilled crisp, and dressed separately so every bowl arrives crunchy and vibrant.",
    icon: Droplets,
  },
  {
    step: "03",
    title: "Reuse Saved Delivery Locations",
    description:
      "Select any saved hostel, home, or office address at checkout and track kitchen acceptance and delivery live.",
    icon: MapPin,
  },
] as const;

export function HowItWorks({ settings }: { settings: StoreSettings }) {
  return (
    <section
      id="kitchen"
      aria-labelledby="kitchen-heading"
      className="border-y border-[var(--border-subtle)] bg-[var(--bg-elevated)]/65 py-16 sm:py-20"
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="min-w-0 lg:col-span-5">
            <Badge tone="green" className="mb-3">
              Student-Built · Fresh Daily
            </Badge>
            <h2
              id="kitchen-heading"
              className="font-serif text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl"
            >
              Small kitchen discipline. Everyday honest food.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)]">
              Started from a student kitchen with a simple promise: fresh
              ingredients, clear nutrition, and reliable delivery to your saved
              location.
            </p>
            <div className="mt-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 text-sm text-[var(--text-secondary)]">
              <p className="font-semibold text-[var(--text-primary)]">
                Service Area
              </p>
              <p className="mt-1">{settings.pickupLocation}</p>
              <p className="mt-2 font-semibold text-[var(--text-primary)]">
                Kitchen Hours
              </p>
              <p className="mt-1">{settings.serviceHours}</p>
            </div>
          </div>

          <div className="grid min-w-0 gap-5 sm:grid-cols-3 lg:col-span-7 lg:grid-cols-1">
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.step}
                  className="flex items-start gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-xs"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-accent-soft)] text-[var(--accent-primary)]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold tracking-wider text-[var(--accent-warm)]">
                        STEP {pillar.step}
                      </span>
                      <h3 className="font-serif text-lg font-semibold text-[var(--text-primary)]">
                        {pillar.title}
                      </h3>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)]">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
