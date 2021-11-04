import * as vscode from 'vscode';
import * as pl from './pylex';

/**
 * @type {Object} Command // Command to register with the VS Code Extension API
 * @prop {string} command // Name of the command; e.g., 'mind-reader.selectTheme'
 * @prop {callback} callback // Callback to register when `command` is invoked
 */
type Command = {
  name: string,
  callback: () => void
};

// The list of commands to register in the extension
const commands: Command[] = [
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
    name: 'mind-reader.runLineContext',
    callback: runLineContext,
  },
];

// COMMAND CALLBACK IMPLEMENTATIONS

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

function runLineContext(): void {
  let editor = vscode.window.activeTextEditor;
  if (editor) {
    // current text and line number
    let editorText = editor.document.getText();
    let line = editor.selection.active.line;

    // get tab info settings
    let size = parseInt(editor.options.tabSize as string);
    let hard = !editor.options.insertSpaces;

    // initialize parser
    let parser = new pl.Parser(editorText, {size, hard});
    parser.parse();

    let context = parser.context(line);

    // build text
    let contentString = createContextString(context, line);
    vscode.window.showInformationMessage(contentString);
  } else {
    vscode.window.showErrorMessage('No document currently active');
  }
}

function createContextString(context: pl.LexNode[], line: number): string {
    if (context.length < 1) {
      throw new Error('Cannot create context string for empty context');
    }

    let contextString = 'Line ' + (line+1); // 1 based
    if (context[0].token && context[0].token.attr) {
      contextString += ': ' + context[0].token.type.toString() + ' ' + context[0].token.attr.toString();
    }
    for (let i = 1; i < context.length; i++) {
      let node = context[i];
      if (node.label === 'root') {
        // root
        contextString += ' in the Document Root';
        continue;
      }

      if (node.token!.type != pl.PylexSymbol.EMPTY &&
        node.token!.type != pl.PylexSymbol.INDENT) {
        contextString += ' inside ' + node.token!.type.toString();
        if (node.token!.attr) {
          contextString += ' ' + node.token!.attr.toString();
        }
      }
    }
    return contextString;
}

export default commands;
