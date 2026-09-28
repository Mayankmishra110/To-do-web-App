import * as path from "path";
import { loadConfig } from "./config";
import { builtinTools } from "./tools";
import { Tool, ToolResult } from "./types";

export class Plugkit {
  private tools = new Map<string, Tool>();

  constructor(readonly cwd: string, private log: (m: string) => void = () => {}) {
    for (const t of builtinTools) this.register(t);
  }

  register(tool: Tool): void {
    if (!tool || typeof tool.id !== "string" || typeof tool.run !== "function") {
      throw new Error("A tool needs an `id` string and a `run` function");
    }
    this.tools.set(tool.id, tool);
  }

  /** Load plugins listed in the project's plugkit.config.json, resolved from the project root. */
  loadProjectPlugins(): string[] {
    const { plugins = [] } = loadConfig(this.cwd);
    const loaded: string[] = [];
    for (const spec of plugins) {
      const resolved = require.resolve(spec, { paths: [this.cwd] });
      const mod = require(resolved);
      const exported = mod.default ?? mod;
      for (const tool of Array.isArray(exported) ? exported : [exported]) {
        this.register(tool);
        loaded.push(tool.id);
      }
    }
    return loaded;
  }

  list(): Tool[] {
    return [...this.tools.values()];
  }

  async run(id: string): Promise<ToolResult> {
    const tool = this.tools.get(id);
    if (!tool) throw new Error(`Unknown tool "${id}". Available: ${[...this.tools.keys()].join(", ")}`);
    const options = loadConfig(this.cwd).options?.[id] ?? {};
    return tool.run({ cwd: path.resolve(this.cwd), options, log: this.log });
  }
}

export function createPlugkit(cwd = process.cwd(), log?: (m: string) => void): Plugkit {
  const kit = new Plugkit(cwd, log);
  kit.loadProjectPlugins();
  return kit;
}
