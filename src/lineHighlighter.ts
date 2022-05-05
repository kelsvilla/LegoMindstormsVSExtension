/**
* ? ██╗  ██╗██╗ ██████╗ ██╗  ██╗██╗     ██╗ ██████╗ ██╗  ██╗████████╗      ██╗████████╗
* ? ██║  ██║██║██╔════╝ ██║  ██║██║     ██║██╔════╝ ██║  ██║╚══██╔══╝      ██║╚══██╔══╝
* ? ███████║██║██║  ███╗███████║██║     ██║██║  ███╗███████║   ██║   █████╗██║   ██║
* ? ██╔══██║██║██║   ██║██╔══██║██║     ██║██║   ██║██╔══██║   ██║   ╚════╝██║   ██║
* ? ██║  ██║██║╚██████╔╝██║  ██║███████╗██║╚██████╔╝██║  ██║   ██║         ██║   ██║
* ? ╚═╝  ╚═╝╚═╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝         ╚═╝   ╚═╝
**/
'use strict';
import { Position, window, workspace, TextEditorDecorationType, TextEditor, WorkspaceConfiguration, Range } from 'vscode';

export { lineHighlighter };

let highlightStyle: TextEditorDecorationType;

function lineHighlighter(): void {
    let highlightStyle    : TextEditorDecorationType = getHighlighterStyle();
    let activeTextEditor  : TextEditor | undefined   = window.activeTextEditor;
    let isEnabled         : boolean    | undefined   = getHighlighterStatus();
    let multiLineIsEnabled: boolean    | undefined   = getMultiLineHighlighterStatus();

    /**
     *  Trigger the line highlight when the extension loads so current line gets highlighted
     */
    triggerHighlight();

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
        if (!activeTextEditor) {
            return;
        }

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

        highlightStyle.dispose();                              // Dump existing styling
        isEnabled          = getHighlighterStatus();           // check if line highlighter is enable/disabled
        multiLineIsEnabled = getMultiLineHighlighterStatus();  // Check if multiline highlighting is enabled/disabled
        highlightStyle     = getHighlighterStyle();            // get new line highlighter styling
        triggerHighlight();                                    // trigger highlight with new styling
    });

    /**
     * main function that triggers the highlights
     */
    function triggerHighlight(): void {
        if (!activeTextEditor) {
            return;
        }

        /**
         * Sets the activeTextEditor to the current active window
         */
        activeTextEditor  = window.activeTextEditor;
        if (activeTextEditor !== undefined) {
            /**
             * If the line highlighter function is enabled
             *      set the decorations with our chosen highlighting style on the selection
             *      otherwise (highlighter is disabled) dump our highlighting style
             */
            switch (isEnabled) {
                case true: /* isEnabled is true */
                    switch (multiLineIsEnabled) {
                        case true: /* isEnabled is true and multiLineIsEnabled is true */
                            activeTextEditor.setDecorations(highlightStyle, activeTextEditor.selections);
                            break;
                        case false: /* isEnabled is true and multiLineIsEnabled is false */
                            switch (activeTextEditor.selection.isSingleLine) {
                                case true: /* isEnabled is true and multiLineIsEnabled is false and VSCode is reporting a single line */
                                    let currentPosition = [];
                                    for (let i = 0; i < activeTextEditor.selections.length; i++) {
                                        currentPosition[i] = { range: new Range(activeTextEditor.selections[i].anchor, activeTextEditor.selections[i].anchor) };
                                    }

                                    activeTextEditor.setDecorations(highlightStyle, currentPosition);
                                    break;
                                case false: /* isEnabled is true and multiLineIsEnabled is false and VSCode is reporting multiple lines */
                                    // Dispose of our highlighting style so multiple lines aren't all highlighted when clicking and dragging to highlight
                                    activeTextEditor.setDecorations(highlightStyle, []); // This will dispose of a single editor instead of all editors
                                    break;
                                default: /* isEnabled is true and multiLineIsEnabled is false and VSCode is reporting something else - break out of 3rd switch */
                                    break;
                            }
                            break;
                        default: /* isEnabled is true and multiLineIsEnabled is undetected - break out of 2nd switch statement */
                            break;
                    }
                    break;
                case false: /* isEnabled is false */
                    highlightStyle.dispose();
                    break;
                default: /* break out of initial switch if 'true or false' is not found */
                    break;
            }

            // Keep track of position
            new Position(activeTextEditor.selection.start.line, activeTextEditor.selection.start.character);
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
     * * thin | medium | thick | px | rem | em | cm | % | inherit
     *
     * ? Other values
     * * font-style    : normal|italic|oblique|initial|inherit;
     * * font-weight   : normal|bold|bolder|lighter|number|initial|inherit;
     * * border-style  : none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset|initial|inherit;
     * * outline-style : none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset|initial|inherit;
     * * outline-width : medium|thin|thick|length|initial|inherit;
     * * border-width  : medium|thin|thick|length|initial|inherit;
     * ! https://www.w3schools.com/cssref/pr_text_text-decoration.asp for text-decoration
     * 
     * ! borderWidthRight acts weirdly, on my system 16px works best with the other directions set to 1px
     *
     * @returns highlighterStyle
     */
    function getHighlighterStyle(): TextEditorDecorationType {
        // Used so we don't have to type out workspace.getConfiguration('mindReader.lineHighlighter') on every line, ie: shorthand
        const userConfig: WorkspaceConfiguration = workspace.getConfiguration('mindReader.lineHighlighter');

        const borderWidthTop    : string = userConfig.get('borderWidthTop')    || "1px";
        const borderWidthRight  : string = userConfig.get('borderWidthRight')  || "16px";
        const borderWidthBottom : string = userConfig.get('borderWidthBottom') || "1px";
        const borderWidthLeft   : string = userConfig.get('borderWidthLeft')   || "1px";

        const borderStyleTop    : string = userConfig.get('borderStyleTop')    || "solid";
        const borderStyleRight  : string = userConfig.get('borderStyleRight')  || "solid";
        const borderStyleBottom : string = userConfig.get('borderStyleBottom') || "solid";
        const borderStyleLeft   : string = userConfig.get('borderStyleLeft')   || "solid";

        const borderColorTop    : string = userConfig.get('borderColorTop')    || "#FFFFFF";
        const borderColorRight  : string = userConfig.get('borderColorRight')  || "#FFFFFF";
        const borderColorBottom : string = userConfig.get('borderColorBottom') || "#FFFFFF";
        const borderColorLeft   : string = userConfig.get('borderColorLeft')   || "#FFFFFF";

        const backgroundColor   : string = userConfig.get('backgroundColor')   || "#232C5C";

        const fontStyle         : string = userConfig.get('fontStyle')         || "normal";
        const fontWeight        : string = userConfig.get('fontWeight')        || "bolder";
        const outlineColor      : string = userConfig.get('outlineColor')      || "#4866FE";
        const outlineStyle      : string = userConfig.get('outlineStyle')      || "solid";
        const outlineWidth      : string = userConfig.get('outlineWidth')      || "1px";
        const textDecoration    : string = userConfig.get('textDecoration')    || "none";
        const textColor         : string = userConfig.get('textColor')         || "#FFFFFF";

        // Combine all our styling into a single variable to return
        const highlighterStyle  : TextEditorDecorationType  = window.createTextEditorDecorationType({
            isWholeLine         : true,
            backgroundColor     : `${backgroundColor}`,
            fontStyle           : `${fontStyle}`,
            fontWeight          : `${fontWeight}`,
            textDecoration      : `${textDecoration}`,
            color               : `${textColor}`,
            borderColor         : `${borderColorTop} ${borderColorRight} ${borderColorBottom} ${borderColorLeft}`,
            borderWidth         : `${borderWidthTop} ${borderWidthRight} ${borderWidthBottom} ${borderWidthLeft}`,
            borderStyle         : `${borderStyleTop} ${borderStyleRight} ${borderStyleBottom} ${borderStyleLeft}`,
            outlineColor        : `${outlineColor}`,
            outlineWidth        : `${outlineWidth}`,
            outlineStyle        : `${outlineStyle}`,
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
         * if "isEnabled" is missing from the settings (aka undefined)
         *      - set our variable to true (default)
         * otherwise, "isEnabled" is listed in the settings
         *      - so we just pull its value
         */
        (workspace.getConfiguration("mindReader.lineHighlighter").get("isEnabled") === undefined)
            ? (enabledStatus = true)
            : (enabledStatus = workspace.getConfiguration("mindReader.lineHighlighter").get("isEnabled"));

        // return the enabledStatus
        return enabledStatus;
    }

    function getMultiLineHighlighterStatus(): boolean | undefined {
        // set a boolean variable
        let multiLineIsEnabled: boolean | undefined;

        /***
         * if "isEnabled" is missing from the settings (aka undefined)
         *      - set our variable to true (default)
         * otherwise, "isEnabled" is listed in the settings
         *      - so we just pull its value
         */
        (workspace.getConfiguration("mindReader.lineHighlighter").get("multiLineIsEnabled") === undefined)
            ? (multiLineIsEnabled = true)
            : (multiLineIsEnabled = workspace.getConfiguration("mindReader.lineHighlighter").get("multiLineIsEnabled"));

        // return the enabledStatus
        return multiLineIsEnabled;
    }
}

// Clean-up after ourself
export function deactivate() {
	// when the plugin is terminated remove all highlighting
	if (highlightStyle !== undefined) {
		highlightStyle.dispose();
	}
}
