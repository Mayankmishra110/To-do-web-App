const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { createPlugkit } = require("../dist");

function tmpProject(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "plugkit-"));
  for (const [name, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
    fs.writeFileSync(path.join(dir, name), content);
  }
  return dir;
}

test("todo-scan finds tags and skips node_modules", async () => {
  const dir = tmpProject({
    "a.js": "// TODO: fix this\nconst x = 1;\n// FIXME later",
    "node_modules/pkg/b.js": "// TODO ignored",
  });
  const res = await createPlugkit(dir).run("todo-scan");
  assert.deepStrictEqual(res.items.map((i) => `${i.file}:${i.line}`), ["a.js:1", "a.js:3"]);
});

test("loads project plugins and passes options", async () => {
  const dir = tmpProject({
    "my-tool.js": "module.exports = { id: 'hello', title: 'Hello', run: (ctx) => ({ summary: 'hi ' + ctx.options.name }) };",
    "plugkit.config.json": JSON.stringify({ plugins: ["./my-tool.js"], options: { hello: { name: "there" } } }),
  });
  const kit = createPlugkit(dir);
  assert.ok(kit.list().some((t) => t.id === "hello"));
  assert.strictEqual((await kit.run("hello")).summary, "hi there");
});

test("unknown tool gives a helpful error", async () => {
  await assert.rejects(createPlugkit(tmpProject({})).run("nope"), /Unknown tool "nope"/);
});
