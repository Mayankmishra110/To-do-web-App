"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guard";

export type IdentityValues = { statement: string; description: string };

/**
 * `values` is echoed back because React 19 resets an uncontrolled form once the
 * action resolves — without it, a rejected edit would wipe what was written.
 */
export type SaveState = {
  error: string | null;
  saved: boolean;
  values?: IdentityValues;
};

const identitySchema = z.object({
  statement: z
    .string()
    .trim()
    .min(10, "Say it in a full sentence — at least 10 characters.")
    .max(500),
  description: z.string().trim().max(4000).optional(),
});

/**
 * Creates or updates the active north star. An edit keeps the previous wording
 * as a revision, so a 90-day review can show what you said at the start.
 */
export async function saveIdentity(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const user = await requireUser();

  const values: IdentityValues = {
    statement: String(formData.get("statement") ?? ""),
    description: String(formData.get("description") ?? ""),
  };
  const parsed = identitySchema.safeParse(values);

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
      saved: false,
      values,
    };
  }

  const { statement, description } = parsed.data;
  const existing = await db.identity.findFirst({
    where: { userId: user.id, isActive: true },
    orderBy: { createdAt: "desc" },
  });

  if (!existing) {
    await db.identity.create({
      data: { userId: user.id, statement, description: description || null },
    });
  } else if (
    existing.statement !== statement ||
    (existing.description ?? "") !== (description ?? "")
  ) {
    await db.$transaction([
      db.identityRevision.create({
        data: {
          identityId: existing.id,
          statement: existing.statement,
          description: existing.description,
        },
      }),
      db.identity.update({
        where: { id: existing.id },
        data: { statement, description: description || null },
      }),
    ]);
  }

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  return { error: null, saved: true, values: { statement, description: description ?? "" } };
}
