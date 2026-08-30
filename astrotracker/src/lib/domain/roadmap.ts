/**
 * Build state of the MVP, in one place.
 *
 * The app tells the truth about what exists. Screens that are not built yet
 * say so and name the phase that will build them, instead of showing fake
 * data or dead buttons. Flip `done` as each phase lands.
 */
export type Phase = {
  number: number;
  title: string;
  done: boolean;
};

export const PHASES: Phase[] = [
  { number: 1, title: "Scaffolding, database, authentication", done: true },
  { number: 2, title: "Identity, goals, 90-day cycles", done: false },
  { number: 3, title: "Milestones and editable suggestions", done: false },
  { number: 4, title: "Today: tasks and habits", done: false },
  { number: 5, title: "Daily notes, reflection, self-assessment", done: false },
  { number: 6, title: "Progress calculation", done: false },
  { number: 7, title: "Weekly, biweekly, monthly reviews", done: false },
  { number: 8, title: "History and the 90-day review", done: false },
  { number: 9, title: "Polish and mobile", done: false },
];

export function phase(n: number): Phase {
  const found = PHASES.find((p) => p.number === n);
  if (!found) throw new Error(`Unknown phase ${n}`);
  return found;
}
