"use strict";
import pl = require("../pylex");
import * as say from 'say';
import { Position, Selection, TextEditor, TextLine, Uri, languages, window, workspace } from "vscode";
import { CommandEntry } from './commandEntry';

export const textCommands: CommandEntry[] = [
    {
        name: 'mind-reader.getLineNumber',
        callback: getLineNumber,
    },
    {
        name: 'mind-reader.getIndent',
        callback: getIndent,
    },
    {
        name: 'mind-reader.getLeadingSpaces',
        callback: getLeadingSpaces,
    },
    {
        name: 'mind-reader.selectLeadingWhitespace',
        callback: selectLeadingWhitespace,
    },
    {
        name: 'mind-reader.getNumberOfSelectedLines',
        callback: getNumberOfSelectedLines,
    },
    {
        name: 'mind-reader.getLineScope',
        callback: runLineContext,
    },
    {
        name: 'mind-reader.getWordsUnderCursor',
        callback: runCursorContext,
    },
    {
        name: 'mind-reader.toggleTextToSpeech',
        callback: toggleTTS,
    },
    {
        name: 'mind-reader.goToSyntaxErrors',
        callback: goToSyntaxErrors
    }
];

/** Helper Function
 *
 * @param editor
 * @returns numSpaces
 ** There are two methods that can be used to find the leading spaces:
 ** method 1:
 **    calculates the number of leading spaces by finding the length of the current line
 **    then subtracting from that the length of the text after trimming the whitespace at the start
 **    which will equal the number of whitespace characters
 **
 **    TO-USE: set calculateLeadingSpaces to true
 **
 ** method 2 (default):
 **    finds the index position of the first non-whitespace character in a 0-index
 **    this number will equal the number of spaces preceding the non-whitespace character
 **   due to the nature of 0-indexes.
 **
 **    TO-USE: set calculateLeadingSpaces to false
 */
 let shouldSpeak = false;

 function outputMessage(message: string) {
    window.showInformationMessage(message);
    if(shouldSpeak === true){
        say.speak(message);
    }
}

function toggleTTS() {
    shouldSpeak = !shouldSpeak;
}

function fetchNumberOfLeadingSpaces(editor: TextEditor | undefined): number {
    let numSpaces: number = 0;


    if (editor) {
        /*
         * set  true to use method 1: find the number of leading spaces through arithmetic
         * set false to use method 2: find the index position of the first non-whitespace character in a 0-index
         * default: false
         */
        const calculateLeadingSpaces: boolean = false;          // change boolean value to change method
        const line: TextLine = fetchLine(editor);

        /* If true, calculate by arithmetic otherwise get index */
        numSpaces = (calculateLeadingSpaces)
            ? pl.Lexer.getLeadingSpacesByArithmetic(line)
            : pl.Lexer.getLeadingSpacesByIndex(line);
    }

    return numSpaces;
}

/** Helper Function
* * This function returns the number of selected lines in the active text editor window
    @param editor
    @returns numberOfSelectedLines
*/
function fetchNumberOfSelectedLines(editor: TextEditor | undefined): number {
    let numberOfSelectedLines: number = 0;

    if (editor) {
        numberOfSelectedLines = editor.selections.reduce((prev, curr) => prev + (curr.end.line - curr.start.line), 1);
    }

    return numberOfSelectedLines;
}

/** Helper Function
 ** This function returns the line number of the active text editor window
 *  @param editor
 *  @returns editor!.selection.active.line + 1
 */
function fetchLineNumber(editor: TextEditor | undefined): number {
    return editor!.selection.active.line + 1; // line numbers start at 1, not 0, so we add 1 to the result
}

/** Helper Function
 ** This function returns the text from the current line of the active text editor window
 *  @param editor
 *  @returns editor.document.lineAt(fetchLineNumber(editor) - 1)
 */
