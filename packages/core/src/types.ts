export interface ToolContext {
  /** Project root the tool operates on. */
  cwd: string;
  /** Tool-specific options from plugkit.config.json → "options"[toolId]. */
  options: Record<string, unknown>;
  log: (message: string) => void;
}

export interface ToolResult {
  summary: string;
  items?: Array<{ file?: string; line?: number; message: string }>;
}

export interface Tool {
  id: string;
  title: string;
  description?: string;
  run(ctx: ToolContext): Promise<ToolResult> | ToolResult;
}

export interface PlugkitConfig {
  /** Module specifiers (relative paths or package names) that export a Tool or Tool[]. */
  plugins?: string[];
  /** Per-tool options, keyed by tool id. */
  options?: Record<string, Record<string, unknown>>;
}
