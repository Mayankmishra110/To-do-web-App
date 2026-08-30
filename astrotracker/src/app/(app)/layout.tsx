import Link from "next/link";
import { LogOut } from "lucide-react";
import { requireUser } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { logout } from "@/server/actions/auth";
import { AppNav, NorthStarBadge } from "@/components/app-nav";
import { todayIn, formatDay } from "@/lib/date";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const identity = await db.identity.findFirst({
    where: { userId: user.id, isActive: true },
    orderBy: { createdAt: "desc" },
    select: { statement: true },
  });
  const today = todayIn(user.timezone);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col gap-6 px-4 py-5 lg:flex-row lg:gap-8 lg:px-8">
      <aside className="lg:sticky lg:top-5 lg:h-fit lg:w-60 lg:shrink-0">
        <div className="flex items-baseline justify-between lg:block">
          <Link href="/dashboard" className="text-sm font-semibold tracking-tight">
            Astro<span className="text-accent">Tracker</span>
          </Link>
          <p className="text-xs text-ink-faint lg:mt-1">{formatDay(today, "short")}</p>
        </div>

        <div className="mt-4 lg:mt-6">
          <AppNav />
        </div>

        <div className="mt-4 hidden lg:block">
          <NorthStarBadge statement={identity?.statement ?? null} />
        </div>

        <form action={logout} className="mt-2 lg:mt-4">
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-ink-faint transition-colors hover:bg-raised hover:text-ink"
          >
            <LogOut size={16} aria-hidden />
            Sign out
          </button>
        </form>
      </aside>

      <main className="min-w-0 flex-1 pb-16">{children}</main>
    </div>
  );
}
