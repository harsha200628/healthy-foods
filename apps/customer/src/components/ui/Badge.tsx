import type { ReactNode } from "react";

type BadgeTone = "neutral" | "green" | "warm" | "danger";

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral:
    "bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)]",
  green:
    "bg-[var(--bg-accent-soft)] text-[var(--accent-primary)] border-[#c4e3cc]",
  warm: "bg-[var(--accent-warm-soft)] text-[var(--accent-warm)] border-[#fde68a]",
  danger: "bg-[#fee2e2] text-[var(--danger)] border-[#fecaca]",
};

export function Badge({
  tone = "neutral",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide ${TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
