import * as vscode from "vscode";

import { CommandEntry } from './commandEntry';
import * as jzz from 'jzz';

export const midicommands: CommandEntry [] = [
{
    name: 'mind-reader.soundCuesSwitch',
    callback: soundCuesSwitch,    },
];



let shouldPlayMIDINote = false;

function soundCuesSwitch(){

    shouldPlayMIDINote = !shouldPlayMIDINote;
}

vscode.window.onDidChangeTextEditorSelection(playMidi);

function playMidi(_event: vscode.TextEditorSelectionChangeEvent){
    var output = jzz().openMidiOut();
    //output.send(0x90, 'C#5', 127).wait(500).send(0x90, 'f#5', 127);

    const editor = vscode.window.activeTextEditor;
    if(editor && shouldPlayMIDINote){
        const currentPosition = editor.selection.active;
        const currentLine = editor.document.lineAt(currentPosition.line).text;

        var chordType : string = lineContext(currentLine, currentPosition.line);
        output.note(0, chordType, 127, 550);
    }

}

// Function checking for nested for loop
function lineContext(currentLine: string, currentLineNumber: number): string {
    const editor = vscode.window.activeTextEditor;
    const indentation = currentLine.match(/^\s*/)?.[0] || '';
// Checking for case
    const forIndex = currentLine.indexOf('for');
    if (forIndex !== -1) {
      // Check if the 'for' keyword is indented more than the previous line
        const lines = editor?.document.getText().split('\n') || [];;

        if (currentLineNumber > 0) {
            const previousLine = lines[currentLineNumber - 1];
            const prevForIndex = previousLine.indexOf('for');
            if(prevForIndex !== -1){
                const previousIndentation = previousLine.match(/^\s*/)?.[0] || '';
                if (indentation.length > previousIndentation.length) {
                    return 'd4'; //Returning nested for loop note
                }
            }
        }
        return 'c4'; // Returning regular for loop note
    }
    const ifIndex = currentLine.indexOf('if');
    if(ifIndex !== -1){
        // Check if the 'for' keyword is indented more than the previous line
        const lines = editor?.document.getText().split('\n') || [];;

        if (currentLineNumber > 0) {
            const previousLine = lines[currentLineNumber - 1];
            const prevForIndex = previousLine.indexOf('if');
            if(prevForIndex !== -1){
                const previousIndentation = previousLine.match(/^\s*/)?.[0] || '';
                if (indentation.length > previousIndentation.length) {
                    return 'f4'; //Returning nested for loop note
                }
            }
        }
        return 'e4'; // Returning regular for loop note
    }

    return 'g4';
  }