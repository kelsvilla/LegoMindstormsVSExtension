import * as vscode from "vscode";
import { CommandEntry } from "./commandEntry";
import { startStreaming } from "../client01";

// Accessibility Commands
export const accessCommands: CommandEntry[] = [
	{
		name: "mind-reader.selectTheme",
		execute: () =>
			vscode.commands.executeCommand("workbench.action.selectTheme"),
		undo: () => {},
	},
	{
		name: "mind-reader.increaseFontScale",
		execute: increaseFontScale,
		undo: () => {},
	},
	{
		name: "mind-reader.decreaseFontScale",
		execute: decreaseFontScale,
		undo: () => {},
	},
	{
		name: "mind-reader.resetFontScale",
		execute: resetFontScale,
		undo: () => {},
	},
	{
		name: "mind-reader.increaseEditorScale",
		execute: increaseEditorScale,
		undo: () => {},
	},
	{
		name: "mind-reader.decreaseEditorScale",
		execute: decreaseEditorScale,
		undo: () => {},
	},
	{
		name: "mind-reader.resetEditorScale",
		execute: resetEditorScale,
		undo: () => {},
	},
	{
		name: "mind-reader.startStreaming",
		execute: startStreaming,
		undo: () => {},
	},
];

function increaseFontScale(): void {
	vscode.commands.executeCommand("editor.action.fontZoomIn");
}

function decreaseFontScale(): void {
	vscode.commands.executeCommand("editor.action.fontZoomOut");
}

function resetFontScale(): void {
	vscode.commands.executeCommand("editor.action.fontZoomReset");
}

function increaseEditorScale(): void {
	vscode.commands.executeCommand("workbench.action.zoomIn");
}

function decreaseEditorScale(): void {
	vscode.commands.executeCommand("workbench.action.zoomOut");
}

function resetEditorScale(): void {
	vscode.commands.executeCommand("workbench.action.zoomReset");
}
