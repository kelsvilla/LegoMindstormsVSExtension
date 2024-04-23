/**
* ? ██╗  ██╗██╗ ██████╗ ██╗  ██╗██╗     ██╗ ██████╗ ██╗  ██╗████████╗      ██╗████████╗
* ? ██║  ██║██║██╔════╝ ██║  ██║██║     ██║██╔════╝ ██║  ██║╚══██╔══╝      ██║╚══██╔══╝
* ? ███████║██║██║  ███╗███████║██║     ██║██║  ███╗███████║   ██║   █████╗██║   ██║
* ? ██╔══██║██║██║   ██║██╔══██║██║     ██║██║   ██║██╔══██║   ██║   ╚════╝██║   ██║
* ? ██║  ██║██║╚██████╔╝██║  ██║███████╗██║╚██████╔╝██║  ██║   ██║         ██║   ██║
* ? ╚═╝  ╚═╝╚═╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝         ╚═╝   ╚═╝
* ! Initial Setup:
* ! Open settings.json (ctrl+shift+p type 'settings' choose: 'Preferences: Open Settings (JSON))
* ! Add the following to the bottom (may have to add a comma to the line above if it's not there, also remove the *s):
* "mind-reader.lineHighlighter.isEnabled"          : true,
* "mind-reader.lineHighlighter.multiLineIsEnabled" : false,
*
* "mind-reader.lineHighlighter.backgroundColor"    : "#232C5C",

* "mind-reader.lineHighlighter.outlineColor"       : "#4866FE",
* "mind-reader.lineHighlighter.outlineWidth"       : "1px",
* "mind-reader.lineHighlighter.outlineStyle"       : "solid",
*
* "mind-reader.lineHighlighter.borderColorTop"     : "#FFFFFF",
* "mind-reader.lineHighlighter.borderColorRight"   : "#FFFFFF",
* "mind-reader.lineHighlighter.borderColorBottom"  : "#FFFFFF",
* "mind-reader.lineHighlighter.borderColorLeft"    : "#FFFFFF",
*
* "mind-reader.lineHighlighter.borderWidthTop"     : "1px",
* "mind-reader.lineHighlighter.borderWidthRight"   : "16px",
* "mind-reader.lineHighlighter.borderWidthBottom"  : "1px",
* "mind-reader.lineHighlighter.borderWidthLeft"    : "1px",
*
* "mind-reader.lineHighlighter.borderStyleTop"     : "solid",
* "mind-reader.lineHighlighter.borderStyleRight"   : "solid",
* "mind-reader.lineHighlighter.borderStyleBottom"  : "solid",
* "mind-reader.lineHighlighter.borderStyleLeft"    : "solid",
*
* "mind-reader.lineHighlighter.fontStyle"          : "normal",
* "mind-reader.lineHighlighter.fontWeight"         : "bolder",
* "mind-reader.lineHighlighter.textDecoration"     : "none",
* "mind-reader.lineHighlighter.textColor"          : "#FFFFFF",
*
**/
"use strict";
import * as fs from "fs";
import * as path from "path";
import { CommandEntry } from "./commandEntry";
import {
	window,
	workspace,
	TextEditorDecorationType,
	WorkspaceConfiguration,
	Range,
} from "vscode";
import * as vscode from "vscode";
import { outputMessage } from "./text";

let highlightStyle: TextEditorDecorationType;
let selectionStyle: TextEditorDecorationType;

/**
 * Trigger for when the active text editor changes
 */
window.onDidChangeActiveTextEditor((editor) => {
	if (!editor) {
		return;
	}

	triggerHighlight();
});

/**
 *  Trigger for when text selection changes
 */
window.onDidChangeTextEditorSelection((editor) => {
	if (!editor.textEditor) {
		return;
	}

	triggerHighlight();
});

/**
 * Trigger for when the text document changes
 */
workspace.onDidChangeTextDocument(() => {
	triggerHighlight();
});

/**
 * Trigger for when the window state changes
 */
window.onDidChangeWindowState((editor) => {
	if (!editor) {
		return;
	}

	triggerHighlight();
});

/**
 * Trigger for when configuration changes
 */
