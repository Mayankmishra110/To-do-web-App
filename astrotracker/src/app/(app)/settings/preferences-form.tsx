"use client";

import { useActionState } from "react";
import { savePreferences, type SaveState } from "@/server/actions/account";
import { Button } from "@/components/ui/button";
import { Field, FormError, Input } from "@/components/ui/field";

const initial: SaveState = { error: null, saved: false };

export function PreferencesForm({
  email,
  name,
  timezone,
  timezones,
}: {
  email: string;
  name: string;
  timezone: string;
  timezones: string[];
}) {
  const [state, formAction, pending] = useActionState(savePreferences, initial);

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Email" hint="Changing the sign-in email is not part of the MVP.">
        <Input value={email} readOnly disabled />
      </Field>
      <Field label="Name" htmlFor="name">
        <Input
          id="name"
          name="name"
          defaultValue={state.values?.name ?? name}
          maxLength={120}
        />
      </Field>
      <Field
        label="Timezone"
        htmlFor="timezone"
        hint="Decides when a day ends. Everything day-scoped is measured here."
      >
        <Input
          id="timezone"
          name="timezone"
          defaultValue={state.values?.timezone ?? timezone}
          list="timezones"
          required
        />
        <datalist id="timezones">
          {timezones.map((tz) => (
            <option key={tz} value={tz} />
          ))}
        </datalist>
      </Field>
      <FormError message={state.error} />
      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
        {state.saved && !state.error && (
          <span className="text-xs text-positive">Saved.</span>
        )}
      </div>
    </form>
  );
}
