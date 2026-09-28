import { CONTRACT_VERSION, Tool, ToolKind, ToolResult } from "../types";

const KINDS: ToolKind[] = ["analyzer", "generator", "action"];

function template(id: string, title: string, kind: ToolKind): string {
  return `module.exports = {
  id: ${JSON.stringify(id)},
  title: ${JSON.stringify(title)},
  kind: ${JSON.stringify(kind)},
  contractVersion: ${JSON.stringify(CONTRACT_VERSION)},
  run(ctx) {
    ctx.log("running ${id}");
    return { summary: "TODO: implement ${id}" };
  },
};
`;
}

/**
 * Sample generator: scaffolds a starter file for a new Plugbase tool. It
 * doubles as the contract's own smoke test — it exercises `ctx.input`
 * (three prompt shapes) and `ctx.writeFile` end to end.
 */
export const newTool: Tool = {
  id: "new-tool",
  title: "Scaffold a New Tool",
  description: "Generates a starter file for a new Plugbase tool",
  kind: "generator",
  contractVersion: CONTRACT_VERSION,
  optionsSchema: {
    id: { type: "string", description: "Tool id, kebab-case" },
  },
  async run(ctx): Promise<ToolResult> {
    const id = (ctx.options.id as string | undefined) ?? (await ctx.input.text("Tool id (kebab-case)", { default: "my-tool" }));
    if (!id) return { summary: "Cancelled: no tool id given" };
    if (!/^[a-z][a-z0-9-]*$/.test(id)) {
      return { summary: `Invalid tool id "${id}": use lowercase letters, digits and hyphens only` };
    }

    const title = (await ctx.input.text("Title", { default: id })) ?? id;
    const kind = ((await ctx.input.select("Kind", KINDS)) ?? "analyzer") as ToolKind;

    const relPath = `plugbase-tools/${id}.js`;
    ctx.writeFile(relPath, template(id, title, kind));
    return { summary: `Created ${relPath}. Add it to plugbase.config.json's "plugins" to load it.` };
  },
};
