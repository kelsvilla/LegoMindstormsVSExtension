import * as vscode from "vscode";

import { CommandEntry } from "./commandEntry";

export const navCommands: CommandEntry[] = [
	{
		name: "mind-reader.openWebview",
		callback: openWebview,
	},
	{
		name: "mind-reader.openKeybinds",
		callback: () =>
			vscode.commands.executeCommand(
				"workbench.action.openGlobalKeybindings",
				"mind-reader",
			),
	},

	//Navigation Keys......
	// TODO: Why is this here? Extensions can rebind existing keybinds.
	{
		name: "mind-reader.showAllSymbols",
		callback: () =>
			vscode.commands.executeCommand("workbench.action.showAllSymbols"),
	},

	{
		name: "mind-reader.gotoLine",
		callback: () =>
			vscode.commands.executeCommand("workbench.action.gotoLine"),
	},

	{
		name: "mind-reader.quickOpen",
		callback: () =>
			vscode.commands.executeCommand("workbench.action.quickOpen"),
	},

	{
		name: "mind-reader.gotoSymbol",
		callback: () =>
			vscode.commands.executeCommand("workbench.action.gotoSymbol"),
	},

	{
		name: "mind-reader.showProblems",
		callback: () =>
			vscode.commands.executeCommand("workbench.actions.view.problems"),
	},

	{
		name: "mind-reader.nextInFiles",
		callback: () =>
			vscode.commands.executeCommand("editor.action.marker.nextInFiles"),
	},

	{
		name: "mind-reader.prevInFiles",
		callback: () =>
			vscode.commands.executeCommand("editor.action.marker.prevInFiles"),
	},

	{
		name: "mind-reader.showCommands",
		callback: () =>
			vscode.commands.executeCommand("workbench.action.showCommands"),
	},

	{
		name: "mind-reader.quickOpenPreviousRecentlyUsedEditorInGroup",
		callback: () =>
			vscode.commands.executeCommand(
				"workbench.action.quickOpenPreviousRecentlyUsedEditorInGroup",
			),
	},

	{
		name: "mind-reader.navigateBack",
		callback: () =>
			vscode.commands.executeCommand("workbench.action.navigateBack"),
	},

	{
		name: "mind-reader.getQuickInputBack",
		callback: () =>
			vscode.commands.executeCommand("workbench.action.quickInputBack"),
	},

	{
		name: "mind-reader.navigateForward",
		callback: () =>
			vscode.commands.executeCommand("workbench.action.navigateForward"),
	},
];

// COMMAND CALLBACK IMPLEMENTATIONS
function openWebview(): void {
	const panel = vscode.window.createWebviewPanel(
		"mind-reader", // Identifies the type of the webview. Used internally
		"Mind Reader", // Title of the panel displayed to the user
		vscode.ViewColumn.One, // Editor column to show the new webview panel in.
		{},
	); // Webview options. More on these later.

	panel.webview.html = getWebviewContent();
}

function getWebviewContent() {
	return `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Mind Reader</title>
      </head>
      <body>
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6a4XaqHkKcxJ6ZFms1RNrRurcOfl-diW90DAdpAx0Kv-rtrLJXovIhcUpayqFHATkrQ&usqp=CAU" width="600" />
          <p></p>
          <h1>Welcome to Mind Reader!</h1>
          <p>We are the Single Semester Snobs and this is our tool to Help Blind Students Program Lego Mindstorms Robots in Python.</p>
          <ul>
            <li>
              This tool includes features such as a hotkey that says how many spaces in the text starts, an Accessibility Pane,
              Audio Alerts, and an advanced settings window.
              <br>
              The tool has hotkeys for both PC and Mac commands.
            </li>
            <li>This system is intended for everyone, but primarily for students K-12 who are visually impaired. </li>
            <li>
              Our goal is to provide an enhanced experience for students who are visually impaired that is transparent to
              sighted students.
              <br>
              This allows for everyone to use the same software solution, whether or not they are
              vision impaired.
            </li>
          </ul>
          <p>Use the following key binding to bring up a page for all key bindings for windows
          <br>
          Control and Shift and 8
          </p>
          <p>Use this key binding to do the same for mac computers:
          <br>
          Command and Shift and 9
          </p>
          <h2>This is the Lego Spike Prime!</h2z>
          <p></p>
          <img src="https://cdn.vox-cdn.com/thumbor/qoaa6N2ppl7oj97MR-aj43qPy0w=/0x0:1024x576/920x613/filters:focal(431x207:593x369):format(webp)/cdn.vox-cdn.com/uploads/chorus_image/image/63339099/lego_spike.0.png" width="300" />
          <p></p>
          <a href="https://www.lego.com/en-us/product/lego-education-spike-prime-set-45678">Get the robot!</a>
      </body>
      </html>`;
}
