import * as readline from "readline";
import { UserInput } from "./types";

/**
 * Answers every prompt from its declared default (or a sane fallback) without
 * touching stdin. Used as the library default so `createPlugbase(...).run(...)`
 * works headlessly (tests, scripts, CI) even for tools that prompt.
 */
export const nonInteractiveInput: UserInput = {
  async text(_message, opts) {
    return opts?.default;
  },
  async select(_message, choices) {
    return choices[0];
  },
  async confirm(_message, opts) {
    return opts?.default ?? false;
  },
};

/** Interactive stdin/stdout prompts, used by the CLI. Call `.close()` when done with it. */
export function createReadlineInput(): UserInput & { close(): void } {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q: string) => new Promise<string>((resolve) => rl.question(q, resolve));

  return {
    async text(message, opts) {
      const suffix = opts?.default ? ` (${opts.default})` : "";
      const answer = await ask(`${message}${suffix}: `);
      return answer || opts?.default;
    },
    async select(message, choices) {
      const answer = (await ask(`${message} [${choices.join(" / ")}]: `)).trim();
      return choices.find((c) => c.toLowerCase() === answer.toLowerCase());
    },
    async confirm(message, opts) {
      const def = opts?.default ?? false;
      const answer = (await ask(`${message} (${def ? "Y/n" : "y/N"}): `)).trim().toLowerCase();
      if (!answer) return def;
      return answer.startsWith("y");
    },
    close() {
      rl.close();
    },
  };
}
