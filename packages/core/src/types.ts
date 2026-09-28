/**
 * The Plugbase plugin contract.
 *
 * Bump the major version when you make a breaking change to any interface a
 * tool author or engine consumer (CLI, editor extension) relies on. Tools can
 * declare `contractVersion` and the engine warns on a major mismatch instead
 * of failing in some harder-to-diagnose way later.
 */
export const CONTRACT_VERSION = "1.0.0";

export type ToolKind = "analyzer" | "generator" | "action";

export type OptionType = "string" | "number" | "boolean" | "array";

export interface OptionSchema {
  type: OptionType;
  description?: string;
  default?: unknown;
  required?: boolean;
  enum?: unknown[];
}

/**
 * How a tool asks the person running it a question. The CLI answers with
 * stdin prompts; the editor extension answers with its own input boxes and
 * quick picks. A tool written once against this interface behaves correctly
 * in both places without knowing which one it's running in.
 */
export interface UserInput {
  /** Free-text prompt. Resolves to `opts.default` (or undefined) if the caller cancels. */
  text(message: string, opts?: { placeholder?: string; default?: string }): Promise<string | undefined>;
  /** Single choice from a fixed list. Resolves to undefined if the caller cancels. */
  select(message: string, choices: string[]): Promise<string | undefined>;
  /** Yes/no confirmation. */
  confirm(message: string, opts?: { default?: boolean }): Promise<boolean>;
}

export interface ToolContext {
  /** Project root the tool operates on. */
  cwd: string;
  /** Resolved options: config file values merged with each option's declared default. */
  options: Record<string, unknown>;
  log: (message: string) => void;
  input: UserInput;
  /**
   * Write a file relative to `cwd`, creating parent directories as needed.
   * Generators use this instead of `fs` directly: the engine tracks what was
   * written (surfaced on `ToolResult.filesWritten`) and rejects paths that
   * escape the project root.
   */
  writeFile: (relativePath: string, content: string) => void;
}

export interface ResultItem {
  file?: string;
  line?: number;
  message: string;
  severity?: "info" | "warning" | "error";
}

export interface ToolResult {
  summary: string;
  items?: ResultItem[];
  /** Populated automatically from `ctx.writeFile` calls; a tool may add more of its own. */
  filesWritten?: string[];
}

export interface Tool {
  id: string;
  title: string;
  description?: string;
  /** Defaults to "analyzer" — a tool that reports on the project without changing it. */
  kind?: ToolKind;
  /** Contract version this tool was written against, e.g. "1.0.0". */
  contractVersion?: string;
  /** Declared options, used to validate config values and apply defaults before `run`. */
  optionsSchema?: Record<string, OptionSchema>;
  run(ctx: ToolContext): Promise<ToolResult> | ToolResult;
}

export interface PlugbaseConfig {
  /** Module specifiers (relative paths or package names) that export a Tool or Tool[]. */
  plugins?: string[];
  /** Per-tool options, keyed by tool id. */
  options?: Record<string, Record<string, unknown>>;
}
