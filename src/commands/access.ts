import * as vscode from 'vscode';
import { CommandEntry } from './commandEntry';

// Accessibility Commands
export const accessCommands: CommandEntry[] = [
  {
    name: 'mind-reader.selectTheme',

    // callbacks can be inlined...
    callback: () => vscode.commands.executeCommand('workbench.action.selectTheme'),
  },

  {
    name: 'mind-reader.increaseFontScale',
    callback: increaseFontScale, // ...or factored out into separate functions below
  },

  {
    name: 'mind-reader.decreaseFontScale',
    callback: decreaseFontScale,
  },

  {
    name: 'mind-reader.resetFontScale',
    callback: resetFontScale,
  },

  {
    name: 'mind-reader.increaseEditorScale',
    callback: increaseEditorScale,
  },

  {
    name: 'mind-reader.decreaseEditorScale',
    callback: decreaseEditorScale,
  },

  {
    name: 'mind-reader.resetEditorScale',
    callback: resetEditorScale,
  },
];


function increaseFontScale(): void {
  vscode.commands.executeCommand('editor.action.fontZoomIn');
}

function decreaseFontScale(): void {
  vscode.commands.executeCommand('editor.action.fontZoomOut');
}

function resetFontScale(): void {
  vscode.commands.executeCommand('editor.action.fontZoomReset');
}

function increaseEditorScale(): void {
  vscode.commands.executeCommand('workbench.action.zoomIn');
}

function decreaseEditorScale(): void {
  vscode.commands.executeCommand('workbench.action.zoomOut');
}

function resetEditorScale(): void {
  vscode.commands.executeCommand('workbench.action.zoomReset');
}

