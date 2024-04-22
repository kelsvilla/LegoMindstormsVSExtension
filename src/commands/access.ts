import * as vscode from "vscode";
import { CommandEntry } from "./commandEntry";
import { toggleStreaming } from "../client01";
import { outputMessage } from "./text";

let baseZoomLevel =
	vscode.workspace.getConfiguration("window").get<number>("zoomLevel") || 0;
let fontZoomLevel = 0;
let fontZoomBeforeReset = 0;

// Accessibility Commands
export const accessCommands: CommandEntry[] = [
	{
		name: "mind-reader.selectTheme",
		callback: () =>
			vscode.commands.executeCommand("workbench.action.selectTheme"),
	},
	{
		name: "mind-reader.increaseFontScale",
		callback: increaseFontScale,
		undo: decreaseFontScale,
	},
	{
		name: "mind-reader.decreaseFontScale",
		callback: decreaseFontScale,
		undo: increaseFontScale,
	},
	{
		name: "mind-reader.resetFontScale",
		callback: resetFontScale,
		undo: undoResetFontScale,
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
		name: "mind-reader.resetEditorScale",
		callback: resetEditorScale,
	},
	{
		name: "mind-reader.toggleStreaming",
		callback: toggleStreaming,
	},
];

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
	if (fontZoomBeforeReset > 0) {
		for (let i = 0; i < fontZoomBeforeReset; i++) {
			vscode.commands.executeCommand("editor.action.fontZoomOut");
		}
	} else {
		for (let i = 0; i < Math.abs(fontZoomBeforeReset); i++) {
			vscode.commands.executeCommand("editor.action.fontZoomIn");
		}
	}
	fontZoomLevel = fontZoomBeforeReset;
	outputMessage("Font Scale Restored.");
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
