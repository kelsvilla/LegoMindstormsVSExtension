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

let baseZoomLevel = vscode.workspace.getConfiguration("window").get<number>("zoomLevel") || 0;
let fontZoomLevel = 0;
let fontZoomBeforeReset = 0;

function increaseFontScale(): void {
	vscode.commands.executeCommand("editor.action.fontZoomIn");
	fontZoomLevel += 1;
	outputMessage("Font Scale Increased.");
}

function decreaseFontScale(): void {
	vscode.commands.executeCommand("editor.action.fontZoomOut");
	fontZoomLevel -= 1;
	outputMessage("Font Scale Decreased.");
}

function resetFontScale(): void {
	vscode.commands.executeCommand("editor.action.fontZoomReset");
	fontZoomBeforeReset = fontZoomLevel;
	fontZoomLevel = 0;
	outputMessage("Font Scale Reset.");
}

async function undoResetFontScale(): Promise<void> {
	if(fontZoomLevel > 0) {
		for(let i = 0; i < fontZoomLevel; i++) {
			vscode.commands.executeCommand("editor.action.fontZoomOut");
		}
	} else {
		for(let i = 0; i < Math.abs(fontZoomLevel); i++) {
			vscode.commands.executeCommand("editor.action.fontZoomIn");
		}
	}
	fontZoomLevel = 0;
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
