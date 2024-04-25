import * as WebSocket from "ws";
import * as vscode from "vscode";
import * as path from "path";
var os = require("os");
const { spawn } = require("child_process");
import { rootDir } from "./extension";
import { outputMessage, outputErrorMessage } from "./commands/text";
import {
	accessCommands,
	hubCommands,
	navCommands,
	textCommands,
	voicetotextCommands,
	TTSCommand,
	midicommands,
	lineHighlightercommands,
} from "./commands";

const allCommands = [
	accessCommands,
	hubCommands,
	navCommands,
	textCommands,
	TTSCommand,
	midicommands,
	lineHighlightercommands,
].flat(1);

let server: any;

function activateVoiceServer() {
	//activate server
	//Gets expected path of virtual python interpretor, which is $ROOTDIR/voice-server-setup/venv/{bin | Scripts}/python
	const normalizedProjectRoot = path
		.normalize(rootDir)
		.replace(`${path.sep}out`, "");
	const interpretor = path.join(
		normalizedProjectRoot,
		`voice-server-setup`,
		"venv",
		`${os.type() === "Darwin" ? "bin" : "Scripts"}`,
		"python",
	);
	const defaults = {
		cwd: normalizedProjectRoot,
		env: {
			...process.env,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			SPACY_DATA: path.join(
				normalizedProjectRoot,
				"dependencies",
				"spacy_data",
			),
		},
		stdio: [
			"pipe", // Use parent's stdin for child.
			"pipe", // Pipe child's stdout to parent.
			"pipe", // pipe child's stderr to a parent.
		],
	};
	//start voice server
	const server = spawn(interpretor, ["server.py"], defaults);
	outputMessage("Server Started");
	return server;
}

function runClient(commandHistory: string[]) {
	let socket: WebSocket | null = null;
	const socketPort = 12152;
	socket = new WebSocket(`ws://localhost:${socketPort}`);
	console.log("[client] socket created .. ");

	socket.addEventListener("open", (event) => {
		console.log("[client] is ready to communicate..", event.target.OPEN);
	});

	socket.on("message", async (message) => {
		if (message.toString() !== "Shutting down voice commands.") {
			if (message.toString().split(",").length !== 2) {
				return; //Ensures both vars below will be defined with some value
			}
			const [cmdName, logMsg] = message.toString().split(",");
			try {
				if (cmdName === "undo") {
					if (commandHistory.length > 0) {
						//Get last command and undo it. We don't care whether the command is there or has an undo function, just continue in that case.
						const lastCommand = commandHistory.pop();
						allCommands.find((command)=>command.name === lastCommand)?.undo?.();
					}
				} else if (cmdName !== "") {
					await vscode.commands.executeCommand(cmdName);
					commandHistory.push(cmdName);
					outputMessage(logMsg);
				} else {
					for (const log of logMsg.split("\n")) {
						console.log(log);
						await outputMessage(log);
					}
				}
			} catch (e) {
				outputMessage(
					"Action Cannot be Completed!",
				);
				console.log(e);
			}
		} else {
			server.kill();
			server = undefined;
			outputMessage("Exiting Voice Commands.");
		}
	});
}

export function toggleStreaming() {
	//if server is already running, kill and return
	if(server) {
		server.kill();
		server = undefined;
		outputMessage("Voice Commands Stopped.");
		return;
	}
	
	/* activate the voice server */
	server = activateVoiceServer();
	const commandHistory: string[] = [];

	server.on("exit", (code: any) => {
		server = undefined;
	})

	//stderr -> vscode error
	server.stderr.on("data", (err: any) => {
		console.log("error: ", err.toString());
		outputErrorMessage(err.toString());
	});
	//child stdout -> vscode info
	server.stdout.on("data", (data: any) => {
		console.log("python message: ", data.toString());
		//server ready for connection
		var serverMsg = data.toString();
		if (data.toString() === serverMsg) {
			//start client
			console.log("server is ready..");
			runClient(commandHistory);
			console.log(commandHistory);
		} else {
			console.log("server not ready yet");
			console.log(serverMsg);
		}
		outputMessage(data.toString());
	});
}
