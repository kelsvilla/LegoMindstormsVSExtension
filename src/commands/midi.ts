import { TextEditorSelectionChangeEvent, window, workspace } from "vscode";
import pl = require("../pylex");
import { CommandEntry } from "./commandEntry";
import * as jzz from "jzz";
import { outputMessage } from "./text";

export const midicommands: CommandEntry[] = [
	{
		name: "mind-reader.toggleSoundCues",
		callback: toggleSoundCues,
	},
];


let shouldPlayMIDINote = false;

export function toggleSoundCues(): boolean {
	shouldPlayMIDINote = !shouldPlayMIDINote;
	if (shouldPlayMIDINote) {
		outputMessage("Sound Cues Activated");
	} else {
		outputMessage("Sound Cues Deactivated");
	}
	return shouldPlayMIDINote;
}

window.onDidChangeTextEditorSelection(playerContext);

function playMidi(contextString: string) {
	var output = jzz().openMidiOut();
	var chordType: string = lineContext(contextString);
	output.note(0, chordType, 127, 550);
}

function playerContext(_event: TextEditorSelectionChangeEvent) {
	const editor = window.activeTextEditor;

	if (editor && shouldPlayMIDINote) {
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
		const contextString: string = createContextString(context);
		playMidi(contextString);
	}
}

function createContextString(context: pl.LexNode[]): string {
	if (context.length < 1) {
		throw new Error("Cannot create context string for empty context");
	}

	let contextString: string = ``; // 1 based
	// Print the current line
	if (context[0].token && context[0].token.attr) {
		let tokenTypeString: string = `${context[0].token.type.toString()}`;
		contextString += `${
			tokenTypeString !== pl.PylexSymbol.STATEMENT ? tokenTypeString : ""
		} ${context[0].token.attr.toString()}`;
	} else if (
		context[0].token?.type === pl.PylexSymbol.ELSE ||
		context[0].token?.type === pl.PylexSymbol.TRY ||
		context[0].token?.type === pl.PylexSymbol.EXCEPT
	) {
		let tokenTypeString: string = `${context[0].token.type.toString()}`;
		contextString += tokenTypeString;
	} else if (context[0].token?.type === pl.PylexSymbol.EMPTY) {
		contextString += "BLANK";
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

// Function checking for nested for loop
export function lineContext(contextString: string): string {
	const forIndex = contextString.indexOf("for");
	const forCount = countOccurrences(contextString, "for");
	const ifCount = countOccurrences(contextString, "if");
	const elseCount = countOccurrences(contextString, "else");
	const whileCount = countOccurrences(contextString, "while");

	const whileIndex = contextString.indexOf("while");
	const ifIndex = contextString.indexOf("if");
	const elseIndex = contextString.indexOf("else");
	const elifIndex = contextString.indexOf("elif");
	const tryIndex = contextString.indexOf("try");
	const exceptIndex = contextString.indexOf("except");
	const funcIndex = contextString.indexOf("function");
	const asyncIndex = contextString.indexOf("async");
	const commentIndex = contextString.indexOf("Comment");

	let noteNum = forCount + whileCount + ifCount + elseCount + 2;

	if (forIndex === 0) {
		return "b" + noteNum;
	} else if (whileIndex === 0) {
		return "d" + noteNum;
	} else if (ifIndex === 0) {
		return "g#" + noteNum;
	} else if (elseIndex === 0) {
		return "a#" + noteNum;
	} else if (elifIndex === 0) {
		return "a" + noteNum;
	} else if (asyncIndex === 0) {
		noteNum = asyncIndex + 4;
		return "c" + noteNum;
	} else if (funcIndex === 0) {
		noteNum = funcIndex + 4;
		return "c#" + noteNum;
	} else if (commentIndex === 0) {
		return "f" + noteNum;
	} else if (tryIndex === 0) {
		return "eb" + noteNum;
	} else if (exceptIndex === 0) {
		return "e" + noteNum;
	} else if (contextString.indexOf("BLANK") !== -1) {
		return "f#" + noteNum;
	}
	return "g" + noteNum;
}

function countOccurrences(inputString: string, substring: string): number {
	let count = 0;
	let index = inputString.indexOf(substring);

	while (index !== -1) {
		count++;
		index = inputString.indexOf(substring, index + 1);
	}

	return count;
}