function fetchLine(editor: TextEditor | undefined): TextLine {
    return editor!.document.lineAt(fetchLineNumber(editor) - 1); // We want the line index, so we remove the 1 we added to the result in fetchLineNumber
}

/* Function
 * Function to return the number of selected (highlighted) lines
 * Changes output to 'Line' for 1 line and 'Lines' for all other instances
 */
function getNumberOfSelectedLines(): void {
    const editor: TextEditor | undefined = window.activeTextEditor;

    if (editor) {
        const numberOfSelectedLines: number = fetchNumberOfSelectedLines(editor);

        const message = (numberOfSelectedLines !== 1)
            ? `${numberOfSelectedLines.toString()} Lines Selected`
            : `${numberOfSelectedLines.toString()} Line Selected`;

        // Show the message to the user
        outputMessage(message);
    }
    else {
        window.showErrorMessage('No document currently active');
    }

}

/*  Function
 *  Outputs the current line number the cursor is on
 */
export function getLineNumber(): void {
    const editor: TextEditor | undefined = window.activeTextEditor;

    if (editor) {
        const lineNum: number = fetchLineNumber(editor);

        const message = `Line ${lineNum.toString()}`;
        outputMessage(message);
    }
    else {
        window.showErrorMessage('No document currently active');
    }

}

/* Function
 * Used to get the number of indents on a line
 */
function getIndent(): void {
    const editor: TextEditor | undefined = window.activeTextEditor;

    if (editor) {
        const lineNum: number = (fetchLineNumber(editor));
        const line: TextLine = fetchLine(editor);

        if (line.isEmptyOrWhitespace) {
            window.showInformationMessage(`Line ${lineNum.toString()} is Empty`);
        }
        else {
            // Grab tab format from open document
            const tabFmt: pl.TabInfo = {
                size: typeof editor.options.tabSize === 'number' ? editor.options.tabSize : 4,
                hard: !editor.options.insertSpaces
            };
            const i: number = pl.Lexer.getIndent(line.text, tabFmt);

            const message = (i !== 1)
                ? `Line ${lineNum.toString()}: ${i.toString()} indents`
                : `Line ${lineNum.toString()}: ${i.toString()} indent`;

            outputMessage(message);
        }
    }
    else {
        window.showErrorMessage('No document currently active');
    }

}

/* Function
 * Used to return the number of indents on a line
 */
export function returnIndent(): Number {
    const editor: TextEditor | undefined = window.activeTextEditor;

    if (editor) {
        const line: TextLine = fetchLine(editor);

        if (line.isEmptyOrWhitespace) {
            return 0;
        }
        else {
            // Grab tab format from open document
            const tabFmt: pl.TabInfo = {
                size: typeof editor.options.tabSize === 'number' ? editor.options.tabSize : 4,
                hard: !editor.options.insertSpaces
            };
            const i: number = pl.Lexer.getIndent(line.text, tabFmt);

            return i;
        }
    }
    else {
        return -1;
    }

}

/* Function
 * Returns the number of leading spaces on the line the cursor is on
 */
function getLeadingSpaces(): void {
    const editor: TextEditor | undefined = window.activeTextEditor;

    if (editor) {
        const lineNum: number = fetchLineNumber(editor);
        const line: TextLine | undefined = fetchLine(editor);

        if (line.isEmptyOrWhitespace) {
            window.showInformationMessage(`Line ${lineNum.toString()} is empty`);
        }
        else {
            const numSpaces = fetchNumberOfLeadingSpaces(editor);

            /* Ternary operator to change the tense of 'space' to 'spaces' for the output if numSpaces is 0 or greater than 1 */
            const message = (numSpaces !== 1)
                ? `Line ${lineNum.toString()}: ${numSpaces.toString()} spaces`
                : `Line ${lineNum.toString()}: ${numSpaces.toString()} space`;

            outputMessage(message);
        }
    }
    else {
        window.showErrorMessage('No document currently active');
    }

}

