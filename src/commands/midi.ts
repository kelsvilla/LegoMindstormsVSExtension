import { CommandEntry } from './commandEntry';
import * as jzz from 'jzz';

export const midicommands: CommandEntry [] = [
    {
        name: 'mind-reader.playMidi',
        callback: playMidi,    },
];




function playMidi(){
    var output = jzz().openMidiOut();
    output.send(0x90, 'C#5', 127);
}