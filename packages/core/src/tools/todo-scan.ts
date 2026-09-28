import * as fs from "fs";
import * as path from "path";
import { CONTRACT_VERSION, Tool, ToolResult } from "../types";

const IGNORED_DIRS = new Set(["node_modules", ".git", "dist", "out", "build", ".next"]);
const MAX_FILE_BYTES = 1024 * 1024;

function* walk(dir: string): Generator<string> {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) yield* walk(path.join(dir, entry.name));
    } else if (entry.isFile()) {
      yield path.join(dir, entry.name);
    }
  }
}

/** Sample analyzer: finds TODO/FIXME-style comments across the project. */
export const todoScan: Tool = {
  id: "todo-scan",
  title: "Scan for TODOs",
  description: "List TODO / FIXME comments in the project",
  kind: "analyzer",
  contractVersion: CONTRACT_VERSION,
  optionsSchema: {
    tags: { type: "array", description: "Comment tags to look for", default: ["TODO", "FIXME"] },
  },
  run(ctx): ToolResult {
    const tags = ctx.options.tags as string[];
    const pattern = new RegExp(`(?://|#|/\\*|<!--|^\\s*\\*)\\s*(${tags.join("|")})\\b[:\\s]*(.*)`);
    const items: NonNullable<ToolResult["items"]> = [];
    for (const file of walk(ctx.cwd)) {
      if (fs.statSync(file).size > MAX_FILE_BYTES) continue;
      const text = fs.readFileSync(file, "utf8");
      if (text.includes("\u0000")) continue; // binary
      text.split(/\r?\n/).forEach((line, i) => {
        const m = pattern.exec(line);
        if (m) items.push({ file: path.relative(ctx.cwd, file), line: i + 1, message: `${m[1]}: ${m[2].trim()}`, severity: "info" });
      });
    }
    return { summary: `Found ${items.length} item(s)`, items };
  },
};
