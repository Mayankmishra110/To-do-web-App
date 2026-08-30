"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guard";

export type PreferenceValues = { name: string; timezone: string };

/** `values` is echoed back for the same reason as elsewhere: React 19 resets
 * an uncontrolled form as soon as its action resolves. */
export type SaveState = {
  error: string | null;
  saved: boolean;
  values?: PreferenceValues;
};

const preferencesSchema = z.object({
  name: z.string().trim().max(120).optional(),
  timezone: z.string().trim().min(1, "Pick a timezone."),
});

export async function savePreferences(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const user = await requireUser();

  const values: PreferenceValues = {
    name: String(formData.get("name") ?? ""),
    timezone: String(formData.get("timezone") ?? ""),
  };
  const parsed = preferencesSchema.safeParse(values);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
      saved: false,
      values,
    };
  }

  // The timezone decides where every day boundary falls, so reject anything
  // the runtime cannot actually resolve.
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: parsed.data.timezone });
  } catch {
    return {
      error: `"${parsed.data.timezone}" is not a valid IANA timezone.`,
      saved: false,
      values,
    };
  }

  await db.user.update({
    where: { id: user.id },
    data: { name: parsed.data.name || null, timezone: parsed.data.timezone },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { error: null, saved: true, values };
}