workspace.onDidChangeConfiguration((editor) => {
	if (!editor) {
		return;
	}

	highlightStyle.dispose(); // Dump existing styling
	highlightStyle = getHighlighterStyle(); // get new line highlighter styling
	triggerHighlight(); // trigger highlight with new styling
});

/**
 * main function that triggers the highlights
 */
function triggerHighlight(): void {
	/* Set activeTextEditor to current winow*/
	const activeTextEditor = window.activeTextEditor;

	if (!activeTextEditor) {
		return;
	}

	const isEnabled = getHighlighterStatus();
	const multiLineIsEnabled = getMultiLineHighlighterStatus();

	/* Create array to store decorations for highlight */
	let decorations: { range: Range }[] = [];

	/* If highlight is enabled */
	if (isEnabled) {
		//Get cursor selections
		const selections = activeTextEditor.selections;
		//If multiline highlight is enabled
		if (multiLineIsEnabled) {
			// Create map with full range of selection
			decorations = selections.map((selection) => ({
				range: new Range(selection.start, selection.end),
			}));
		} else {
			// If multi line is not enabled, check if selection is single line
			const isSingleLine = activeTextEditor.selection.isSingleLine;
			if (isSingleLine) {
				// If selection is single line, map selection
				decorations = selections.map((selection) => ({
					range: new Range(selection.start, selection.end),
				}));
			}
		}
	}

	if (highlightStyle) {
		activeTextEditor.setDecorations(highlightStyle, decorations);
		if (selectionStyle) {selectionStyle.dispose();};
		selectionStyle = getHighlighterStyle(true);
		activeTextEditor.setDecorations(selectionStyle, decorations);
	}
}

/**
 * * Function to get the user configured highlighting styles, or use defaults
 *
 * * Designed with user configuration in mind, able to control different sides
 * * independently from each other (in most cases). This allows for many different
 * * configurations.
 *
 * ? Colors Can be input with the following values:
 * * https://www.w3schools.com/cssref/css_colors.asp for string based color values
 * * Hex -> #<value> | rgb(###, ###, ###) | rgba(###, ###, ###, ###) | hsla(##, ##%, ##%, .#)
 *
 * ? Width Input Values
 * ! Some work better than others, if one isn't working try a different method:
 * * thin | medium | thick | px | rem | em | cm
 *
 * ? Other values
 * * font-style    : none|normal|italic|oblique;
 * * font-weight   : none|normal|bold|bolder|lighter|number;
 * * border-style  : none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset;
 * * outline-style : none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset;
 * * outline-width : none|medium|thin|thick|length;
 * * border-width  : none|medium|thin|thick|length;
 * ? https://www.w3schools.com/cssref/pr_text_text-decoration.asp for text-decoration
 *
 * ! borderWidthRight acts weirdly, on my system 16px works best with the other directions set to 1px
 *
 * @returns highlighterStyle
 */
