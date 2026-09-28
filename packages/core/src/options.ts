import { OptionSchema, Tool } from "./types";

/** Merges declared defaults under supplied values, without mutating either. */
export function resolveOptions(tool: Tool, supplied: Record<string, unknown>): Record<string, unknown> {
  const schema = tool.optionsSchema;
  if (!schema) return { ...supplied };
  const resolved: Record<string, unknown> = { ...supplied };
  for (const [key, spec] of Object.entries(schema)) {
    if (resolved[key] === undefined && spec.default !== undefined) resolved[key] = spec.default;
  }
  return resolved;
}

function typeMatches(value: unknown, type: OptionSchema["type"]): boolean {
  if (type === "array") return Array.isArray(value);
  return typeof value === type;
}

/** Throws a descriptive error if `options` doesn't satisfy the tool's declared schema. */
export function validateOptions(tool: Tool, options: Record<string, unknown>): void {
  const schema = tool.optionsSchema;
  if (!schema) return;
  for (const [key, spec] of Object.entries(schema)) {
    const value = options[key];
    if (value === undefined) {
      if (spec.required) throw new Error(`Tool "${tool.id}": missing required option "${key}"`);
      continue;
    }
    if (!typeMatches(value, spec.type)) {
      throw new Error(`Tool "${tool.id}": option "${key}" must be a ${spec.type}, got ${typeof value}`);
    }
    if (spec.enum && !spec.enum.includes(value)) {
      throw new Error(`Tool "${tool.id}": option "${key}" must be one of ${spec.enum.join(", ")}, got ${JSON.stringify(value)}`);
    }
  }
}

/** Warns (via `log`) when a tool targets a different contract major version than the engine ships. */
export function checkContractVersion(tool: Tool, engineVersion: string, log: (m: string) => void): void {
  if (!tool.contractVersion) return;
  const [toolMajor] = tool.contractVersion.split(".");
  const [engineMajor] = engineVersion.split(".");
  if (toolMajor !== engineMajor) {
    log(
      `Warning: tool "${tool.id}" targets contract v${tool.contractVersion}, engine is v${engineVersion}. ` +
        `It may not behave correctly.`,
    );
  }
}
