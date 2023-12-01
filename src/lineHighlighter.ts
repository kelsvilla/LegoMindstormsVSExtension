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
* TODO: FEATURE: Add hotkey to toggle linehighlighter on/off
* TODO: BUG: Adding the settings configurator made default settings break (if no values are found in settings.json)
**/
"use strict";
import {
    Position,
    window,
    workspace,
    TextEditorDecorationType,
    TextEditor,
    WorkspaceConfiguration,
    Range,
} from "vscode";

export { lineHighlighter };

let highlightStyle: TextEditorDecorationType;

function lineHighlighter(): void {
    let highlightStyle: TextEditorDecorationType = getHighlighterStyle();
    let activeTextEditor: TextEditor | undefined = window.activeTextEditor;
    let isEnabled: boolean | undefined = getHighlighterStatus();
    let multiLineIsEnabled: boolean | undefined =
        getMultiLineHighlighterStatus();

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

        highlightStyle.dispose(); // Dump existing styling
        isEnabled = getHighlighterStatus(); // check if line highlighter is enable/disabled
        multiLineIsEnabled = getMultiLineHighlighterStatus(); // Check if multiline highlighting is enabled/disabled
        highlightStyle = getHighlighterStyle(); // get new line highlighter styling
        triggerHighlight(); // trigger highlight with new styling
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
        activeTextEditor = window.activeTextEditor;
        if (activeTextEditor !== undefined) {
            /**
             * If the line highlighter function is enabled
             *      set the decorations with our chosen highlighting style on the selection
             *      otherwise (highlighter is disabled) dump our highlighting style
             */
            switch (isEnabled) {
                case true /* isEnabled is true */:
                    switch (multiLineIsEnabled) {
                        case true /* isEnabled is true and multiLineIsEnabled is true */:
                            activeTextEditor.setDecorations(
                                highlightStyle,
                                activeTextEditor.selections,
                            );
                            break;
                        case false /* isEnabled is true and multiLineIsEnabled is false */:
                            switch (activeTextEditor.selection.isSingleLine) {
                                case true /* isEnabled is true and multiLineIsEnabled is false and VSCode is reporting a single line */:
                                    let currentPosition = [];
                                    for (
                                        let i = 0;
                                        i < activeTextEditor.selections.length;
                                        i++
                                    ) {
                                        currentPosition[i] = {
                                            range: new Range(
                                                activeTextEditor.selections[
                                                    i
                                                ].anchor,
                                                activeTextEditor.selections[
                                                    i
                                                ].anchor,
                                            ),
                                        };
                                    }

                                    activeTextEditor.setDecorations(
                                        highlightStyle,
                                        currentPosition,
                                    );
                                    break;
                                case false /* isEnabled is true and multiLineIsEnabled is false and VSCode is reporting multiple lines */:
                                    // Dispose of our highlighting style so multiple lines aren't all highlighted when clicking and dragging to highlight
                                    activeTextEditor.setDecorations(
                                        highlightStyle,
                                        [],
                                    ); // This will dispose of a single editor instead of all editors
                                    break;
                                default: /* isEnabled is true and multiLineIsEnabled is false and VSCode is reporting something else - break out of 3rd switch */
                                    break;
                            }
                            break;
                        default: /* isEnabled is true and multiLineIsEnabled is undetected - break out of 2nd switch statement */
                            break;
                    }
                    break;
                case false /* isEnabled is false */:
                    highlightStyle.dispose();
                    break;
                default: /* break out of initial switch if 'true or false' is not found */
                    break;
            }

            // Keep track of position
            new Position(
                activeTextEditor.selection.start.line,
                activeTextEditor.selection.start.character,
            );
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
}

// Clean-up after ourself
export function deactivate() {
    // when the plugin is terminated remove all highlighting
    if (highlightStyle !== undefined) {
        highlightStyle.dispose();
    }
}
