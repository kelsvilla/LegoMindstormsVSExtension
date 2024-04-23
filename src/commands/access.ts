import * as vscode from "vscode";
import { CommandEntry } from "./commandEntry";
import { outputMessage } from "./text";

let baseZoomLevel =
	vscode.workspace.getConfiguration("window").get<number>("zoomLevel") || 0;
let editorZoomLevel = baseZoomLevel;
let editorZoomBeforeReset = 0;
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
		undo: decreaseEditorScale,
	},
	{
		name: "mind-reader.decreaseEditorScale",
		callback: decreaseEditorScale,
		undo: increaseEditorScale,
	},
	{
		name: "mind-reader.resetEditorScale",
		callback: resetEditorScale,
		undo: undoResetEditorScale,
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

function undoResetFontScale(): void {
	//Positive value means it was zoomed in. Restore that.
	if (fontZoomBeforeReset > 0) {
		for (let i = 0; i < fontZoomBeforeReset; i++) {
			vscode.commands.executeCommand("editor.action.fontZoomIn");
		}
	} else { //Negative value means it was zoomed out.
		for (let i = 0; i < Math.abs(fontZoomBeforeReset); i++) {
			vscode.commands.executeCommand("editor.action.fontZoomOut");
		}
	}
	fontZoomLevel = fontZoomBeforeReset;
	outputMessage("Font Scale Restored.");
}

function increaseEditorScale(): void {
	vscode.commands.executeCommand("workbench.action.zoomIn");
	editorZoomLevel += 1;
	outputMessage("Editor Scale Increased.");
	console.log("Editor Zoom Level: " + editorZoomLevel);
}

function decreaseEditorScale(): void {
	vscode.commands.executeCommand("workbench.action.zoomOut");
	editorZoomLevel -= 1;
	outputMessage("Editor Scale Decreased.");
	console.log("Editor Zoom Level: " + editorZoomLevel);
}

function resetEditorScale(): void {
	vscode.commands.executeCommand("workbench.action.zoomReset");
	editorZoomBeforeReset = editorZoomLevel;
	editorZoomLevel = baseZoomLevel;
	outputMessage("Editor Scale Reset.");
	console.log("Editor Zoom Level: " + editorZoomLevel);
}

function undoResetEditorScale(): void {
	for(let i = 0; i < Math.abs(editorZoomBeforeReset - editorZoomLevel); i++) {
		if(editorZoomBeforeReset > editorZoomLevel) {
			vscode.commands.executeCommand("workbench.action.zoomIn");
		} else {
			vscode.commands.executeCommand("workbench.action.zoomOut");
		}
	}
	editorZoomLevel = editorZoomBeforeReset;
	editorZoomBeforeReset = baseZoomLevel;
	outputMessage("Editor Scale Restored.");
}