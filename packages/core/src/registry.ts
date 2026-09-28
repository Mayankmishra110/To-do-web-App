import * as path from "path";
import { loadConfig } from "./config";
import { createSandboxedWriter } from "./fs-sandbox";
import { nonInteractiveInput } from "./input";
import { checkContractVersion, resolveOptions, validateOptions } from "./options";
import { builtinTools } from "./tools";
import { CONTRACT_VERSION, Tool, ToolResult, UserInput } from "./types";

export class Plugbase {
  private tools = new Map<string, Tool>();

  constructor(
    readonly cwd: string,
    private log: (m: string) => void = () => {},
    private input: UserInput = nonInteractiveInput,
  ) {
    for (const t of builtinTools) this.register(t);
  }

  register(tool: Tool): void {
    if (!tool || typeof tool.id !== "string" || typeof tool.run !== "function") {
      throw new Error("A tool needs an `id` string and a `run` function");
    }
    checkContractVersion(tool, CONTRACT_VERSION, this.log);
    this.tools.set(tool.id, tool);
  }

  /** Loads plugins listed in the project's plugbase.config.json, resolved from the project root. */
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

  get(id: string): Tool | undefined {
    return this.tools.get(id);
  }

  async run(id: string): Promise<ToolResult> {
    const tool = this.tools.get(id);
    if (!tool) throw new Error(`Unknown tool "${id}". Available: ${[...this.tools.keys()].join(", ")}`);

    const cwd = path.resolve(this.cwd);
    const options = resolveOptions(tool, loadConfig(this.cwd).options?.[id] ?? {});
    validateOptions(tool, options);

    const { writeFile, written } = createSandboxedWriter(cwd);
    const result = await tool.run({ cwd, options, log: this.log, input: this.input, writeFile });
    const filesWritten = [...new Set([...(result.filesWritten ?? []), ...written])];
    return filesWritten.length ? { ...result, filesWritten } : result;
  }
}

export function createPlugbase(cwd = process.cwd(), log?: (m: string) => void, input?: UserInput): Plugbase {
  const kit = new Plugbase(cwd, log, input);
  kit.loadProjectPlugins();
  return kit;
}
