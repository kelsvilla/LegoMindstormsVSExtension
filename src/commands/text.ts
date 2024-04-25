"use strict";
import pl = require("../pylex");
import * as say from "say";
import {
	Position,
	Selection,
	TextEditor,
	TextLine,
	languages,
	window,
	workspace,
    Range,
    Uri,
    TabInputText
} from "vscode";
import { CommandEntry } from "./commandEntry";
import { Configuration } from "../util";

export const textCommands: CommandEntry[] = [
    {
        name: "mind-reader.getLineNumber",
        callback: getLineNumber,
    },
    {
        name: "mind-reader.getIndent",
        callback: getIndent,
    },
    {
        name: "mind-reader.getLeadingSpaces",
        callback: getLeadingSpaces,
    },
    {
        name: "mind-reader.selectLeadingWhitespace",
        callback: selectLeadingWhitespace,
    },
    {
        name: "mind-reader.getNumberOfSelectedLines",
        callback: getNumberOfSelectedLines,
    },
    {
        name: "mind-reader.getLineScope",
        callback: runLineContext,
    },
    {
        name: "mind-reader.getWordsUnderCursor",
        callback: runCursorContext,
    },
    {
        name: "mind-reader.goToSyntaxErrors",
        callback: goToSyntaxErrors,
        undo: undoGoToSyntaxErrors,
    },
    {
        name: "mind-reader.moveCursorBeginning",
        callback: moveCursorBeginning,
        undo: undoMoveCursorBeginning,
    },
    {
        name: "mind-reader.moveCursorEnd",
        callback: moveCursorEnd,
        undo: undoMoveCursorEnd,
    },
];

