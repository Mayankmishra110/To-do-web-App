"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  CalendarDays,
  Compass,
  Flag,
  History,
  LayoutDashboard,
  LineChart,
  Settings,
  Target,
} from "lucide-react";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/today", label: "Today", icon: CalendarDays },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/milestones", label: "Milestones", icon: Flag },
  { href: "/reviews", label: "Reviews", icon: LineChart },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-raised text-ink"
                : "text-ink-muted hover:bg-raised/60 hover:text-ink",
            )}
          >
            <Icon
              size={16}
              className={active ? "text-accent" : "text-ink-faint"}
              aria-hidden
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function NorthStarBadge({ statement }: { statement: string | null }) {
  return (
    <div className="rounded-md border border-line-soft bg-canvas px-3 py-2.5">
      <p className="label-caps flex items-center gap-1.5">
        <Compass size={12} aria-hidden /> North star
      </p>
      <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
        {statement ?? "Not defined yet."}
      </p>
    </div>
  );
}
