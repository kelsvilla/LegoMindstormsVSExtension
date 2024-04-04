import { CommandEntry } from "./commandEntry";
import { outputMessage, outputErrorMessage, returnIndent } from "./text";
import { TextEditor, window, Position, InputBoxOptions } from "vscode";

export const voicetotextCommands: CommandEntry[] = [
	{
		name: "mind-reader.insertIfLadder",
		callback: insertIfLadder,
	},
	{
		name: "mind-reader.insertIfElseLadder",
		callback: insertIfElseLadder,
	},
	{
		name: "mind-reader.insertForLoop",
		callback: insertForLoop,
	},
	{
		name: "mind-reader.insertForNumberLoop",
		callback: insertForNumberLoop,
	},
	{
		name: "mind-reader.insertNestedForLoop",
		callback: insertNestedForLoop,
	},
	{
		name: "mind-reader.insertNestedForNumberLoop",
		callback: insertNestedForNumberLoop,
	},
	{
		name: "mind-reader.insertTryLadder",
		callback: insertTryLadder,
	},
	{
		name: "mind-reader.insertev3Import",
		callback: insertev3Import,
	},
	{
		name: "mind-reader.insertWhileLoop",
		callback: insertWhileLoop,
	},
	{
		name: "mind-reader.insertDoWhileLoop",
		callback: insertDoWhileLoop,
	},
];

// Write if ladder to text editor
function insertIfLadder(): void {
	// Only effect current open text editor
	const editor: TextEditor | undefined = window.activeTextEditor;
	// If editor is defined
	if (editor) {
		// Handle current indentation
		let indentlevel = returnIndent();
		let indenthandler = "";
		for (let i = 0; i < Number(indentlevel); i++) {
			indenthandler = indenthandler + "\t";
		}
		// Set text to add
		let text =
			"\n" +
			indenthandler +
			"if (val1 == 0):\n" +
			indenthandler +
			"\tif (val2 == 0):\n" +
			indenthandler +
			"\t\tif (val3 == 0):\n" +
			indenthandler +
			'\t\t\tprint("action")\n' +
			indenthandler +
			"\t\telse:\n" +
			indenthandler +
			'\t\t\tprint("action")\n' +
			indenthandler +
			"\telse:\n" +
			indenthandler +
			'\t\tprint("action")\n' +
			indenthandler +
			"else:\n" +
			indenthandler +
			'\tprint("action")';
		// Insert created text
		editor.edit((editBuilder) => {
			editBuilder.insert(editor.selection.active, text);
		});
		outputMessage(
			"Created if ladder using val 1, 2, and 3.",
		);
	}
	// Editor is not defined
	else {
		outputErrorMessage("No document currently active");
	}
}

// Write if else ladder to text editor
function insertIfElseLadder(): void {
	// Only effect current open text editor
	const editor: TextEditor | undefined = window.activeTextEditor;
	// If editor is defined
	if (editor) {
		// Handle current indentation
		let indentlevel = returnIndent();
		let indenthandler = "";
		for (let i = 0; i < Number(indentlevel); i++) {
			indenthandler = indenthandler + "\t";
		}
		// Set text to add
		let text =
			"\n" +
			indenthandler +
			"if (val1 == 0):\n" +
			indenthandler +
			'\tprint("action")\n' +
			indenthandler +
			"elif (val1 == 1):\n" +
			indenthandler +
			'\tprint("action")\n' +
			indenthandler +
			"else:\n" +
			indenthandler +
			'\tprint("action")';
		// Insert created text
		editor.edit((editBuilder) => {
			editBuilder.insert(editor.selection.active, text);
		});
		outputMessage(
			"Created if else ladder with options for value 1 of either 0 or 1.",
		);
	} else {
		// Editor is not defined
		outputErrorMessage("No document currently active");
	}
}

// Write for loop to text editor
function insertForLoop(): void {
	// Only effect current open text editor
	const editor: TextEditor | undefined = window.activeTextEditor;
	// If editor is defined
	if (editor) {
		// Handle current indentation
		let indentlevel = returnIndent();
		let indenthandler = "";
		for (let i = 0; i < Number(indentlevel); i++) {
			indenthandler = indenthandler + "\t";
		}
		// Set text to add
		let text =
			"\n" +
			indenthandler +
			"for i in forlist:\n" +
			indenthandler +
			"\tprint(i)";
		// Insert created text
		editor.edit((editBuilder) => {
			editBuilder.insert(editor.selection.active, text);
		});
		outputMessage(
			"Created for loop through all members of list called for list.",
		);
	} else {
		// Editor is not defined
		outputErrorMessage("No document currently active");
	}
}

