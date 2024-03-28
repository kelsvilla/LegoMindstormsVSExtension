import * as vscode from "vscode";
import * as path from "path";
//import HubManager from "../hubManager";
import HubManager3 from "../primeManager3";

//import EV3Manager from '../ev3Manager';

import { CommandEntry } from "./commandEntry";

export const hubCommands: CommandEntry[] = [
	{
		name: "mind-reader.connectHub",
		callback: connectHub,
	},

	{
		name: "mind-reader.disconnectHub",
		callback: disconnectHub,
	},

	{
		name: "mind-reader.uploadCurrentFile",
		callback: uploadCurrentFile,
	},

	{
		name: "mind-reader.runProgram",
		callback: runProgram,
	},

	{
		name: "mind-reader.stopExecution",
		callback: stopExecution,
	},

	{
		name: "mind-reader.deleteProgram",
		callback: deleteProgram,
	},
	{
		name: "mind-reader.ctrlC",
		callback: () => {
			hub?.port.write("\x03");
		},
	},
	{
		name: "mind-reader.ctrlD",
		callback: () => {
			hub?.port.write("\x04");
		},
	},
	{
		name: "mind-reader.ctrlB",
		callback: () => {
			hub?.port.write("\x02");
		},
	},
	{
		name: "mind-reader.ctrlE",
		callback: () => {
			hub?.port.write("\x05");
		},
	},
	/*,
  {
    name: 'mind-reader.ev3.test',
    callback: ev3test
  }*/
];

// Current connected hub
let hub: HubManager3 | null = null;

/*let ev3: EV3Manager | null = null;

async function ev3test(): Promise<void> {
  ev3 = await EV3Manager.activate();
  ev3.test();
}*/

async function connectHub(): Promise<void> {
	if (hub && hub.isOpen()) {
		vscode.window.showWarningMessage(
			"LEGO Hub is already connected, reconnecting...",
		);
		disconnectHub();
	}

	try {
		const ports = await HubManager3.queryPorts();

		if (ports.length === 0) {
			vscode.window.showErrorMessage(
				"No ports found. Is the LEGO Hub connected?",
			);
			return;
		}

		let portPath: string | undefined = vscode.workspace
			.getConfiguration("mind-reader.connection")
			.get("portPath");

		if (!portPath) {
			let slots: vscode.QuickPickItem[] = [];
			for (const port of ports) {
				slots.push({ label: port.path });
			}

			let picked = await vscode.window.showQuickPick(slots);

			if (!picked) {
				return;
			}

			portPath = picked.label;
		}
		hub = await HubManager3.create(portPath);
		vscode.window.showInformationMessage("LEGO Hub connected");
	} catch (err) {
		vscode.window.showErrorMessage("Could not connect to LEGO Hub");
	}
}

async function disconnectHub(): Promise<void> {
	if (!hub || !hub.isOpen()) {
		vscode.window.showErrorMessage("LEGO Hub is not connected");
		return;
	}

	await hub.close();
	hub = null;
	vscode.window.showInformationMessage("LEGO Hub disconnected");
}

function runProgram(): void {
	throw new Error("Function not implemented.");
}

function stopExecution(): void {
	hub?.writeLine();
}

function deleteProgram(): void {
	throw new Error("Function not implemented.");
}

async function uploadCurrentFile(): Promise<void> {
	if (!hub || !hub.isOpen()) {
		vscode.window.showErrorMessage("LEGO Hub is not connected!");
		return;
	}

	if (!vscode.window.activeTextEditor) {
		vscode.window.showErrorMessage("No active text editor");
		return;
	}

	const currentFilePath = vscode.window.activeTextEditor.document.fileName;

	if (currentFilePath) {
		// construct quickpick
		const slots: vscode.QuickPickItem[] = [];
		for (let i = 0; i < 10; i++) {
			slots.push({ label: i.toString() });
		}
		const slotID = await vscode.window.showQuickPick(slots, {
			canPickMany: false,
		});

		if (!slotID) {
			return;
		}

		// TODO: progress bar?
		vscode.window.showInformationMessage("Uploading current file");
		await hub.uploadFile(
			currentFilePath,
			parseInt(slotID.label) < 10 ? `0${slotID.label}` : slotID.label,
			path.basename(currentFilePath),
		);
		vscode.window.showInformationMessage(
			path.basename(currentFilePath) +
				" uploaded to slot " +
				slotID.label,
		);
	}
}

// // TODO: find empty slots
// async function runProgram(): Promise<void> {
// 	if (!hub || !hub.isOpen()) {
// 		vscode.window.showErrorMessage("LEGO Hub is not connected!");
// 		return;
// 	}

// 	const slots: vscode.QuickPickItem[] = [];
// 	// construct quickpick
// 	for (let i = 0; i < 10; i++) {
// 		slots.push({ label: i.toString() });
// 	}
// 	const slotID = await vscode.window.showQuickPick(slots, {
// 		canPickMany: false,
// 	});

// 	if (!slotID) {
// 		return;
// 	}

// 	vscode.window.showInformationMessage("Running program " + slotID.label);
// 	await hub.programExecute(parseInt(slotID.label));
// }

// async function stopExecution(): Promise<void> {
// 	if (!hub || !hub.isOpen()) {
// 		vscode.window.showErrorMessage("LEGO Hub is not connected!");
// 		return;
// 	}

// 	await hub.programTerminate();
// 	vscode.window.showInformationMessage("Execution stopped");
// }

// // TODO: find slots from status
// async function deleteProgram(): Promise<void> {
// 	if (!hub || !hub.isOpen()) {
// 		vscode.window.showErrorMessage("LEGO Hub is not connected!");
// 		return;
// 	}

// 	const slots: vscode.QuickPickItem[] = [];
// 	// construct quickpick
// 	for (let i = 0; i < 10; i++) {
// 		slots.push({ label: i.toString() });
// 	}
// 	const slotID = await vscode.window.showQuickPick(slots, {
// 		canPickMany: false,
// 	});

// 	if (!slotID) {
// 		return;
// 	}

// 	await hub.deleteProgram(parseInt(slotID.label));
// 	vscode.window.showInformationMessage("Deleted program " + slotID.label);
// }