function getHighlighterStyle(
	onlyStyleSelections?: boolean,
): TextEditorDecorationType {
	// Used so we don't have to type out workspace.getConfiguration('mind-reader.lineHighlighter') on every line, ie: shorthand
	const userConfig: WorkspaceConfiguration = workspace.getConfiguration(
		"mind-reader.lineHighlighter",
	);

	if (onlyStyleSelections) {
		return window.createTextEditorDecorationType({
			backgroundColor: userConfig.get("selectionColor") || "#0000FF40",
		});
	}

	const borderWidthTop: string = userConfig.get("borderWidthTop") || "1px";
	const borderWidthRight: string =
		userConfig.get("borderWidthRight") || "16px";
	const borderWidthBottom: string =
		userConfig.get("borderWidthBottom") || "1px";
	const borderWidthLeft: string = userConfig.get("borderWidthLeft") || "1px";

	const borderStyleTop: string = userConfig.get("borderStyleTop") || "solid";
	const borderStyleRight: string =
		userConfig.get("borderStyleRight") || "solid";
	const borderStyleBottom: string =
		userConfig.get("borderStyleBottom") || "solid";
	const borderStyleLeft: string =
		userConfig.get("borderStyleLeft") || "solid";

	const borderColorTop: string =
		userConfig.get("borderColorTop") || "#FFFFFF";
	const borderColorRight: string =
		userConfig.get("borderColorRight") || "#FFFFFF";
	const borderColorBottom: string =
		userConfig.get("borderColorBottom") || "#FFFFFF";
	const borderColorLeft: string =
		userConfig.get("borderColorLeft") || "#FFFFFF";

	const backgroundColor: string =
		userConfig.get("backgroundColor") || "#232C5C";

	const fontStyle: string = userConfig.get("fontStyle") || "normal";
	const fontWeight: string = userConfig.get("fontWeight") || "bolder";
	const outlineColor: string = userConfig.get("outlineColor") || "#4866FE";
	const outlineStyle: string = userConfig.get("outlineStyle") || "solid";
	const outlineWidth: string = userConfig.get("outlineWidth") || "1px";
	const textColor: string = userConfig.get("textColor") || "#FFFFFF";
	const textDecoration: string = userConfig.get("textDecoration") || "none";

	// Combine all our styling into a single variable to return
	const highlighterStyle: TextEditorDecorationType =
		window.createTextEditorDecorationType({
			isWholeLine: !onlyStyleSelections,
			backgroundColor: onlyStyleSelections
				? "#0000FF40"
				: `${backgroundColor}`,
			fontStyle: `${fontStyle}`,
			fontWeight: `${fontWeight}`,
			color: `${textColor}`,
			borderColor: `${borderColorTop} ${borderColorRight} ${borderColorBottom} ${borderColorLeft}`,
			borderWidth: `${borderWidthTop} ${borderWidthRight} ${borderWidthBottom} ${borderWidthLeft}`,
			borderStyle: `${borderStyleTop} ${borderStyleRight} ${borderStyleBottom} ${borderStyleLeft}`,
			outlineColor: `${outlineColor}`,
			outlineWidth: `${outlineWidth}`,
			outlineStyle: `${outlineStyle}`,
			textDecoration: `${textDecoration}`,
		});

	// Return our variable
	return highlighterStyle;
}

/**
 * Function to retrieve the 'isEnabled' status
 *
 * This will determine if the line highlighter will display or not
 *      - enabled  -> will show
 *      - disabled -> will not show
 *
 * @returns enabledStatus
 */
function getHighlighterStatus(): boolean | undefined {
	// set a boolean variable
	let enabledStatus: boolean | undefined;

	/***
	 * if 'isEnabled' is missing from the settings (aka undefined)
	 *      - set our variable to true (default)
	 * otherwise, 'isEnabled' is listed in the settings
	 *      - so we just pull its value
	 */
	workspace
		.getConfiguration("mind-reader.lineHighlighter")
		.get("isEnabled") === undefined
		? (enabledStatus = true)
		: (enabledStatus = workspace
				.getConfiguration("mind-reader.lineHighlighter")
				.get("isEnabled"));

	// return the enabledStatus
	return enabledStatus;
}

function getMultiLineHighlighterStatus(): boolean | undefined {
	// set a boolean variable
	let multiLineIsEnabled: boolean | undefined;

	/***
	 * if 'isEnabled' is missing from the settings (aka undefined)
	 *      - set our variable to true (default)
	 * otherwise, 'isEnabled' is listed in the settings
	 *      - so we just pull its value
	 */
	workspace
		.getConfiguration("mind-reader.lineHighlighter")
		.get("multiLineIsEnabled") === undefined
		? (multiLineIsEnabled = true)
		: (multiLineIsEnabled = workspace
				.getConfiguration("mind-reader.lineHighlighter")
				.get("multiLineIsEnabled"));

	// return the enabledStatus
	return multiLineIsEnabled;
}

let firstActivation = true;

/* Toggle line highlight function*/
export function toggleLineHighlight() {
	let highlightStatus = getHighlighterStatus(); // Set highlightStatus to true or false

	/* If highlight is currently on*/
	if (highlightStatus === true && highlightStyle) {
		highlightStyle.dispose(); // Dispose of highlight
		outputMessage("Line Highlighter Off"); // State it is off
		workspace
			.getConfiguration("mind-reader.lineHighlighter")
			.update("isEnabled", false, true); // Set lineHighlighter status to false
	} else {
		/* If highlight is currently off */
		highlightStyle = getHighlighterStyle(); // Set style to current style declaration
		triggerHighlight(); // Call trigger highlight function
		if (!firstActivation) {
			outputMessage("Line Highlighter On"); // State highlight is on
		}
		firstActivation = false;
		workspace
			.getConfiguration("mind-reader.lineHighlighter")
			.update("isEnabled", true, true); // Set linehighlight status to true
	}
}

