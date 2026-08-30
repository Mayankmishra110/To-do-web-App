import Link from "next/link";
import { ArrowRight, Check, Circle } from "lucide-react";
import { requireUser } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { formatDay, todayIn } from "@/lib/date";
import { PHASES } from "@/lib/domain/roadmap";
import { PageHeader } from "@/components/page-header";
import { EmptyState, Panel } from "@/components/ui/panel";
import { buttonClass } from "@/components/ui/button";

export default async function DashboardPage() {
  const user = await requireUser();
  const identity = await db.identity.findFirst({
    where: { userId: user.id, isActive: true },
    orderBy: { createdAt: "desc" },
  });
  const today = todayIn(user.timezone);

  return (
    <>
      <PageHeader
        eyebrow={formatDay(today)}
        title={user.name ? `Good to see you, ${user.name}.` : "Dashboard"}
        description="Who you are becoming, what you are working toward, and what today is for."
      />

      <div className="space-y-5">
        <Panel
          title="Identity"
          subtitle="The deepest layer. Everything below it exists to serve this."
          action={
            <Link href="/settings" className={buttonClass("ghost", "text-xs")}>
              Edit
            </Link>
          }
        >
          {identity ? (
            <div>
              <p className="text-base leading-relaxed text-ink">{identity.statement}</p>
              {identity.description && (
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  {identity.description}
                </p>
              )}
            </div>
          ) : (
            <EmptyState
              title="No north star defined."
              description="One sentence: who are you trying to become? Everything else in AstroTracker hangs off it."
              action={
                <Link href="/settings" className={buttonClass("primary", "text-xs")}>
                  Define it <ArrowRight size={14} aria-hidden />
                </Link>
              }
            />
          )}
        </Panel>

        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="Current 90-day cycle">
            <EmptyState
              title="No cycle yet."
              description="Cycles arrive in phase 2, together with goals."
            />
          </Panel>
          <Panel title="Today">
            <EmptyState
              title="Nothing planned."
              description="Focus, actions and habits arrive in phase 4."
            />
          </Panel>
        </div>

        <Panel
          title="Build status"
          subtitle="This app is being built in vertical slices. Nothing here is faked."
        >
          <ul className="space-y-2">
            {PHASES.map((p) => (
              <li key={p.number} className="flex items-center gap-2.5 text-sm">
                {p.done ? (
                  <Check size={14} className="shrink-0 text-positive" aria-hidden />
                ) : (
                  <Circle size={14} className="shrink-0 text-ink-faint" aria-hidden />
                )}
                <span className={p.done ? "text-ink-muted" : "text-ink-faint"}>
                  Phase {p.number} — {p.title}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
