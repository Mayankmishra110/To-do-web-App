"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/**
 * Anything that throws inside the app shell lands here — most often a database
 * that is unreachable. Say that plainly instead of showing a blank screen.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="rounded-lg border border-negative/40 bg-surface px-5 py-8">
      <h1 className="text-sm font-medium text-ink">Something failed to load</h1>
      <p className="mt-2 max-w-lg text-sm text-ink-muted">
        Usually this means the database is unreachable. Check that DATABASE_URL is
        correct and the database is running, then try again.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-ink-faint">ref {error.digest}</p>
      )}
      <Button className="mt-5" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
