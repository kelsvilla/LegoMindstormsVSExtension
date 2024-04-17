import * as vscode from "vscode";
import * as path from "path";
import HubManager3 from "../primeManager3";
import HubManager from "../hubManager";
import { outputMessage, outputErrorMessage, outputWarningMessage } from "./text";
//import EV3Manager from '../ev3Manager';

import { CommandEntry } from "./commandEntry";
import EV3Manager from "../ev3Manager";

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
	}
];

// Current connected hub
let hub: HubManager3 | HubManager | null = null;

async function connectHub(): Promise<void> {
	if (hub && hub.isOpen()) {
		outputWarningMessage(
			"LEGO Hub is already connected, reconnecting...",
		);
		disconnectHub();
	}

	try {
		vscode.window.showErrorMessage("Not Yet Implemented")
		return
		//Want to programmatically determine if Spike V2 or V3. EV3 should be easy
		const ports = await HubManager.queryPorts();

		if (ports.length === 0) {
			outputErrorMessage(
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
		outputMessage("LEGO Hub connected");
	} catch (err) {
		outputErrorMessage("Could not connect to LEGO Hub");
	}
}

async function disconnectHub(): Promise<void> {
	if (!hub || !hub.isOpen()) {
		outputErrorMessage("LEGO Hub is not connected");
		return;
	}

	await hub.close();
	hub = null;
	outputMessage("LEGO Hub disconnected");
}

async function uploadCurrentFile(): Promise<void> {
	if (!hub || !hub.isOpen()) {
		outputErrorMessage("LEGO Hub is not connected!");
		return;
	}

	if (!vscode.window.activeTextEditor) {
		outputErrorMessage("No active text editor");
		return;
	}

	const currentFilePath = vscode.window.activeTextEditor.document.fileName;
	if(hub instanceof HubManager || hub instanceof HubManager3) {
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
			outputMessage("Uploading current file");
			if(hub instanceof HubManager) {
				await hub.uploadFile(
					currentFilePath,
					parseInt(slotID.label),
					path.basename(currentFilePath),
				);
			} else {
				await hub.uploadFile(
					currentFilePath,
					parseInt(slotID.label) < 10 ? `0${slotID.label}` : slotID.label,
					path.basename(currentFilePath),
				);
			}
			outputMessage(
				path.basename(currentFilePath) +
					" uploaded to slot " +
					slotID.label,
			);
		}
	} else {
		vscode.window.showInformationMessage("Not Yet Implemented")
		return;
	}
}

// TODO: find empty slots
async function runProgram(): Promise<void> {
	if (!hub || !hub.isOpen()) {
		outputErrorMessage("LEGO Hub is not connected!");
		return;
	}
	if(hub instanceof HubManager || hub instanceof HubManager3) {
		const slots: vscode.QuickPickItem[] = [];
		// construct quickpick
		for (let i = 0; i < 10; i++) {
			slots.push({ label: i.toString() });
		}
		const slotID = await vscode.window.showQuickPick(slots, {
			canPickMany: false,
		});
	
		if (!slotID) {
			return;
		}
	
		outputMessage("Running program " + slotID.label);
		await hub.programExecute(parseInt(slotID.label));
	} else {
		vscode.window.showErrorMessage("Not Yet Implemented")
	}
}

async function stopExecution(): Promise<void> {
	if (!hub || !hub.isOpen()) {
		outputErrorMessage("LEGO Hub is not connected!");
		return;
	}
	if(hub instanceof HubManager || hub instanceof HubManager3) {
		await hub.programTerminate();
	}
	outputMessage("Execution stopped");
}

// TODO: find slots from status
async function deleteProgram(): Promise<void> {
	if (!hub || !hub.isOpen()) {
		outputErrorMessage("LEGO Hub is not connected!");
		return;
	}
	if(hub instanceof HubManager || hub instanceof HubManager3) {
		const slots: vscode.QuickPickItem[] = [];
		// construct quickpick
		for (let i = 0; i < 10; i++) {
			slots.push({ label: i.toString() });
		}
		const slotID = await vscode.window.showQuickPick(slots, {
			canPickMany: false,
		});
	
		if (!slotID) {
			return;
		}
	
		await hub.deleteProgram(parseInt(slotID.label));
		outputMessage("Deleted program " + slotID.label);
	} else {
		vscode.window.showErrorMessage("Not Yet Implemented")
	}
}
