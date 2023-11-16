import * as vscode from "vscode";

import { CommandEntry } from './commandEntry';
import * as jzz from 'jzz';

export const midicommands: CommandEntry [] = [
{
    name: 'mind-reader.playMidi',
    callback: playMidi,    },
];

function playMidi(){
    var output = jzz().openMidiOut();
    //output.send(0x90, 'C#5', 127).wait(500).send(0x90, 'f#5', 127);

    const editor = vscode.window.activeTextEditor;
    if(editor){
        const currentPosition = editor.selection.active;
        const currentLine = editor.document.lineAt(currentPosition.line).text;

        if(isNestedForLoop(currentLine, currentPosition.line)){
            output.send(0x90, 'd#4', 127);
        }
        else if (isRegularForLoop(currentLine)){
        output.send(0x90, 'c#4', 127);
        }
    }

}

// Function checking for nested for loop
function isNestedForLoop(currentLine: string, currentLineNumber: number): boolean {
    const indentation = currentLine.match(/^\s*/)?.[0] || '';
    const forIndex = currentLine.indexOf('for');
    const editor = vscode.window.activeTextEditor;
    if (forIndex !== -1) {
      // Check if the 'for' keyword is indented more than the previous line
        const lines = editor?.document.getText().split('\n') || [];;

        if (currentLineNumber > 0) {
            const previousLine = lines[currentLineNumber - 1];
            const prevForIndex = previousLine.indexOf('for');
            if(prevForIndex !== -1){
                const previousIndentation = previousLine.match(/^\s*/)?.[0] || '';
                if (indentation.length > previousIndentation.length) {
                    return true;
                }
            }
      }
    }

    return false;
  }

// Function testing for regular for loop
function isRegularForLoop(line: string): boolean {

    return line.includes('for');

}
