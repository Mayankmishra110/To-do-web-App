# Plugkit

One tool engine, three ways to use it:

| Package | What it is | Install |
|---|---|---|
| `packages/core` → **`plugkit`** | Node library + `plugkit` CLI | `npm i -D plugkit` in any project |
| `packages/vscode` → **`plugkit-vscode`** | Extension for **Cursor** and VS Code | Install `plugkit.vsix` |

The domain is intentionally open. Tools are small modules; `todo-scan` ships as a sample.

## Use in a project (no editor needed)

```bash
npm i -D plugkit
npx plugkit init          # creates plugkit.config.json
npx plugkit list
npx plugkit run todo-scan
```

From code:

```js
const { createPlugkit } = require("plugkit");
const result = await createPlugkit(process.cwd()).run("todo-scan");
```

## Use in Cursor / VS Code

```bash
npm install
npm run package:vsix      # → packages/vscode/plugkit.vsix
```

Cursor: Command Palette → **Extensions: Install from VSIX…** → pick `plugkit.vsix`
(or `cursor --install-extension packages/vscode/plugkit.vsix`). VS Code works the same way (`code --install-extension …`).

Then run **Plugkit: Run Tool…**. Results appear in the Problems panel and the "Plugkit" output channel.

## Writing a tool

Add a module to your project and list it in `plugkit.config.json`. The CLI and the extension both pick it up.

```js
// tools/hello.js
module.exports = {
  id: "hello",
  title: "Say hello",
  run: (ctx) => ({ summary: `hello ${ctx.options.name}` }),
};
```

```json
{ "plugins": ["./tools/hello.js"], "options": { "hello": { "name": "world" } } }
```

A plugin can also be an npm package name. It can export one tool or an array of them.

## Develop

```bash
npm install
npm test                  # builds core + runs node:test suite
npm run build             # builds core and bundles the extension
```

Press F5 in `packages/vscode` (with a `launch.json` for an Extension Development Host) to debug the extension.
