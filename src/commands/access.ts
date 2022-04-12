import * as vscode from 'vscode';
import { CommandEntry } from './commandEntry';
import { ConfigurationTarget, workspace} from 'vscode';
var highlightToggle = 0;
var color = "#14afc0";

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
  {
    name: 'mind-reader.highlightCurrentLine',
    callback: highlightCurrentLine,
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

async function highlightCurrentLine(){
const config = vscode.workspace.getConfiguration('workbench');
const config2 = config.get('colorCustomizations');
switch (highlightToggle) {
  case 0:
    config2["editor.lineHighlightBackground"] = color;
    await config.update('colorCustomizations', config2, ConfigurationTarget.Global, true);
    highlightToggle = 1;
    break;
  case 1:
    config2["editor.lineHighlightBackground"] = null;
    await config.update('colorCustomizations', config2, ConfigurationTarget.Global, true);
    highlightToggle = 0;
    break;
}
}