// Write for number loop to text editor
async function insertForNumberLoop(): Promise<void> {
	// Only effect current open text editor
	const editor: TextEditor | undefined = window.activeTextEditor;
	let start = 0;
	let end = 10;
	let increment = 1;
	const reg = new RegExp("^[0-9]+$");
	// Prompt user for input
	let options: InputBoxOptions = {
		prompt: "Loop Number:",
		placeHolder: "How many loops.",
		validateInput: (number) => {
			return reg.test(number) ? null : "Must be a number.";
		},
	};
	await window.showInputBox(options).then((value) => {
		if (!value) {
			return;
		}
		end = +value;
	});
	// If editor is defined
	if (editor) {
		// Handle current indentation
		let indentlevel = returnIndent();
		let indenthandler = "";
		for (let i = 0; i < Number(indentlevel); i++) {
			indenthandler = indenthandler + "\t";
		}
		// Set text to add
		let text =
			"\n" +
			indenthandler +
			"for i in range(" +
			start +
			"," +
			end +
			"," +
			increment +
			"):\n" +
			indenthandler +
			"\tprint(i)";
		// Insert created text
		editor.edit((editBuilder) => {
			editBuilder.insert(editor.selection.active, text);
		});
		let output = "Created for loop from 0 to " + end + ".";
		outputMessage(output);
	} else {
		// Editor is not defined
		outputErrorMessage("No document currently active");
	}
}

// Write nested for loop to text editor
function insertNestedForLoop(): void {
	// Only effect current open text editor
	const editor: TextEditor | undefined = window.activeTextEditor;
	// If editor is defined
	if (editor) {
		// Handle current indentation
		let indentlevel = returnIndent();
		let indenthandler = "";
		for (let i = 0; i < Number(indentlevel); i++) {
			indenthandler = indenthandler + "\t";
		}
		// Set text to add
		let text =
			"\n" +
			indenthandler +
			"for i in forlist:\n" +
			indenthandler +
			"\tfor j in forlist2:\n" +
			indenthandler +
			"\t\tprint(i)\n" +
			indenthandler +
			"\tprint(j)";
		// Insert created text
		editor.edit((editBuilder) => {
			editBuilder.insert(editor.selection.active, text);
		});
		outputMessage(
			"Created nested for loop through all members of for list and for list 2.",
		);
	} else {
		// Editor is not defined
		outputErrorMessage("No document currently active");
	}
}

// Write nested for range number to text editor
async function insertNestedForNumberLoop(): Promise<void> {
	// Only effect current open text editor
	const editor: TextEditor | undefined = window.activeTextEditor;
	let start1 = 0;
	let end1 = 10;
	let increment1 = 1;
	let start2 = 0;
	let end2 = 10;
	let increment2 = 1;
	const reg = new RegExp("^[0-9]+$");
	// Prompt user for input
	let options: InputBoxOptions = {
		prompt: "Outer Loop Number:",
		placeHolder: "How many outer loops.",
		validateInput: (number) => {
			return reg.test(number) ? null : "Must be a number.";
		},
	};
	await window.showInputBox(options).then((value) => {
		if (!value) {
			return;
		}
		end1 = +value;
	});
	// Prompt user for input
	options = {
		prompt: "Inner Loop Number:",
		placeHolder: "How many inner loops.",
		validateInput: (number) => {
			return reg.test(number) ? null : "Must be a number.";
		},
	};
	await window.showInputBox(options).then((value) => {
		if (!value) {
			return;
		}
		end2 = +value;
	});
	// If editor is defined
	if (editor) {
		// Handle current indentation
		let indentlevel = returnIndent();
		let indenthandler = "";
		for (let i = 0; i < Number(indentlevel); i++) {
			indenthandler = indenthandler + "\t";
		}
		// Set text to add
		let text =
			"\n" +
			indenthandler +
			"for i in range(" +
			start1 +
			"," +
			end1 +
			"," +
			increment1 +
			"):\n" +
			indenthandler +
			"\tfor j in range(" +
			start2 +
			"," +
			end2 +
			"," +
			increment2 +
			"):\n" +
			indenthandler +
			"\t\tprint(i)\n" +
			indenthandler +
			"\tprint(j)";
		// Insert created text
		editor.edit((editBuilder) => {
			editBuilder.insert(editor.selection.active, text);
		});
		let output =
			"Created nested for loops, outside from 0 to " +
			end1 +
			", inside from 0 to " +
			end2 +
			".";
		outputMessage(output);
	} else {
		// Editor is not defined
		outputErrorMessage("No document currently active");
	}
}

