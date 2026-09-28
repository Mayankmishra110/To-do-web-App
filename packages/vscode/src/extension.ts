import * as path from "path";
import * as vscode from "vscode";
import { createPlugbase, writeDefaultConfig, ToolResult } from "plugbase";
import { createVscodeInput } from "./vscode-input";

let output: vscode.OutputChannel;
let diagnostics: vscode.DiagnosticCollection;

export function activate(context: vscode.ExtensionContext) {
  output = vscode.window.createOutputChannel("Plugbase");
  diagnostics = vscode.languages.createDiagnosticCollection("plugbase");

  context.subscriptions.push(
    output,
    diagnostics,
    vscode.commands.registerCommand("plugbase.runTool", runTool),
    vscode.commands.registerCommand("plugbase.init", initConfig),
    vscode.commands.registerCommand("plugbase.clear", () => diagnostics.clear()),
  );

  // Other extensions can reuse the engine: vscode.extensions.getExtension(...).exports
  return { createPlugbase };
}

export function deactivate() {}

async function pickWorkspaceRoot(): Promise<string | undefined> {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders?.length) {
    vscode.window.showErrorMessage("Plugbase: open a folder first.");
    return undefined;
  }
  if (folders.length === 1) return folders[0].uri.fsPath;
  return (await vscode.window.showWorkspaceFolderPick())?.uri.fsPath;
}

async function runTool() {
  const cwd = await pickWorkspaceRoot();
  if (!cwd) return;
  try {
    const kit = createPlugbase(cwd, (m) => output.appendLine(m), createVscodeInput());
    const picked = await vscode.window.showQuickPick(
      kit.list().map((t) => ({
        label: t.title,
        description: `${t.id} · ${t.kind ?? "analyzer"}`,
        detail: t.description,
        id: t.id,
      })),
      { placeHolder: "Select a Plugbase tool to run" },
    );
    if (!picked) return;
    const result = await vscode.window.withProgress(
      { location: vscode.ProgressLocation.Notification, title: `Plugbase: ${picked.label}` },
      () => kit.run(picked.id),
    );
    showResult(cwd, picked.id, result);
  } catch (err) {
    vscode.window.showErrorMessage(`Plugbase: ${err instanceof Error ? err.message : err}`);
  }
}

function showResult(cwd: string, toolId: string, result: ToolResult) {
  output.appendLine(`[${toolId}] ${result.summary}`);
  diagnostics.clear();
  const byFile = new Map<string, vscode.Diagnostic[]>();
  const severityMap: Record<string, vscode.DiagnosticSeverity> = {
    error: vscode.DiagnosticSeverity.Error,
    warning: vscode.DiagnosticSeverity.Warning,
    info: vscode.DiagnosticSeverity.Information,
  };

  for (const item of result.items ?? []) {
    output.appendLine(`  ${item.file ?? ""}${item.line ? `:${item.line}` : ""}  ${item.message}`);
    if (!item.file) continue;
    const line = Math.max((item.line ?? 1) - 1, 0);
    const severity = severityMap[item.severity ?? "info"];
    const d = new vscode.Diagnostic(new vscode.Range(line, 0, line, 0), item.message, severity);
    d.source = `plugbase:${toolId}`;
    const file = path.resolve(cwd, item.file);
    byFile.set(file, [...(byFile.get(file) ?? []), d]);
  }
  for (const [file, list] of byFile) diagnostics.set(vscode.Uri.file(file), list);

  for (const f of result.filesWritten ?? []) output.appendLine(`  wrote ${f}`);

  vscode.window.showInformationMessage(`Plugbase: ${result.summary}`, "Show Output").then((a) => a && output.show());
}

async function initConfig() {
  const cwd = await pickWorkspaceRoot();
  if (!cwd) return;
  try {
    const file = writeDefaultConfig(cwd);
    await vscode.window.showTextDocument(vscode.Uri.file(file));
  } catch (err) {
    vscode.window.showErrorMessage(`Plugbase: ${err instanceof Error ? err.message : err}`);
  }
}
