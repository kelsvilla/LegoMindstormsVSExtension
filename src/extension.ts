import * as vscode from "vscode";
import * as pl from "./pylex";
import CommandNodeProvider from "./commandNodeProvider";
import Logger from "./log";
import { installer } from "./pythonManager";
import path = require("path");
import {toggleLineHighlight, highlightDeactivate} from "./commands/lineHighlighter";
import { setShouldSpeak } from "./commands/text";

import {
	accessCommands,
	hubCommands,
	navCommands,
	textCommands,
	voicetotextCommands,
	midicommands,
	lineHighlightercommands
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
		midicommands,
		lineHighlightercommands
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
		[accessCommands, textCommands, midicommands].flat(1),
	);
	vscode.window.registerTreeDataProvider("accessActions", accessProvider);

	let hubProvider = new CommandNodeProvider(hubCommands);
	vscode.window.registerTreeDataProvider("hubActions", hubProvider);

	toggleLineHighlight();
	setShouldSpeak();

	vscode.window.showInformationMessage("Mind Reader finished loading!");
}

export function deactivate() {}
highlightDeactivate();