// Write try ladder to text editor
function insertTryLadder(): void {
	// Only effect current open text editor
	const editor: TextEditor | undefined = window.activeTextEditor;
	// If editor is defined
	if (editor) {
		// Handle current indentation
		let indentlevel = returnIndent();
		let indenthandler = "";
		for (let i = 0; i < Number(indentlevel); i++) {
			indenthandler = indenthandler + "\t";
		}
		// Set text to add
		let text =
			"\n" +
			indenthandler +
			"try:\n" +
			indenthandler +
			'\tprint("Try Action")\n' +
			indenthandler +
			"except FileNotFoundError as e:\n" +
			indenthandler +
			"\tprint(e)\n" +
			indenthandler +
			"except Exception as e:\n" +
			indenthandler +
			"\tprint(e)\n" +
			indenthandler +
			"else:\n" +
			indenthandler +
			'\tprint("On Success Action")\n' +
			indenthandler +
			"finally:\n" +
			indenthandler +
			'\tprint("After Success or Fail")';
		// Insert created text
		editor.edit((editBuilder) => {
			editBuilder.insert(editor.selection.active, text);
		});
		outputMessage(
			"Inserted a try and except ladder for handling exceptions.",
		);
	} else {
		// Editor is not defined
		outputErrorMessage("No document currently active");
	}
}

// Write standard Mindstorm imports to text editor
function insertev3Import(): void {
	// Only effect current open text editor
	const editor: TextEditor | undefined = window.activeTextEditor;
	// If editor is defined
	if (editor) {
		// Set text to add
		let text =
			"#!/usr/bin/env pybricks-micropython\n\n" +
			"from pybricks import ev3brick as brick\n" +
			"from pybricks.ev3devices import Motor, TouchSensor, ColorSensor, InfraredSensor, UltrasonicSensor, GyroSensor\n" +
			"from pybricks.parameters import Port, Stop, Direction, Button, Color, SoundFile, ImageFile, Align\n" +
			"from pybricks.tools import print, wait, StopWatch\n" +
			"from pybricks.robotics import DriveBase\n\n" +
			"import math\n\n" +
			"left_motor = Motor(Port.B)\n" +
			"right_motor = Motor(Port.C)\n" +
			"wheel_diameter = 56\n" +
			"axle_track = 118\n\n" +
			"evmsbrick = DriveBase(left_motor, right_motor, wheel_diameter, axle_track)\n\n";
		// Insert created text
		editor.edit((editBuilder) => {
			editBuilder.insert(new Position(0, 0), text);
		});
		outputMessage(
			"Inserted standard ev3 imports and basics for use with robot systems.",
		);
	} else {
		// Editor is not defined
		outputErrorMessage("No document currently active");
	}
}

// Write while loop to text editor
function insertWhileLoop(): void {
	// Only effect current open text editor
	const editor: TextEditor | undefined = window.activeTextEditor;
	// If editor is defined
	if (editor) {
		// Handle current indentation
		let indentlevel = returnIndent();
		let indenthandler = "";
		for (let i = 0; i < Number(indentlevel); i++) {
			indenthandler = indenthandler + "\t";
		}
		// Set text to add
		let text =
			"\n" +
			indenthandler +
			"whiledone = False\n" +
			indenthandler +
			"while whiledone != True:\n" +
			indenthandler +
			'\tprint("Action")';
		// Insert created text
		editor.edit((editBuilder) => {
			editBuilder.insert(editor.selection.active, text);
		});
		outputMessage(
			"Created while loop that will run until variable while done is false.",
		);
	} else {
		// Editor is not defined
		outputErrorMessage("No document currently active");
	}
}

// Write do while loop to text editor
function insertDoWhileLoop(): void {
	// Only effect current open text editor
	const editor: TextEditor | undefined = window.activeTextEditor;
	// If editor is defined
	if (editor) {
		// Handle current indentation
		let indentlevel: Number = returnIndent();
		let indenthandler = "";
		for (let i = 0; i < Number(indentlevel); i++) {
			indenthandler = indenthandler + "\t";
		}
		// Set text to add
		let text =
			"\n" +
			indenthandler +
			"breakervar = False\n" +
			indenthandler +
			"while True:\n" +
			indenthandler +
			'\tprint("Action")\n' +
			indenthandler +
			"\tif (breakerVar == True):\n" +
			indenthandler +
			"\t\tbreak";
		// Insert created text
		editor.edit((editBuilder) => {
			editBuilder.insert(editor.selection.active, text);
		});
		outputMessage(
			"Created do while loop that will run until variable breakervar is true.",
		);
	} else {
		// Editor is not defined
		outputErrorMessage("No document currently active");
	}
}
