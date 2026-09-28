const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { createPlugbase, Plugbase } = require("../dist");

function tmpProject(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "plugbase-"));
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
  const res = await createPlugbase(dir).run("todo-scan");
  assert.deepStrictEqual(res.items.map((i) => `${i.file}:${i.line}`), ["a.js:1", "a.js:3"]);
});

test("loads project plugins and passes resolved options", async () => {
  const dir = tmpProject({
    "my-tool.js": "module.exports = { id: 'hello', title: 'Hello', run: (ctx) => ({ summary: 'hi ' + ctx.options.name }) };",
    "plugbase.config.json": JSON.stringify({ plugins: ["./my-tool.js"], options: { hello: { name: "there" } } }),
  });
  const kit = createPlugbase(dir);
  assert.ok(kit.list().some((t) => t.id === "hello"));
  assert.strictEqual((await kit.run("hello")).summary, "hi there");
});

test("unknown tool gives a helpful error", async () => {
  await assert.rejects(createPlugbase(tmpProject({})).run("nope"), /Unknown tool "nope"/);
});

test("required option missing throws before run", async () => {
  const kit = new Plugbase(tmpProject({}));
  kit.register({
    id: "needs-opt",
    title: "Needs option",
    optionsSchema: { name: { type: "string", required: true } },
    run: () => ({ summary: "ok" }),
  });
  await assert.rejects(kit.run("needs-opt"), /missing required option "name"/);
});

test("option type mismatch throws", async () => {
  const kit = new Plugbase(tmpProject({ "plugbase.config.json": JSON.stringify({ options: { typed: { count: "nope" } } }) }));
  kit.register({
    id: "typed",
    title: "Typed",
    optionsSchema: { count: { type: "number" } },
    run: () => ({ summary: "ok" }),
  });
  await assert.rejects(kit.run("typed"), /option "count" must be a number/);
});

test("declared defaults are applied when config omits the option", async () => {
  const kit = new Plugbase(tmpProject({}));
  kit.register({
    id: "defaulted",
    title: "Defaulted",
    optionsSchema: { greeting: { type: "string", default: "hi" } },
    run: (ctx) => ({ summary: ctx.options.greeting }),
  });
  assert.strictEqual((await kit.run("defaulted")).summary, "hi");
});

test("a tool targeting a different contract major logs a warning", () => {
  const logs = [];
  const kit = new Plugbase(tmpProject({}), (m) => logs.push(m));
  kit.register({ id: "old", title: "Old", contractVersion: "0.1.0", run: () => ({ summary: "ok" }) });
  assert.ok(logs.some((m) => m.includes('tool "old" targets contract v0.1.0')));
});

test("writeFile writes relative to cwd and is reported on filesWritten", async () => {
  const dir = tmpProject({});
  const kit = new Plugbase(dir);
  kit.register({
    id: "writer",
    title: "Writer",
    kind: "generator",
    run: (ctx) => {
      ctx.writeFile("out/hello.txt", "hi");
      return { summary: "wrote it" };
    },
  });
  const result = await kit.run("writer");
  assert.deepStrictEqual(result.filesWritten, [path.join("out", "hello.txt")]);
  assert.strictEqual(fs.readFileSync(path.join(dir, "out", "hello.txt"), "utf8"), "hi");
});

test("writeFile rejects a path that escapes the project root", async () => {
  const kit = new Plugbase(tmpProject({}));
  kit.register({
    id: "escapee",
    title: "Escapee",
    run: (ctx) => {
      ctx.writeFile("../outside.txt", "nope");
      return { summary: "should not get here" };
    },
  });
  await assert.rejects(kit.run("escapee"), /resolves outside the project root/);
});

test("new-tool generator drives ctx.input and writes a scaffold file", async () => {
  const dir = tmpProject({});
  const answers = { text: ["cool-tool", "Cool Tool"], select: ["generator"] };
  const fakeInput = {
    text: async () => answers.text.shift(),
    select: async () => answers.select.shift(),
    confirm: async (_m, opts) => opts?.default ?? false,
  };
  const kit = new Plugbase(dir, () => {}, fakeInput);
  const result = await kit.run("new-tool");
  assert.strictEqual(result.filesWritten[0], path.join("plugbase-tools", "cool-tool.js"));
  const written = fs.readFileSync(path.join(dir, "plugbase-tools", "cool-tool.js"), "utf8");
  assert.match(written, /id: "cool-tool"/);
  assert.match(written, /kind: "generator"/);
});

test("new-tool rejects an invalid id", async () => {
  const kit = new Plugbase(tmpProject({}), () => {}, {
    text: async () => "Not Valid!",
    select: async () => "analyzer",
    confirm: async () => false,
  });
  const result = await kit.run("new-tool");
  assert.match(result.summary, /Invalid tool id/);
});
