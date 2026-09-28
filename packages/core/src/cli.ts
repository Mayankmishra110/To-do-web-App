#!/usr/bin/env node
import { createPlugkit } from "./registry";
import { writeDefaultConfig } from "./config";

const USAGE = `Usage: plugkit <command>

  list          List available tools
  run <tool>    Run a tool in the current directory
  init          Create plugkit.config.json`;

async function main(argv: string[]): Promise<number> {
  const [cmd, arg] = argv;
  const cwd = process.cwd();
  switch (cmd) {
    case "list":
      for (const t of createPlugkit(cwd).list()) console.log(`${t.id.padEnd(20)} ${t.description ?? t.title}`);
      return 0;
    case "run": {
      if (!arg) return fail("Missing tool id");
      const result = await createPlugkit(cwd, console.error).run(arg);
      for (const it of result.items ?? []) {
        console.log(it.file ? `${it.file}${it.line ? `:${it.line}` : ""}  ${it.message}` : it.message);
      }
      console.log(result.summary);
      return 0;
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