let currentPanel: vscode.WebviewPanel | undefined;

export function changeHighlightColor() {
	const columnToShowIn = vscode.window.activeTextEditor
		? vscode.window.activeTextEditor.viewColumn
		: undefined;

	if (!currentPanel) {
		currentPanel = vscode.window.createWebviewPanel(
			"changeHighlightColor",
			"Highlight Color Picker",
			vscode.ViewColumn.One,
			{
				enableScripts: true,
				retainContextWhenHidden: true,
			},
		);

		const webviewUri = vscode.Uri.file(
			path.join(
				path
					.normalize(__dirname)
					.replace(`${path.sep}out${path.sep}commands`, ""), //Project root
				"webviews",
				"ChangeHighlightColor",
			),
		);
		const stylesPath = vscode.Uri.joinPath(webviewUri, "index.css");
		const scriptsPath = vscode.Uri.joinPath(webviewUri, "index.js");
		const viewPath = vscode.Uri.joinPath(webviewUri, "index.html");

		currentPanel.webview.html = getWebviewContent({
			stylesPath: currentPanel.webview.asWebviewUri(stylesPath),
			scriptsPath: currentPanel.webview.asWebviewUri(scriptsPath),
			viewPath: viewPath.fsPath,
		});

		const backgroundColor = vscode.workspace
			.getConfiguration("mind-reader.lineHighlighter")
			.get<string>("backgroundColor");
		const outlineColor = vscode.workspace
			.getConfiguration("mind-reader.lineHighlighter")
			.get<string>("outlineColor");
		const secondaryHighlightColor = vscode.workspace
			.getConfiguration("mind-reader.lineHighlighter")
			.get<string>("selectionColor");
		const textColor = vscode.workspace
			.getConfiguration("mind-reader.lineHighlighter")
			.get<string>("textColor");
		currentPanel.webview.postMessage({ backgroundColor, outlineColor, textColor, secondaryHighlightColor});

		currentPanel.onDidDispose(() => {
			currentPanel = undefined;
		});
	} else {
		currentPanel.reveal(columnToShowIn);
	}

	currentPanel.webview.onDidReceiveMessage((message) => {
		if (message.type === "selectedColors") {
			const bgColor = message.backgroundColor;
			const olColor = message.outlineColor;
			const tColor = message.textColor;
			const sbColor = message.secondaryHighlightColor
			workspace
				.getConfiguration("mind-reader.lineHighlighter")
				.update("backgroundColor", bgColor, true);
			workspace
				.getConfiguration("mind-reader.lineHighlighter")
				.update("textColor", tColor, true);
			workspace
				.getConfiguration("mind-reader.lineHighlighter")
				.update("borderColorBottom", olColor, true);
			workspace
				.getConfiguration("mind-reader.lineHighlighter")
				.update("borderColorLeft", olColor, true);
			workspace
				.getConfiguration("mind-reader.lineHighlighter")
				.update("borderColorRight", olColor, true);
			workspace
				.getConfiguration("mind-reader.lineHighlighter")
				.update("selectionColor", sbColor, true);
		}
	});
}

type ChangeHighlightWebviewProps = {
	stylesPath: vscode.Uri;
	scriptsPath: vscode.Uri;
	viewPath: string;
};

function getWebviewContent({stylesPath, scriptsPath, viewPath}: ChangeHighlightWebviewProps){
    const html = fs.readFileSync(viewPath).toString();
    return eval(`\`${html}\``);
}

// Clean-up after ourselves
export function highlightDeactivate() {
	// when the plugin is terminated remove all highlighting
	if (highlightStyle !== undefined) {
		highlightStyle.dispose();
	}
}

/* Register commands for use*/
export const lineHighlightercommands: CommandEntry[] = [
	{
		name: "mind-reader.toggleLineHighlight",
		callback: toggleLineHighlight,
		undo: toggleLineHighlight,
	},
	{
		name: "mind-reader.changeHighlightColor",
		callback: () => changeHighlightColor(),
	},
];
