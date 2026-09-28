import * as fs from "fs";
import * as path from "path";
import { PlugkitConfig } from "./types";

export const CONFIG_FILE = "plugkit.config.json";

export function loadConfig(cwd: string): PlugkitConfig {
  const file = path.join(cwd, CONFIG_FILE);
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (err) {
    throw new Error(`Invalid ${CONFIG_FILE}: ${(err as Error).message}`);
  }
}

export function writeDefaultConfig(cwd: string): string {
  const file = path.join(cwd, CONFIG_FILE);
  if (fs.existsSync(file)) throw new Error(`${CONFIG_FILE} already exists`);
  const config: PlugkitConfig = { plugins: [], options: { "todo-scan": { tags: ["TODO", "FIXME"] } } };
  fs.writeFileSync(file, JSON.stringify(config, null, 2) + "\n");
  return file;
}