/* Function
 * Selects the leading whitespace at the beginning of a line
 * This feature was a request from Senior Design Day Spring 2022
 */
function selectLeadingWhitespace(): void {
    const editor: TextEditor | undefined = window.activeTextEditor;

    if (editor) {
        const numSpaces = fetchNumberOfLeadingSpaces(editor); // This will be used for the output message
        const lineNum: number = (fetchLineNumber(editor));   // Get the displayed line number

        /* If numSpaces isn't greater than 1, then there is no leading whitespace to select */
        if (numSpaces >= 1) {
            const line: TextLine = fetchLine(editor);
            const startPos: number = line.range.start.character;            // Start at the starting character position
            const endPos: number = line.firstNonWhitespaceCharacterIndex; // End at the first non whitespace character index

            /* Apply our selection */
            /* We need to subtract 1 from lineNum because we added 1 during the fetchLineNumber above and we want the 0-index for position, so remove it */
            editor.selection = new Selection(new Position((lineNum - 1), startPos), new Position((lineNum - 1), endPos));


            /* Ternary operator to change the tense of 'space' to 'spaces' for the output if numSpaces is 0 or greater than 1 */
            const message = (numSpaces !== 1)
                ? `Line ${lineNum.toString()}: ${numSpaces.toString()} spaces selected`
                : `Line ${lineNum.toString()}: ${numSpaces.toString()} space selected`;
            outputMessage(message);
            // Move the cursor to the new selection
            window.showTextDocument(editor.document);
        }
        else {
            window.showErrorMessage(`Line ${lineNum.toString()}: No leading spaces to select!`); // No whitespace to select
        }
    }
    else {
        window.showErrorMessage('No document currently active'); // No active document
    }

}

function runLineContext(): void {
    const editor: TextEditor | undefined = window.activeTextEditor;

    if (editor) {
        // current text and line number
        const editorText: string = editor.document.getText();
        const line: number = editor.selection.active.line;
        // get tab info settings
        const size: number = typeof editor.options.tabSize === 'number' ? editor.options.tabSize : 4;
        const hard: boolean = !editor.options.insertSpaces;
        // initialize parser
        const parser: pl.Parser = new pl.Parser(editorText, {
            size,
            hard
        });

        parser.parse();
        const context: pl.LexNode[] = parser.context(line);
        // build text
        const contentString: string = createContextString(context, line);

        window.showInformationMessage(contentString);
        say.speak(contentString);
    }
    else {
        window.showErrorMessage('No document currently active');
    }
}

function createContextString(context: pl.LexNode[], line: number): string {
    if (context.length < 1) {
        throw new Error('Cannot create context string for empty context');
    }

    let contextString: string = `Line ${line + 1}`; // 1 based
    // Print the current line
    if (context[0].token && context[0].token.attr) {
        let tokenTypeString: string = `${context[0].token.type.toString()}`;
        contextString += `: ${tokenTypeString !== pl.PylexSymbol.STATEMENT ? tokenTypeString : ""
            } ${context[0].token.attr.toString()}`;
    }

    for (let i: number = 1; i < context.length; i++) {
        const node: pl.LexNode = context[i];
        const inside: string = "inside";
        // Node contains information relevant to the current line
        if (node.token && node.token.type !== pl.PylexSymbol.EMPTY &&
            node.token.type !== pl.PylexSymbol.STATEMENT) {
            contextString += ` ${inside} ${node.token.type.toString()}`;
            if (node.token.attr) {
                contextString += ` ${node.token.attr.toString()}`;
            }
        }
        // Node is the document root
        if (node.label === 'root') {
            // Append the name (relative path) of the document in the workspace
            if (window.activeTextEditor?.document.uri) {
                contextString += ` ${inside} ${workspace.asRelativePath(window.activeTextEditor?.document.uri)}`;
            } else {
                contextString += ` ${inside} the Document`;
            }
            continue;
        }
    }

    return contextString;
}

