import type { ComponentProps } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-black hover:bg-accent/90",
  secondary: "border border-line bg-raised text-ink hover:border-ink-faint",
  ghost: "text-ink-muted hover:bg-raised hover:text-ink",
  danger: "border border-line text-negative hover:border-negative",
};

export function Button({
  variant = "secondary",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={clsx(base, variants[variant], className)} {...props} />;
}

export const buttonClass = (variant: Variant = "secondary", className?: string) =>
  clsx(base, variants[variant], className);
