import * as vscode from "vscode";
import { CommandEntry } from "./commandEntry";
import { toggleStreaming } from "../client01";
import { outputMessage } from "./text";

// Accessibility Commands
export const accessCommands: CommandEntry[] = [
	{
		name: "mind-reader.selectTheme",

		// callbacks can be inlined...
		callback: () =>
			vscode.commands.executeCommand("workbench.action.selectTheme"),
	},
	{
		name: "mind-reader.increaseFontScale",
		callback: increaseFontScale, // ...or factored out into separate functions below
	},

	{
		name: "mind-reader.decreaseFontScale",
		callback: decreaseFontScale,
	},

	{
		name: "mind-reader.resetFontScale",
		callback: resetFontScale,
	},

	{
		name: "mind-reader.increaseEditorScale",
		callback: increaseEditorScale,
	},

	{
		name: "mind-reader.decreaseEditorScale",
		callback: decreaseEditorScale,
	},

  {
    name: 'mind-reader.resetEditorScale',
    callback: resetEditorScale,
  },
  {
    name:'mind-reader.toggleStreaming',
    callback: toggleStreaming,
  },
];

function increaseFontScale(): void {
	vscode.commands.executeCommand("editor.action.fontZoomIn");
	outputMessage("Font Scale Increased.");
}

function decreaseFontScale(): void {
	vscode.commands.executeCommand("editor.action.fontZoomOut");
	outputMessage("Font Scale Decreased.");
}

function resetFontScale(): void {
	vscode.commands.executeCommand("editor.action.fontZoomReset");
	outputMessage("Font Scale Reset.");
}

function increaseEditorScale(): void {
	vscode.commands.executeCommand("workbench.action.zoomIn");
	outputMessage("Editor Scale Increased.");
}

function decreaseEditorScale(): void {
	vscode.commands.executeCommand("workbench.action.zoomOut");
	outputMessage("Editor Scale Decreased.");
}

function resetEditorScale(): void {
	vscode.commands.executeCommand("workbench.action.zoomReset");
	outputMessage("Editor Scale Reset.");
}