/*
 * find up to `n` words around the cursor, where `n` is
 * the value of `#mind-reader.reader.contextWindow`
 */
function runCursorContext(): void {
    const editor: TextEditor | undefined = window.activeTextEditor;

    if (!editor) {
        window.showErrorMessage('RunCursorContext: No Active Editor');
        return;
    }

    const cursorPos: Position = editor.selection.active;
    const text: string = editor.document.lineAt(cursorPos).text;
    const windowSize: any = workspace.getConfiguration('mind-reader').get('reader.contextWindow');
    let trimmedText: string = text.trimStart(); // trim leading whitespace
    const leadingWS: number = text.length - trimmedText.length; // # of characters of leading whitespace
    let pos: number = leadingWS;
    const maxPos: number = text.length;
    // clamp cursor start/end to new range
    let col: number = cursorPos.character; // effective column of the cursor position

    trimmedText = trimmedText.trimEnd(); // trim trailing whitespace

    if (col < leadingWS) {
        // move effective start to first non-whitespace character in the line
        col = leadingWS;
    }
    else if (col > leadingWS + trimmedText.length - 1) {
        // move effective end to last non-whitespace character in the line
        col = leadingWS + trimmedText.length - 1;
    }

    // generate list of space separate words with range data (start, end)
    // TODO: can find user position to be done in one pass
    const spaceWords: any[] = [];

    while (pos < maxPos && trimmedText.length > 0) {
        const word: string = trimmedText.replace(/ .*/, '');

        spaceWords.push({
            word,
            start: pos,
            end: pos + word.length
        });

        // remove processed word from trimmed text
        const oldText: string = trimmedText;
        trimmedText = trimmedText.replace(/[^ ]+/, '').trimStart();
        // update pos to start of next word
        pos += oldText.length - trimmedText.length;
    }

    // find word the user is in
    let contextStart: number = -1;
    let contextEnd: number = -1;

    for (let i: number = 0; i < spaceWords.length; i++) {
        if (col >= spaceWords[i].start && col <= spaceWords[i].end) {
            // found the word
            contextStart = Math.max(0, i - windowSize); // clamp start index
            contextEnd = Math.min(spaceWords.length, i + windowSize + 1); // clamp end index
            // construct cursor context string
            let contextString: string = '';

            for (let i: number = contextStart; i < contextEnd; i++) {
                contextString += spaceWords[i].word + ' ';
            }
            // output cursor context string
            window.showInformationMessage(contextString);
            say.speak(contextString);
            return;
        }
    }
}

function goToSyntaxErrors(): void {
    // Checks if there is an editor open
    if (!window || !window.activeTextEditor) { return; }

    // get file path
    const currentFileURI: Uri = window.activeTextEditor.document.uri;

    // gets all current errors
    // filters to only errors
    // creates array of objects
    const currentProblems = languages
        .getDiagnostics(currentFileURI)
        .filter((diagnostic) => diagnostic.severity === 0)
        .map((res) => ({
            'problem': res.message,
            'position': res.range.start
        }));

    // if no error, do nothing
    if (currentProblems.length === 0) { return; }

    // get cursor positon
    const cursorPosition: Position = window.activeTextEditor.selection.active;

    // gets problems that exist after the cursor
    let nextProblems = currentProblems.filter((problem) => {
        if (problem.position.line > cursorPosition.line) { return true; }
        if (problem.position.line === cursorPosition.line && problem.position.character > cursorPosition.character) { return true; }
        else { return false; }
    });

    // if there are errors after cursor, go to it, else go to the first problem in currentProblems
    if (nextProblems.length > 0) {
        window.activeTextEditor.selection = new Selection(nextProblems[0].position, nextProblems[0].position);
        say.speak(nextProblems[0].problem);
    }
    else {
        window.activeTextEditor.selection = new Selection(currentProblems[0].position, currentProblems[0].position);
        say.speak(currentProblems[0].problem);
    }
}