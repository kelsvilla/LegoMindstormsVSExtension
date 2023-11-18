import { TextEditorSelectionChangeEvent, window, workspace } from "vscode";
import pl     = require("../pylex");
import { CommandEntry } from './commandEntry';
import * as jzz from 'jzz';

export const midicommands: CommandEntry [] = [
{
    name: 'mind-reader.toggleSoundCues',
    callback: toggleSoundCues,    },
];

//TODO: Create hotkey for activating audio cues

let shouldPlayMIDINote = false;

function toggleSoundCues(){
    shouldPlayMIDINote = !shouldPlayMIDINote;
}

window.onDidChangeTextEditorSelection(playerContext);

function playMidi(contextString: string){
    var output = jzz().openMidiOut();
    var chordType : string = lineContext(contextString);
    //window.showInformationMessage(contextString);
    output.note(0, chordType, 127, 550);
}

function playerContext(_event: TextEditorSelectionChangeEvent){
    const editor = window.activeTextEditor;

    if (editor && shouldPlayMIDINote) {
        // current text and line number
        const editorText: string    = editor.document.getText();
        const line      : number    = editor.selection.active.line;
        // get tab info settings
        const size      : number    = typeof editor.options.tabSize === 'number'? editor.options.tabSize: 4;
        const hard      : boolean   = !editor.options.insertSpaces;
        // initialize parser
        const parser    : pl.Parser = new pl.Parser(editorText, {
            size,
            hard
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
        throw new Error('Cannot create context string for empty context');
    }

    let contextString: string = ``; // 1 based
    // Print the current line
    if (context[0].token && context[0].token.attr) {
        let tokenTypeString: string = `${context[0].token.type.toString()}`;
        contextString += `${tokenTypeString !== pl.PylexSymbol.STATEMENT?tokenTypeString:""
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



// Function checking for nested for loop
function lineContext(contextString: string): string {
// Checking for case
    const forIndex = contextString.indexOf('for');
    var forCount = countOccurrences(contextString, 'for');

    const ifIndex = contextString.indexOf('if');

    if(forIndex !== -1){
        if(forIndex === 0){
            let noteNum = forCount + 2;
            return 'a' + noteNum;
        }
    }
    if(ifIndex !== -1){
        if(ifIndex === 1){
            let noteNum = ifIndex + 2;
            return 'b' + noteNum;
        }
    }
    return 'g4';
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

