import * as vscode from 'vscode';

import * as pl from './pylex';
import commands from './commands';

let parser: pl.Parser = new pl.Parser();

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "mind-reader" is now active!');
  vscode.window.showInformationMessage('Mind_Reader is loaded!');

  parser.parse('Beep Boop');

  // Register Commands
  commands.forEach(command => {
    let disposable = vscode.commands.registerCommand(
      command.name,
      command.callback
    );
    context.subscriptions.push(disposable);
  });
}

export function deactivate() {}
