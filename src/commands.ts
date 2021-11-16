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
    name: 'mind-reader.getuickInputBack',
    callback: () => vscode.commands.executeCommand('workbench.action.quickInputBack'),
  },

  {
    name: 'mind-reader.navigateForward',
    callback: () => vscode.commands.executeCommand('workbench.action.navigateForward'),
  },
  {
    name: 'mind-reader.runLineContext',
    callback: runLineContext,
  },
  {
    name: 'mind-reader.runCursorContext',
    callback: runCursorContext
  },
  {
    name: 'mind-reader.getIndent',
    callback: getIndent
  }
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

function getIndent(): void {
  let editor = vscode.window.activeTextEditor;
  if(editor)
  {
    let lineNum = editor.selection.active.line + 1;
    let textLine = editor.document.lineAt(lineNum - 1);
    let i = 0;
    if(textLine.isEmptyOrWhitespace)
    {
      vscode.window.showInformationMessage("Line number " + lineNum.toString() + " Is Empty");
    }
    else
    {
      while(textLine.text[i] === '\t')
      {
        i++;
      }
      vscode.window.showInformationMessage("Line Number " + lineNum.toString() + " Indentation " + i.toString());
    }
  }
  else{
    vscode.window.showErrorMessage('No document currently active');
  }

}

function runLineContext(): void {
  let editor = vscode.window.activeTextEditor;
  if (editor){
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

      if (node.token!.type !== pl.PylexSymbol.EMPTY &&
        node.token!.type !== pl.PylexSymbol.INDENT) {
        contextString += ' inside ' + node.token!.type.toString();
        if (node.token!.attr) {
          contextString += ' ' + node.token!.attr.toString();
        }
      }
    }
    return contextString;
}

// find up to `n` words around the cursor, where `n` is
// the value of `#mindreader.reader.contextWindow`
function runCursorContext(): void {
  let editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("RunCursorContext: No Active Editor");
    return;
  }

  const cursorPos: vscode.Position = editor.selection.active;
  const text: string = editor.document.lineAt(cursorPos).text;
  const windowSize: number = vscode.workspace.getConfiguration('mindreader').get('reader.contextWindow')!;

  let trimmedText = text.trimStart(); // trim leading whitespace
  let leadingWS = text.length - trimmedText.length; // # of characters of leading whitespace
  trimmedText = trimmedText.trimEnd(); // trim trailing whitespace
  let pos = leadingWS;
  let maxPos = text.length;

  // clamp cursor start/end to new range
  let col = cursorPos.character; // effective column of the cursor position
  if (col < leadingWS) {
    // move effective start to first non-whitespace character in the line
    col = leadingWS;
  } else if (col > leadingWS + trimmedText.length - 1) {
    // move effective end to last non-whitespace character in the line
    col = leadingWS + trimmedText.length - 1;
  }

  // generate list of space separate words with range data (start, end)
  // TODO: can find user position to be done in one pass
  let spaceWords: {word: string, start: number, end: number}[] = [];
  while (pos < maxPos && trimmedText.length > 0) {
    let word = trimmedText.replace(/ .*/, '');
    spaceWords.push({word, start: pos, end: pos+word.length});

    // remove processed word from trimmed text
    const oldText = trimmedText;
    trimmedText = trimmedText.replace(/[^ ]+/, '').trimStart();

    // update pos to start of next word
    pos += oldText.length - trimmedText.length;
  }

  // find word the user is in
  let contextStart: number = -1, contextEnd: number = -1;
  for (let i = 0; i < spaceWords.length; i++) {
    if (col >= spaceWords[i].start && col <= spaceWords[i].end) {
      // found the word
      contextStart = Math.max(0, i - windowSize); // clamp start index
      contextEnd = Math.min(spaceWords.length, i + windowSize + 1); // clamp end index

      // construct cursor context string
      let contextString = '';
      for (let i = contextStart; i < contextEnd; i++) {
        contextString += spaceWords[i].word + ' ';
      }

      // output cursor context string
      vscode.window.showInformationMessage(contextString);

      return;
    }
  }
}

export default commands;
