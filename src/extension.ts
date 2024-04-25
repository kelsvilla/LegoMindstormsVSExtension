import * as vscode from "vscode";
import * as pl from "./pylex";
import CommandNodeProvider from "./commandNodeProvider";
import Logger from "./log";
import { installer } from "./pythonManager";
import path = require("path");
import * as ev3 from "./ev3/src/extension";
import {toggleLineHighlight, highlightDeactivate} from "./commands/lineHighlighter";
import { setShouldSpeak } from "./commands/text";
import {
	accessCommands,
	hubCommands,
	navCommands,
	textCommands,
	voicetotextCommands,
	TTSCommand,
	midicommands,
	lineHighlightercommands,
	voiceCommands
} from "./commands";
import { Configuration } from "./util";

//import { runClient } from "./client";

// Output Logger
const product: string = vscode.workspace
	.getConfiguration("mind-reader")
	.get("productType")!;
const outputChannel = vscode.window.createOutputChannel(product + " Output");
export const logger = new Logger(outputChannel);

let parser: pl.Parser = new pl.Parser();
export const rootDir = path.dirname(__filename);
export function activate(context: vscode.ExtensionContext) {
	let config = new Configuration(context);

	//python packages installer
	installer();

	//runClient(serverModule);

	parser.parse("Beep Boop");

	const allCommands = [
		accessCommands,
		hubCommands,
		navCommands,
		textCommands,
		TTSCommand,
		midicommands,
		lineHighlightercommands,
		voiceCommands,
	].flat(1);

	voicetotextCommands.forEach((command) => {
		context.subscriptions.push(
			vscode.commands.registerTextEditorCommand(
				command.name,
				command.callback,
			),
		);
	});

	// Register Commands
	allCommands.forEach((command) => {
		context.subscriptions.push(
			vscode.commands.registerCommand(command.name, command.callback),
		);
	});

	let accessProvider = new CommandNodeProvider(
		[accessCommands].flat(1),
	);
	vscode.window.registerTreeDataProvider("accessActions", accessProvider);

	let textProvider = new CommandNodeProvider(
		[textCommands, lineHighlightercommands].flat(1)
	);
	vscode.window.registerTreeDataProvider("textActions", textProvider);

	let hubProvider = new CommandNodeProvider(hubCommands);
	vscode.window.registerTreeDataProvider("hubActions", hubProvider);

	ev3.activate(context);
	toggleLineHighlight();
	setShouldSpeak();

	vscode.window.showInformationMessage("Mind Reader finished loading!");
}

const ttsStatusBar: vscode.StatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    1000
  );
  ttsStatusBar.command = "mind-reader.toggleTTS";
  ttsStatusBar.text = "$(megaphone) Text-to-Speech";
  ttsStatusBar.show();

  const soundStatusBar: vscode.StatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    1000
  );
  soundStatusBar.command = "mind-reader.toggleSoundCues";
  soundStatusBar.text = "$(music) Sound Cues";
  soundStatusBar.show();

export function deactivate() {}
highlightDeactivate();
