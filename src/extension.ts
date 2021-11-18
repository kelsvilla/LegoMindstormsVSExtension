import * as vscode from 'vscode';
import * as pl from './pylex';

import commands from './commands';

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

  // Register Commands
  commands.forEach(command => {
    let disposable = vscode.commands.registerCommand(
      command.name,
      command.callback
    );
    context.subscriptions.push(disposable);
  });

  // list of all commands to present in the access pane
  const accessActions: string[] = [
    'increaseFontScale',
    'decreaseFontScale',
    'resetFontScale',

    'increaseEditorScale',
    'decreaseEditorScale',
    'resetEditorScale',

    'selectTheme',

    'runLineContext',
    'runCursorContext',
  ];

  let accessProvider = new CommandNodeProvider(accessActions);
  vscode.window.registerTreeDataProvider('accessActions', accessProvider);


  // list of all commands to present in the hub pane
  const hubCommands: string[] = [
    'connectHub',
    'diconnectHub',
    'uploadCurrentFile',
    'runProgram',
    'stopExecution',
    'deleteProgram',
  ];

  let hubProvider = new CommandNodeProvider(hubCommands);
  vscode.window.registerTreeDataProvider('hubActions', hubProvider);
}

export function deactivate() {}
