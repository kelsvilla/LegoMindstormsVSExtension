import * as vscode from "vscode";

export default class Logger {
	constructor(public readonly outputChannel: vscode.OutputChannel) {}

	public log(text: string): void {
		this.outputChannel.appendLine(text);
	}

	public info(text: string): void {
		this.outputChannel.appendLine("[INFO]\r" + text);
	}

	public warn(text: string): void {
		this.outputChannel.appendLine("[WARNING]\r" + text);
	}

	public error(text: string): void {
		this.outputChannel.appendLine("[ERROR]\r" + text);
	}
}
