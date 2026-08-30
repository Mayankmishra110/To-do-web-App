/**
 * The "DAY 1 — INTERNAL PATCHES" worksheet.
 *
 * This is a fixed structure the user writes into each day. It is stored on
 * DailyEntry.patches as JSON against the version below, so the worksheet can
 * change later without a migration and without rewriting old days: every entry
 * remembers the version it was written against.
 *
 * The MVP renders the template as-is. Nothing here is scored or interpreted.
 */

export const PATCH_TEMPLATE_VERSION = "day1-internal-patches@1";

export type PatchField = {
  key: string;
  label: string;
  /** Rendered under the label; never a motivational line, only instruction. */
  hint?: string;
  multiline?: boolean;
};

export type PatchSection = {
  key: string;
  title: string;
  fields: PatchField[];
};

export const PATCH_SECTIONS: PatchSection[] = [
  {
    key: "focus",
    title: "1. Focus",
    fields: [
      { key: "most_important_outcome", label: "One most important outcome for tomorrow" },
      { key: "will_not_do", label: "One thing I will deliberately NOT do" },
    ],
  },
  {
    key: "discipline",
    title: "2. Discipline",
    fields: [
      { key: "hard_task", label: "Hard task I will complete even if I don't feel like it" },
      { key: "start_time", label: "Start time" },
      { key: "minimum_commitment", label: "Minimum commitment (minutes)" },
    ],
  },
  {
    key: "execution",
    title: "3. Execution",
    fields: [
      { key: "postponed_task", label: "One idea/task I've been postponing" },
      { key: "first_physical_action", label: "First physical action" },
      { key: "deadline", label: "Deadline" },
    ],
  },
  {
    key: "emotional_control",
    title: "4. Emotional control",
    fields: [
      {
        key: "trigger_situation",
        label: "Situation where I may get irritated / anxious / impulsive",
        multiline: true,
      },
      {
        key: "response_rule",
        label: "My response rule",
        hint: "Default: Pause → identify → respond, don't react.",
        multiline: true,
      },
    ],
  },
  {
    key: "self_trust",
    title: "5. Self-trust",
    fields: [
      {
        key: "decision_without_validation",
        label: "One decision I will make without repeatedly seeking validation",
        multiline: true,
      },
      { key: "not_reopen_until", label: "Once decided, I will not reopen it until" },
    ],
  },
  {
    key: "comparison_ego",
    title: "6. Comparison / Ego",
    fields: [
      { key: "comparison_target", label: "Person/situation I tend to compare myself against" },
      { key: "comparison_metric_instead", label: "Today's comparison metric instead" },
    ],
  },
  {
    key: "character",
    title: "7. Character",
    fields: [
      { key: "quality", label: "One quality I want to embody" },
      { key: "observable_behavior", label: "One observable behaviour that proves I embodied it" },
    ],
  },
  {
    key: "night_review",
    title: "8. Night review — 10 minutes",
    fields: [
      { key: "said_id_do", label: "What did I say I'd do?", multiline: true },
      { key: "actually_did", label: "What did I actually do?", multiline: true },
      { key: "reacted_not_responded", label: "Where did I react instead of respond?", multiline: true },
      { key: "chose_discipline", label: "Where did I choose discipline over comfort?", multiline: true },
      { key: "patch_tomorrow", label: "What gets patched tomorrow?", multiline: true },
    ],
  },
];

export type PatchValues = Record<string, string>;

/** Flat list of every valid field key in the current template. */
export const PATCH_FIELD_KEYS: string[] = PATCH_SECTIONS.flatMap((section) =>
  section.fields.map((field) => `${section.key}.${field.key}`),
);

/** Reads stored JSON defensively: unknown shapes degrade to an empty sheet. */
export function readPatchValues(raw: unknown): PatchValues {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const values: PatchValues = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === "string") values[key] = value;
  }
  return values;
}
