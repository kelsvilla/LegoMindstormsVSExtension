import * as vscode from 'vscode';
import * as fs from 'fs';

import { CommandEntry } from './commandEntry';

export const navCommands: CommandEntry[] = [
  {
    name: 'mind-reader.openWebview',
    callback: openWebview,
  },

  {
    name: 'mind-reader.openKeyBindWin',
    callback: () => openKeyBindWin('Windows')
  },
  {
    name: 'mind-reader.openKeyBindMac',
    callback: () => openKeyBindWin('Mac'),
  },

  //Navigation Keys......
  {
    name: 'mind-reader.showAllSymbols',
    callback: () => vscode.commands.executeCommand('workbench.action.showAllSymbols'),
  },

  {
    name: 'mind-reader.gotoLine',
    callback: () => vscode.commands.executeCommand('workbench.action.gotoLine'),
  },

  {
    name: 'mind-reader.quickOpen',
    callback: () => vscode.commands.executeCommand('workbench.action.quickOpen'),
  },

  {
    name: 'mind-reader.gotoSymbol',
    callback: () => vscode.commands.executeCommand('workbench.action.gotoSymbol'),
  },

  {
    name: 'mind-reader.showProblems',
    callback: () => vscode.commands.executeCommand('workbench.actions.view.problems'),
  },

  {
    name: 'mind-reader.nextInFiles',
    callback: () => vscode.commands.executeCommand('editor.action.marker.nextInFiles'),
  },

  {
    name: 'mind-reader.prevInFiles',
    callback: () => vscode.commands.executeCommand('editor.action.marker.prevInFiles'),
  },

  {
    name: 'mind-reader.showCommands',
    callback: () => vscode.commands.executeCommand('workbench.action.showCommands'),
  },

  {
    name: 'mind-reader.quickOpenPreviousRecentlyUsedEditorInGroup',
    callback: () => vscode.commands.executeCommand('workbench.action.quickOpenPreviousRecentlyUsedEditorInGroup'),
  },

  {
    name: 'mind-reader.navigateBack',
    callback: () => vscode.commands.executeCommand('workbench.action.navigateBack'),
  },

  {
    name: 'mind-reader.getQuickInputBack',
    callback: () => vscode.commands.executeCommand('workbench.action.quickInputBack'),
  },

  {
    name: 'mind-reader.navigateForward',
    callback: () => vscode.commands.executeCommand('workbench.action.navigateForward'),
  },
];

// COMMAND CALLBACK IMPLEMENTATIONS
function openWebview(): void {
  //vscode.commands.executeCommand('workbench.action.zoomOut');
  const panel = vscode.window.createWebviewPanel(
    'mindReader', // Identifies the type of the webview. Used internally
    'Mind Reader', // Title of the panel displayed to the user
    vscode.ViewColumn.One, // Editor column to show the new webview panel in.
    {}
  ); // Webview options. More on these later.

  panel.webview.html = getWebviewContent('media/html/main.html');
}

function getWebviewContent(filepath: string) {
  return fs.readFileSync(filepath, {encoding: 'utf-8'});
}

function openKeyBindWin(os: 'Mac' | 'Windows'): void {
  //vscode.commands.executeCommand('workbench.action.zoomOut');
  const panel = vscode.window.createWebviewPanel(
    'mindReader', // Identifies the type of the webview. Used internally
    'MR Key Bindings', // Title of the panel displayed to the user
    vscode.ViewColumn.One, // Editor column to show the new webview panel in.
    {}
  ); // Webview options. More on these later.

  if (os === 'Windows') {
    panel.webview.html = getWebviewContent('media/html/winkeys.html');
  } else if (os === 'Mac') {
    panel.webview.html = getWebviewContent('media/html/mackeys.html');
  }
}


