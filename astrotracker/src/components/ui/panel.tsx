import type { ReactNode } from "react";
import clsx from "clsx";

export function Panel({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={clsx("rounded-lg border border-line bg-surface", className)}
    >
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 border-b border-line-soft px-5 py-4">
          <div>
            {title && <h2 className="text-sm font-medium text-ink">{title}</h2>}
            {subtitle && (
              <p className="mt-1 text-xs text-ink-muted">{subtitle}</p>
            )}
          </div>
          {action}
        </header>
      )}
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-md border border-dashed border-line px-4 py-8 text-center">
      <p className="text-sm text-ink-muted">{title}</p>
      {description && (
        <p className="mx-auto mt-1 max-w-md text-xs text-ink-faint">{description}</p>
      )}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
