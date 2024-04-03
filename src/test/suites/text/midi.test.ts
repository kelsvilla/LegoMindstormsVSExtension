import * as assert from "assert";
import * as vscode from "vscode";
import { after } from "mocha";
import { lineContext, toggleSoundCues } from '../../../commands/midi';


suite("Midi test suite", () => {
    after(() => {
        vscode.window.showInformationMessage("All tests passed!");
    });

    test('Toggle sound cues', () => {
        let isActivated = false;
        isActivated = toggleSoundCues();
        assert.equal(true, isActivated);
        isActivated = toggleSoundCues();
        assert.equal(false, isActivated);
    });
    test("Get for note", () => {
        let currNote = lineContext("for");
        assert.equal('b3', currNote);
        currNote = lineContext('for if');
        assert.equal('b4', currNote);
    });

    test('Get while note', () => {
        let currNote = lineContext('while');
        assert.equal('d3', currNote);
        currNote = lineContext('while if');
        assert.equal('d4', currNote);
    });
    test('Get if note', () => {
        let currNote = lineContext('if');
        assert.equal('g#3', currNote);
        currNote = lineContext('if for');
        assert.equal('g#4', currNote);
    });
    test('Get else note', () => {
        let currNote = lineContext('else');
        assert.equal('a#3', currNote);
        currNote = lineContext('else if');
        assert.equal('a#4', currNote);
    });
    test('Get elif note', () => {
        let currNote = lineContext('elif');
        assert.equal('a3', currNote);
        currNote = lineContext('elif for');
        assert.equal('a4', currNote);
    });
    test('Get async note', () => {
        let currNote = lineContext('async');
        assert.equal('c4', currNote);
    });
    test('Get function note', () => {
        let currNote = lineContext('function');
        assert.equal('c#4', currNote);
    });
    test('Get try note', () => {
        let currNote = lineContext('try');
        assert.equal('eb2', currNote);
        currNote = lineContext('try if');
        assert.equal('eb3', currNote);
    });
    test('Get except note', () => {
        let currNote = lineContext('except');
        assert.equal('e2', currNote);
        currNote = lineContext('except if');
        assert.equal('e3', currNote);
    });
    test('Get comment note', () => {
        let currNote = lineContext('Comment');
        assert.equal('f2', currNote);
        currNote = lineContext('Comment if');
        assert.equal('f3', currNote);
    });
    test('Get empty note', () => {
        let currNote = lineContext('BLANK');
        assert.equal('f#2', currNote);
        currNote = lineContext('BLANK if');
        assert.equal('f#3', currNote);
    });
    test('Get generic note', () => {
        let currNote = lineContext('hello');
        assert.equal('g2', currNote);
        currNote = lineContext('print if');
        assert.equal('g3', currNote);
    });

});