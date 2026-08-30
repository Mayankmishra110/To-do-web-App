import { cache } from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { readSession } from "./session";

export type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
  timezone: string;
};

/**
 * The signed-in user, or null. Cached per request so the layout and the page
 * that renders inside it share a single query.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await readSession();
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.sub },
    select: { id: true, email: true, name: true, timezone: true, sessionVersion: true },
  });
  if (!user || user.sessionVersion !== session.v) return null;

  return { id: user.id, email: user.email, name: user.name, timezone: user.timezone };
});

/** Use in every protected page, layout and server action. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
