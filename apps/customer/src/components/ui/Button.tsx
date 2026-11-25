import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] shadow-sm active:scale-[0.98]",
  secondary:
    "bg-[var(--bg-accent-soft)] text-[var(--text-primary)] hover:bg-[#d5ebd9] border border-[var(--border-subtle)] active:scale-[0.98]",
  outline:
    "bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] active:scale-[0.98]",
  ghost:
    "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] active:scale-[0.98]",
  danger:
    "bg-[var(--danger)] text-white hover:bg-[#991b1b] shadow-sm active:scale-[0.98]",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3.5 text-sm gap-1.5",
  md: "min-h-11 px-5 text-sm font-semibold gap-2",
  lg: "min-h-12 px-6 text-base font-semibold gap-2.5",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex cursor-pointer items-center justify-center rounded-full font-medium transition-[transform,color,background-color,border-color,opacity] duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
