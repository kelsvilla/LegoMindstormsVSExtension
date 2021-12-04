import * as vscode from 'vscode';
import * as pl from './pylex';

import {
  accessCommands,
  hubCommands,
  navCommands,
  textCommands
} from './commands';

import CommandNodeProvider from './commandNodeProvider';
import Logger from './log';

// Output Logger
const product: string = vscode.workspace.getConfiguration('mindReader').get('productType')!;
const outputChannel = vscode.window.createOutputChannel(product + " Output");
export const logger = new Logger(outputChannel);

let parser: pl.Parser = new pl.Parser();

export function activate(context: vscode.ExtensionContext) {
  vscode.window.showInformationMessage('Mind_Reader is loaded!');

  parser.parse('Beep Boop');

  const allCommands = [
    accessCommands,
    hubCommands,
    navCommands,
    textCommands
  ].flat(1);

  // Register Commands
  allCommands.forEach(command => {
    let disposable = vscode.commands.registerCommand(
      command.name,
      command.callback
    );
    context.subscriptions.push(disposable);
  });

  let accessProvider = new CommandNodeProvider([accessCommands, textCommands].flat(1));
  vscode.window.registerTreeDataProvider('accessActions', accessProvider);

  let hubProvider = new CommandNodeProvider(hubCommands);
  vscode.window.registerTreeDataProvider('hubActions', hubProvider);
}

export function deactivate() {}
