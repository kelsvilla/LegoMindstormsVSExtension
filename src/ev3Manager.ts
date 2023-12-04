import * as vscode from "vscode";
//import * as fs from 'fs';
//import { logger } from './extension';

export default class EV3Manager {
	private ev3devBrowser: vscode.Extension<any> | undefined =
		vscode.extensions.getExtension("ev3dev.ev3dev-browser");

	private constructor() {}
	public test() {
		//console.log(this.ev3devBrowser);
		// This seems to be the only thing we, as an extension,
		// are allowed to do with this other extension.
		vscode.commands.executeCommand("ev3devBrowser.action.pickDevice", null);
	}
	public static activate(): Promise<EV3Manager> {
		return new Promise(async (resolve) => {
			try {
				let mgr = new EV3Manager();
				// Wait for ev3devBrowser to start
				await mgr.ev3devBrowser?.activate();
				// Return ev3Manager
				return resolve(mgr);
			} catch (err) {
				throw err;
			}
		});
	}
}
