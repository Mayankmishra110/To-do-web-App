"use client";

import { useActionState } from "react";
import { saveIdentity, type SaveState } from "@/server/actions/identity";
import { Button } from "@/components/ui/button";
import { Field, FormError, Input, Textarea } from "@/components/ui/field";

const initial: SaveState = { error: null, saved: false };

export function IdentityForm({
  statement,
  description,
}: {
  statement: string;
  description: string;
}) {
  const [state, formAction, pending] = useActionState(saveIdentity, initial);

  return (
    <form action={formAction} className="space-y-4">
      <Field
        label="Statement"
        htmlFor="statement"
        hint="One sentence, present tense, in your own words."
      >
        <Input
          id="statement"
          name="statement"
          defaultValue={state.values?.statement ?? statement}
          maxLength={500}
          required
          placeholder="Become internally disciplined, emotionally stable, focused and capable of operating at my full potential."
        />
      </Field>
      <Field
        label="What this means in practice"
        htmlFor="description"
        hint="Optional. The behaviour that would prove it."
      >
        <Textarea
          id="description"
          name="description"
          defaultValue={state.values?.description ?? description}
          rows={4}
        />
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
