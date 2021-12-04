import * as vscode from 'vscode';
import * as pl from '../pylex';

import { CommandEntry } from './commandEntry';

export const textCommands: CommandEntry[] = [
  {
    name: 'mind-reader.getIndent',
    callback: getIndent,
  },

  {
    name: 'mind-reader.runLineContext',
    callback: runLineContext,
  },

  {
    name: 'mind-reader.runCursorContext',
    callback: runCursorContext
  }
]

function getIndent(): void {
  let editor = vscode.window.activeTextEditor;
  if(editor)
  {
    let lineNum = editor.selection.active.line + 1;
    let textLine = editor.document.lineAt(lineNum - 1);
    if(textLine.isEmptyOrWhitespace)
    {
      vscode.window.showInformationMessage("Line number " + lineNum.toString() + " Is Empty");
    }
    else
    {
      // Grab tab format from open document
      let tabFmt = {
        size: editor.options.tabSize as number,
        hard: !editor.options.insertSpaces
      };
      let i = pl.Lexer.getIndent(textLine.text, tabFmt);
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
// the value of `#mindReader.reader.contextWindow`
function runCursorContext(): void {
  let editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('RunCursorContext: No Active Editor');
    return;
  }

  const cursorPos: vscode.Position = editor.selection.active;
  const text: string = editor.document.lineAt(cursorPos).text;
  const windowSize: number = vscode.workspace.getConfiguration('mindReader').get('reader.contextWindow')!;

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

