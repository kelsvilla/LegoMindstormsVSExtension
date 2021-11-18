import * as vscode from 'vscode';
import * as pl from './pylex';

import { accessCommands, hubCommands, navCommands } from './commands';

import CommandNodeProvider from './commandNodeProvider';
import Logger from './log';

// Output Logger
const outputChannel = vscode.window.createOutputChannel("SPIKE Prime Output");
export const logger = new Logger(outputChannel);

let parser: pl.Parser = new pl.Parser();

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "mind-reader" is now active!');
  vscode.window.showInformationMessage('Mind_Reader is loaded!');

  parser.parse('Beep Boop');

  let allCommands = accessCommands.concat(hubCommands).concat(navCommands);

  // Register Commands
  allCommands.forEach(command => {
    let disposable = vscode.commands.registerCommand(
      command.name,
      command.callback
    );
    context.subscriptions.push(disposable);
  });

  let accessProvider = new CommandNodeProvider(accessCommands);
  vscode.window.registerTreeDataProvider('accessActions', accessProvider);

  let hubProvider = new CommandNodeProvider(hubCommands);
  vscode.window.registerTreeDataProvider('hubActions', hubProvider);
}

export function deactivate() {}
