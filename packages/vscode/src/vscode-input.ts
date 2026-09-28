import * as vscode from "vscode";
import { UserInput } from "plugbase";

/** Answers a tool's prompts with VS Code / Cursor's native input box and quick pick UI. */
export function createVscodeInput(): UserInput {
  return {
    async text(message, opts) {
      return vscode.window.showInputBox({ prompt: message, placeHolder: opts?.placeholder, value: opts?.default });
    },
    async select(message, choices) {
      return vscode.window.showQuickPick(choices, { placeHolder: message });
    },
    async confirm(message, opts) {
      const yes = "Yes";
      const no = "No";
      const picked = await vscode.window.showQuickPick([yes, no], { placeHolder: message });
      if (!picked) return opts?.default ?? false;
      return picked === yes;
    },
  };
}