export const TTSCommand: CommandEntry[] = [
    {
        name: "mind-reader.toggleTTS",
        callback: toggleTTS,
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

let shouldSpeak: boolean;
export function setShouldSpeak() {
    shouldSpeak = Configuration.GetInstance().get()["textToSpeech"]["isEnabledOnStartup"];
}

export function outputMessage(message: string) {
    let readingSpeed: number = Configuration.GetInstance().get()["textToSpeech"]["readingSpeed"];

    window.showInformationMessage(message);
    shouldSpeak === true ? say.speak(message, undefined, readingSpeed) : undefined;
}

export function outputWarningMessage(message: string) {
    window.showWarningMessage(message);
    shouldSpeak === true? say.speak("Warning," + message) : undefined;
}

export function outputErrorMessage(message:string) {
    window.showErrorMessage(message);
    shouldSpeak === true? say.speak("Error," + message) : undefined;
}

function toggleTTS() {
    shouldSpeak = !shouldSpeak;
    shouldSpeak
        ? outputMessage("Text to Speech Activated")
        : outputMessage("Text to Speech Deactivated");
}

export function fetchNumberOfLeadingSpaces(editor: TextEditor | undefined): number {
    let numSpaces: number = 0;

    if (editor) {
        /*
         * set  true to use method 1: find the number of leading spaces through arithmetic
         * set false to use method 2: find the index position of the first non-whitespace character in a 0-index
         * default: false
         */
        const calculateLeadingSpaces: boolean = false; // change boolean value to change method
        const line: TextLine = fetchLine(editor);

        /* If true, calculate by arithmetic otherwise get index */
        numSpaces = calculateLeadingSpaces
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
export function fetchNumberOfSelectedLines(editor: TextEditor | undefined): number {
    let numberOfSelectedLines: number = 0;

    if (editor) {
        numberOfSelectedLines = editor.selections.reduce(
            (prev, curr) => prev + (curr.end.line - curr.start.line),
            1,
        );
    }

    return numberOfSelectedLines;
}

/** Helper Function
 ** This function returns the line number of the active text editor window
 *  @param editor
 *  @returns editor!.selection.active.line + 1
 */
export function fetchLineNumber(editor: TextEditor | undefined): number {
    return editor!.selection.active.line + 1; // line numbers start at 1, not 0, so we add 1 to the result
}

/** Helper Function
 ** This function returns the text from the current line of the active text editor window
 *  @param editor
 *  @returns editor.document.lineAt(fetchLineNumber(editor) - 1)
 */
export function fetchLine(editor: TextEditor | undefined): TextLine {
    return editor!.document.lineAt(fetchLineNumber(editor) - 1); // We want the line index, so we remove the 1 we added to the result in fetchLineNumber
}

/* Function
 * Function to return the number of selected (highlighted) lines
 * Changes output to 'Line' for 1 line and 'Lines' for all other instances
 */
function getNumberOfSelectedLines(): void {
    const editor: TextEditor | undefined = window.activeTextEditor;

    if (editor) {
        const numberOfSelectedLines: number =
            fetchNumberOfSelectedLines(editor);

        const message =
            numberOfSelectedLines !== 1
                ? `${numberOfSelectedLines.toString()} Lines Selected`
                : `${numberOfSelectedLines.toString()} Line Selected`;

        // Show the message to the user
        outputMessage(message);
    } else {
        outputErrorMessage("No document currently active");
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
    } else {
        outputErrorMessage("No document currently active");
    }
}

/* Function
 * Used to get the number of indents on a line
 */
export function getIndent(): number {
    const editor: TextEditor | undefined = window.activeTextEditor;

    if (editor) {
        const lineNum: number = fetchLineNumber(editor);
        const line: TextLine = fetchLine(editor);

        if (line.isEmptyOrWhitespace) {
            outputMessage(
                `Line ${lineNum.toString()} is Empty`,
            );

        } else {
            // Grab tab format from open document
            const tabFmt: pl.TabInfo = {
                size:
                    typeof editor.options.tabSize === "number"
                        ? editor.options.tabSize
                        : 4,
                hard: !editor.options.insertSpaces,
            };
            const i: number = pl.Lexer.getIndent(line.text, tabFmt);

            const message =
                i !== 1
                    ? `Line ${lineNum.toString()}: ${i.toString()} indents`
                    : `Line ${lineNum.toString()}: ${i.toString()} indent`;

            outputMessage(message);
            return i;
        }
    } else {
        outputErrorMessage("No document currently active");
        return 0;
    }
    return 0;
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
        } else {
            // Grab tab format from open document
            const tabFmt: pl.TabInfo = {
                size:
                    typeof editor.options.tabSize === "number"
                        ? editor.options.tabSize
                        : 4,
                hard: !editor.options.insertSpaces,
            };
            const i: number = pl.Lexer.getIndent(line.text, tabFmt);

            return i;
        }
    } else {
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
            outputMessage(
                `Line ${lineNum.toString()} is empty`,
            );
        } else {
            const numSpaces = fetchNumberOfLeadingSpaces(editor);

            /* Ternary operator to change the tense of 'space' to 'spaces' for the output if numSpaces is 0 or greater than 1 */
            const message =
                numSpaces !== 1
                    ? `Line ${lineNum.toString()}: ${numSpaces.toString()} spaces`
                    : `Line ${lineNum.toString()}: ${numSpaces.toString()} space`;

            outputMessage(message);
        }
    } else {
        outputErrorMessage("No document currently active");
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
        const lineNum: number = fetchLineNumber(editor); // Get the displayed line number

        /* If numSpaces isn't greater than 1, then there is no leading whitespace to select */
        if (numSpaces >= 1) {
            const line: TextLine = fetchLine(editor);
            const startPos: number = line.range.start.character; // Start at the starting character position
            const endPos: number = line.firstNonWhitespaceCharacterIndex; // End at the first non whitespace character index

            /* Apply our selection */
            /* We need to subtract 1 from lineNum because we added 1 during the fetchLineNumber above and we want the 0-index for position, so remove it */
            editor.selection = new Selection(
                new Position(lineNum - 1, startPos),
                new Position(lineNum - 1, endPos),
            );

            /* Ternary operator to change the tense of 'space' to 'spaces' for the output if numSpaces is 0 or greater than 1 */
            const message =
                numSpaces !== 1
                    ? `Line ${lineNum.toString()}: ${numSpaces.toString()} spaces selected`
                    : `Line ${lineNum.toString()}: ${numSpaces.toString()} space selected`;
            outputMessage(message);
            // Move the cursor to the new selection
            window.showTextDocument(editor.document);
        } else {
            outputErrorMessage(
                `Line ${lineNum.toString()}: No leading spaces to select!`,
            ); // No whitespace to select
        }
    } else {
        outputErrorMessage("No document currently active"); // No active document
    }
}

function runLineContext(): void {
    const editor: TextEditor | undefined = window.activeTextEditor;

    if (editor) {
        // current text and line number
        const editorText: string = editor.document.getText();
        const line: number = editor.selection.active.line;
        // get tab info settings
        const size: number =
            typeof editor.options.tabSize === "number"
                ? editor.options.tabSize
                : 4;
        const hard: boolean = !editor.options.insertSpaces;
        // initialize parser
        const parser: pl.Parser = new pl.Parser(editorText, {
            size,
            hard,
        });

        parser.parse();
        const context: pl.LexNode[] = parser.context(line);
        // build text
        const contentString: string = createContextString(context, line);

        outputMessage(contentString);
    } else {
        outputErrorMessage("No document currently active");
    }
}

function createContextString(context: pl.LexNode[], line: number): string {
    if (context.length < 1) {
        throw new Error("Cannot create context string for empty context");
    }

    let contextString: string = `Line ${line + 1}`; // 1 based
    // Print the current line
    if (context[0].token && context[0].token.attr) {
        let tokenTypeString: string = `${context[0].token.type.toString()}`;
		contextString += `: ${
			tokenTypeString !== pl.PylexSymbol.STATEMENT ? tokenTypeString : ""
            } ${context[0].token.attr.toString()}`;
    } else if (
        context[0].token?.type === pl.PylexSymbol.ELSE ||
        context[0].token?.type === pl.PylexSymbol.TRY ||
        context[0].token?.type === pl.PylexSymbol.EXCEPT
    ) {
        let tokenTypeString: string = `${context[0].token.type.toString()}`;
        contextString += ": " + tokenTypeString;
    }
    for (let i: number = 1; i < context.length; i++) {
        const node: pl.LexNode = context[i];
        const inside: string = "inside";
        // Node contains information relevant to the current line
        if (
            node.token &&
            node.token.type !== pl.PylexSymbol.EMPTY &&
            node.token.type !== pl.PylexSymbol.STATEMENT
        ) {
            contextString += ` ${inside} ${node.token.type.toString()}`;
            if (node.token.attr) {
                contextString += ` ${node.token.attr.toString()}`;
            }
        }
        // Node is the document root
        if (node.label === "root") {
            // Append the name (relative path) of the document in the workspace
            if (window.activeTextEditor?.document.uri) {
                contextString += ` ${inside} ${workspace.asRelativePath(
                    window.activeTextEditor?.document.uri,
                )}`;
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
        outputErrorMessage("RunCursorContext: No Active Editor");
        return;
    }

    const cursorPos: Position = editor.selection.active;
    const text: string = editor.document.lineAt(cursorPos).text;
    const windowSize: any = workspace
        .getConfiguration("mind-reader")
        .get("reader.contextWindow");
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
    } else if (col > leadingWS + trimmedText.length - 1) {
        // move effective end to last non-whitespace character in the line
        col = leadingWS + trimmedText.length - 1;
    }

    // generate list of space separate words with range data (start, end)
    // TODO: can find user position to be done in one pass
    const spaceWords: any[] = [];

    while (pos < maxPos && trimmedText.length > 0) {
        const word: string = trimmedText.replace(/ .*/, "");

        spaceWords.push({
            word,
            start: pos,
            end: pos + word.length,
        });

        // remove processed word from trimmed text
        const oldText: string = trimmedText;
        trimmedText = trimmedText.replace(/[^ ]+/, "").trimStart();
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
			let contextString: string = "";
			for (let i: number = contextStart; i < contextEnd; i++) {
				contextString += spaceWords[i].word + " ";
			}
			// output cursor context string
			outputMessage(contextString);
			return;
		}
	}
}

let syntaxErrorPreviousPosition: {uri: Uri, position: Position} | undefined;
async function goToSyntaxErrors(): Promise<void> {
    // Checks if there is an editor open
    if (!window || !window.activeTextEditor) {
        return;
    }

    let diagnostics = languages.getDiagnostics(); // gets all current errors
    let globalProblems = [];
    const cursorPosition: Position = window.activeTextEditor.selection.active;
    const currentFilePath: string = window.activeTextEditor.document.uri.toString();
    const warningCheck: any = workspace.getConfiguration("mind-reader").get("includeWarnings");

    let nextProblemFileObj;
    let nextProblemFileIndex;
    let nextProblems;
    syntaxErrorPreviousPosition = {uri: window.activeTextEditor.document.uri, position: cursorPosition};

    // creates array of objects
    /*
    {
        uri: Uri
        problems: { message: string, position: Position }[]
    }
    */
    for (let i = 0; i < diagnostics.length; i++) {
        globalProblems.push({
            uri: diagnostics[i][0],
            problems: diagnostics[i][1]
                .filter((diagnostics) => (warningCheck && diagnostics.severity === 1) || diagnostics.severity === 0) // keep errors
                .map((res) => ({
                    message: res.message,
                    position: res.range.start,
                })),
        });
    }

    // removes any stored files with no problems
    globalProblems = globalProblems.filter(
        (diagnostics) => diagnostics.problems.length > 0,
    );

    // checks if there are any problems
    if (globalProblems.length === 0) {
        return;
    }

    // get the next problem file's object and index
    nextProblemFileObj = globalProblems.find(
        (e) => e.uri.toString() === currentFilePath,
    );
    nextProblemFileIndex = globalProblems.findIndex(
        (e) => e.uri.toString() === currentFilePath,
    );

    // select first error file if cursor is on file without errors
    if (nextProblemFileObj === undefined) {
        nextProblemFileIndex = 0;
        nextProblemFileObj = globalProblems[0];
        const tabGroup = getTabGroupIndex(nextProblemFileObj.uri);
        await window.showTextDocument(nextProblemFileObj.uri, {
            selection: new Range(nextProblemFileObj.problems[0].position, nextProblemFileObj.problems[0].position),
            viewColumn: tabGroup
        });

        let message = generateErrorMessage(window.activeTextEditor, nextProblemFileObj.problems[0].message);
        outputMessage(message);

        return;
    }

    // gets the next problem in the problems array
    nextProblems = nextProblemFileObj!.problems.filter((problem) => {
        if (problem.position.line > cursorPosition.line) {
            return true;
        }
        if (
            problem.position.line === cursorPosition.line &&
            problem.position.character > cursorPosition.character
        ) {
            return true;
        } else {
            return false;
        }
    });

    // where to move cursor's position or change activeTextEditor
    if (nextProblems.length > 0) {  // next problem within same file
        window.activeTextEditor.selection = new Selection(
            nextProblems[0].position,
            nextProblems[0].position,
        );
        window.activeTextEditor.revealRange(new Range(nextProblems[0].position, nextProblems[0].position));

        let message = generateErrorMessage(window.activeTextEditor, nextProblems[0].message);
        outputMessage(message);
    } else if (nextProblems.length === 0) {
        // next problem not in same file
        if (nextProblemFileIndex < globalProblems.length - 1) {
            // next problem in next file
            nextProblemFileObj = globalProblems[nextProblemFileIndex + 1];
            const tabGroup = getTabGroupIndex(nextProblemFileObj.uri);
            await window.showTextDocument(nextProblemFileObj.uri, {
                selection: new Range(nextProblemFileObj.problems[0].position, nextProblemFileObj.problems[0].position),
                viewColumn: tabGroup
            });

            let message = generateErrorMessage(window.activeTextEditor, nextProblemFileObj.problems[0].message);
            outputMessage(message);
        } else {
            // last problem, go to first problem of first file
            const tabGroup = getTabGroupIndex(globalProblems[0].uri);
            await window.showTextDocument(globalProblems[0].uri, {
                selection: new Range(globalProblems[0].problems[0].position, globalProblems[0].problems[0].position),
                viewColumn: tabGroup
            });

            let message = generateErrorMessage(window.activeTextEditor, globalProblems[0].problems[0].message);
            outputMessage(message);
        }
    }
}

async function undoGoToSyntaxErrors(): Promise<void> {
    if(!window.activeTextEditor) {
        return;
    }
    if (syntaxErrorPreviousPosition) {
        const tabGroup = getTabGroupIndex(syntaxErrorPreviousPosition.uri);
        await window.showTextDocument(syntaxErrorPreviousPosition.uri, {
            selection: new Range(syntaxErrorPreviousPosition.position, syntaxErrorPreviousPosition.position),
            viewColumn: tabGroup
        });
        syntaxErrorPreviousPosition = undefined;
    }

}

function getTabGroupIndex(fileUri: Uri): number | undefined {
	for (const tabGroup of window.tabGroups.all) {
		for (const tab of tabGroup.tabs) {
			if (
				tab.input instanceof TabInputText &&
				tab.input.uri.toString() === fileUri.toString()
			) {
				//File is already opened: return the viewColumn for use when opening file
				return tab.group.viewColumn;
			}
		}
	}
    return undefined;
}

// Helper functions to move Cursor to beginning or end
let moveCursorBeginningPrevPosition: Position | undefined;
export function moveCursorBeginning(): void {
    const editor = window.activeTextEditor;

    //Throw error if no editor open
    if (!editor) {
        outputErrorMessage("MoveCursorBeginning: No Active Editor");
        return;
    }
    moveCursorBeginningPrevPosition = editor.selection.active; // Save previous position
    let newPosition: Position;

    newPosition = new Position(0, 0); // Assign  newPosition to beginning

    const newSelection = new Selection(newPosition, newPosition);
    editor.selection = newSelection; // Apply change to editor

    editor.revealRange(editor.selection, 1); // Make sure cursor is within range
    window.showTextDocument(editor.document, editor.viewColumn); // You are able to type without reclicking in document
}

function undoMoveCursorBeginning(): void {
    const editor = window.activeTextEditor;

    //Throw error if no editor open
    if (!editor) {
        outputErrorMessage("MoveCursorBeginning: No Active Editor");
        return;
    }

    if (moveCursorBeginningPrevPosition) {
        const newSelection = new Selection(
            moveCursorBeginningPrevPosition,
            moveCursorBeginningPrevPosition,
        );
        editor.selection = newSelection;
        editor.revealRange(editor.selection, 1);
        window.showTextDocument(editor.document, editor.viewColumn);
        moveCursorBeginningPrevPosition = undefined;
    }
}
let moveCursorEndPrevPosition: Position | undefined;
export function moveCursorEnd(): void {
    const editor = window.activeTextEditor;

    //Throw error if no editor open
    if (!editor) {
        outputErrorMessage("MoveCursorBeginning: No Active Editor");
        return;
    }

    moveCursorEndPrevPosition = editor.selection.active; // Save previous position
    let newPosition: Position;

    const lastLine = editor.document.lineCount - 1; // Get last line
    const lastCharacter = editor.document.lineAt(lastLine).text.length; // Get last character in last line
    newPosition = new Position(lastLine, lastCharacter); // Assign new position to end

    const newSelection = new Selection(newPosition, newPosition);
    editor.selection = newSelection; // Apply change to editor

    editor.revealRange(editor.selection, 1); // Make sure cursor is within range
    window.showTextDocument(editor.document, editor.viewColumn); // You are able to type without reclicking in document
}

function undoMoveCursorEnd(): void {
    const editor = window.activeTextEditor;

    //Throw error if no editor open
    if (!editor) {
        outputErrorMessage("MoveCursorEnd: No Active Editor");
        return;
    }

    if (moveCursorEndPrevPosition) {
        const newSelection = new Selection(
            moveCursorEndPrevPosition,
            moveCursorEndPrevPosition,
        );
        editor.selection = newSelection;
        editor.revealRange(editor.selection, 1);
        window.showTextDocument(editor.document, editor.viewColumn);
        moveCursorEndPrevPosition = undefined;
    }
}


function generateErrorMessage(textEditor: TextEditor, nextProblemMessage: string): string {
    let path = textEditor.document.uri.fsPath;
    path = path.replace("\/", "\\");
    let fileName = path.match(/((?:[^\\|\/]*){1})$/g)?.toString();
    fileName = fileName!.replace(',', '');
    let message = fileName + ": " + nextProblemMessage;

    return message;
}