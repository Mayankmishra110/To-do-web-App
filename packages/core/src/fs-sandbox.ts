import * as fs from "fs";
import * as path from "path";

/**
 * Builds the `writeFile` a tool receives on its context. Every write is
 * confined to `cwd` — a tool can't be tricked (by a bad option or a bug)
 * into writing outside the project it was invoked on — and each written
 * path is recorded so the engine can report `filesWritten` even if the tool
 * itself forgets to.
 */
export function createSandboxedWriter(cwd: string): { writeFile: (rel: string, content: string) => void; written: string[] } {
  const root = path.resolve(cwd);
  const written: string[] = [];
  const writeFile = (rel: string, content: string) => {
    const abs = path.resolve(root, rel);
    if (abs !== root && !abs.startsWith(root + path.sep)) {
      throw new Error(`writeFile: "${rel}" resolves outside the project root`);
    }
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content);
    written.push(path.relative(root, abs));
  };
  return { writeFile, written };
}
