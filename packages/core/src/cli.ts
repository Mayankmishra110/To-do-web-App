#!/usr/bin/env node
import { createReadlineInput } from "./input";
import { writeDefaultConfig } from "./config";
import { createPlugbase } from "./registry";

const USAGE = `Usage: plugbase <command>

  list          List available tools
  run <tool>    Run a tool in the current directory
  init          Create plugbase.config.json`;

async function main(argv: string[]): Promise<number> {
  const [cmd, arg] = argv;
  const cwd = process.cwd();
  switch (cmd) {
    case "list":
      for (const t of createPlugbase(cwd).list()) {
        console.log(`${t.id.padEnd(20)} [${(t.kind ?? "analyzer").padEnd(9)}] ${t.description ?? t.title}`);
      }
      return 0;
    case "run": {
      if (!arg) return fail("Missing tool id");
      const input = createReadlineInput();
      try {
        const result = await createPlugbase(cwd, console.error, input).run(arg);
        for (const it of result.items ?? []) {
          console.log(it.file ? `${it.file}${it.line ? `:${it.line}` : ""}  ${it.message}` : it.message);
        }
        for (const f of result.filesWritten ?? []) console.log(`wrote ${f}`);
        console.log(result.summary);
        return 0;
      } finally {
        input.close();
      }
    }
    case "init":
      console.log(`Created ${writeDefaultConfig(cwd)}`);
      return 0;
    default:
      console.log(USAGE);
      return cmd ? 1 : 0;
  }
}

function fail(msg: string): number {
  console.error(`${msg}\n\n${USAGE}`);
  return 1;
}

main(process.argv.slice(2)).then(
  (code) => process.exit(code),
  (err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  },
);
