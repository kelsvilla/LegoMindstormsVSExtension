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
* ! Restart VSCode for changes to take effect (if they didn't automatically)
* ! Afterwards you can now edit using the settings window, or manually edit them
* ! directly in settings.json by editing the values.
*
* TODO: FEATURE: Add ability for user to change options through a command pallette configurator
* TODO: BUG: Adding the settings configurator made default settings break (if no values are found in settings.json)
**/
"use strict";
import { CommandEntry } from "./commandEntry";
import {
	window,
	workspace,
	TextEditorDecorationType,
	WorkspaceConfiguration,
	Range,
} from "vscode";
import { outputMessage } from "./text";

let highlightStyle: TextEditorDecorationType;

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

	const isEnabled=getHighlighterStatus();
	const multiLineIsEnabled=getMultiLineHighlighterStatus();

	/* Create array to store decorations for highlight */
	let decorations: {range: Range}[]=[];

	/* If highlight is enabled */
	if(isEnabled) {
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
					range: new Range(selection.anchor, selection.anchor),
				}));
			}
		}
	}

	if (highlightStyle) {
		activeTextEditor.setDecorations(highlightStyle, decorations);
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
function getHighlighterStyle(): TextEditorDecorationType {
	// Used so we don't have to type out workspace.getConfiguration('mind-reader.lineHighlighter') on every line, ie: shorthand
	const userConfig: WorkspaceConfiguration = workspace.getConfiguration(
		"mind-reader.lineHighlighter",
	);

	const borderWidthTop: string =
		userConfig.get("borderWidthTop") || "1px";
	const borderWidthRight: string =
		userConfig.get("borderWidthRight") || "16px";
	const borderWidthBottom: string =
		userConfig.get("borderWidthBottom") || "1px";
	const borderWidthLeft: string =
		userConfig.get("borderWidthLeft") || "1px";

	const borderStyleTop: string =
		userConfig.get("borderStyleTop") || "solid";
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
	const outlineColor: string =
		userConfig.get("outlineColor") || "#4866FE";
	const outlineStyle: string = userConfig.get("outlineStyle") || "solid";
	const outlineWidth: string = userConfig.get("outlineWidth") || "1px";
	const textDecoration: string =
		userConfig.get("textDecoration") || "none";
	const textColor: string = userConfig.get("textColor") || "#FFFFFF";

	// Combine all our styling into a single variable to return
	const highlighterStyle: TextEditorDecorationType =
		window.createTextEditorDecorationType({
			isWholeLine: true,
			backgroundColor: `${backgroundColor}`,
			fontStyle: `${fontStyle}`,
			fontWeight: `${fontWeight}`,
			textDecoration: `${textDecoration}`,
			color: `${textColor}`,
			borderColor: `${borderColorTop} ${borderColorRight} ${borderColorBottom} ${borderColorLeft}`,
			borderWidth: `${borderWidthTop} ${borderWidthRight} ${borderWidthBottom} ${borderWidthLeft}`,
			borderStyle: `${borderStyleTop} ${borderStyleRight} ${borderStyleBottom} ${borderStyleLeft}`,
			outlineColor: `${outlineColor}`,
			outlineWidth: `${outlineWidth}`,
			outlineStyle: `${outlineStyle}`,
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

/* Toggle line highlight function*/
export function toggleLineHighlight() {
	let highlightStatus=getHighlighterStatus(); // Set highlightStatus to true or false

	/* If highlight is currently on*/
	if(highlightStatus===true && highlightStyle){
		highlightStyle.dispose(); // Dispose of highlight
		outputMessage("Line Highlighter Off"); // State it is off
		workspace.getConfiguration("mind-reader.lineHighlighter").update("isEnabled", false, true); // Set lineHighlighter status to false
	}
	/* If highlight is currently off */
	else{
		highlightStyle=getHighlighterStyle(); // Set style to current style declaration
		triggerHighlight(); // Call trigger highlight function
		outputMessage("Line Highlighter On"); // State highlight is on
		workspace.getConfiguration("mind-reader.lineHighlighter").update("isEnabled", true, true); // Set linehighlight status to true
	}
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
	},
];