"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";

/**
 * React 19 resets an uncontrolled form once its action resolves, so anything
 * the user typed has to be handed back here or it disappears on every failed
 * attempt. The password is deliberately not returned.
 */
export type ActionState = { error: string | null; email?: string };

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export async function login(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const parsed = loginSchema.safeParse({
    email,
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return { error: "Enter a valid email address and your password.", email };
  }

  let user;
  try {
    user = await db.user.findUnique({ where: { email: parsed.data.email } });
  } catch (error) {
    console.error("login: database unreachable", error);
    return {
      error: "Cannot reach the database. Check DATABASE_URL, then try again.",
      email,
    };
  }

  const ok = user ? await verifyPassword(parsed.data.password, user.passwordHash) : false;

  if (!user || !ok) {
    // Same message either way: no account enumeration.
    return { error: "Incorrect email or password.", email };
  }

  await createSession({ sub: user.id, v: user.sessionVersion });
  // redirect() throws by design; it must not sit inside a try/catch.
  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/login");
}
