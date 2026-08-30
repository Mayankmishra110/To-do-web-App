import { Hammer } from "lucide-react";
import { phase } from "@/lib/domain/roadmap";

/**
 * A screen that exists in the information architecture but has not been built.
 * Better than hiding the route: the shape of the product stays visible, and
 * nothing pretends to hold data it does not have.
 */
export function NotBuiltYet({ phase: n, what }: { phase: number; what: string }) {
  const p = phase(n);
  return (
    <div className="rounded-lg border border-dashed border-line bg-surface/40 px-5 py-10 text-center">
      <Hammer size={18} className="mx-auto text-ink-faint" aria-hidden />
      <p className="mt-3 text-sm text-ink">Not built yet</p>
      <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-ink-faint">
        {what}
      </p>
      <p className="mt-4 text-xs text-ink-faint">
        Phase {p.number} — {p.title}
      </p>
    </div>
  );
}
