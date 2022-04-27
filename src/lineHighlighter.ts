/**
* ? ██╗  ██╗██╗ ██████╗ ██╗  ██╗██╗     ██╗ ██████╗ ██╗  ██╗████████╗      ██╗████████╗
* ? ██║  ██║██║██╔════╝ ██║  ██║██║     ██║██╔════╝ ██║  ██║╚══██╔══╝      ██║╚══██╔══╝
* ? ███████║██║██║  ███╗███████║██║     ██║██║  ███╗███████║   ██║   █████╗██║   ██║
* ? ██╔══██║██║██║   ██║██╔══██║██║     ██║██║   ██║██╔══██║   ██║   ╚════╝██║   ██║
* ? ██║  ██║██║╚██████╔╝██║  ██║███████╗██║╚██████╔╝██║  ██║   ██║         ██║   ██║
* ? ╚═╝  ╚═╝╚═╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝         ╚═╝   ╚═╝
**/
import { Position, window, workspace, TextEditorDecorationType, TextEditor, WorkspaceConfiguration, Range } from 'vscode';

export { lineHighlighter };

let highlightStyle: TextEditorDecorationType;

function lineHighlighter(): void {
    let highlightStyle    : TextEditorDecorationType = getHighlighterStyle();
    let activeTextEditor  : TextEditor | undefined   = window.activeTextEditor;
    let isEnabled         : boolean    | undefined   = getHighlighterStatus();
    let multiLineIsEnabled: boolean    | undefined   = getMultiLineHighlighterStatus();

    /**
     *  Trigger the line highlight when the extension
     *  loads so current line gets highlighted
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
            console.error(`[*] onDidChangeTextEditorSelection(${editor}) -> no active text editor`);
            return;
        }

        triggerHighlight();
    });

    /**
     * Trigger for when the text document changes
     */
    workspace.onDidChangeTextDocument((editor) => {
        if (!activeTextEditor) {
            console.error(`[*] onDidChangeTextDocument(${editor}) -> no active text editor`);
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

        // Dump existing styling
        highlightStyle.dispose();
        // check if line highlighter is enable/disabled
        isEnabled          = getHighlighterStatus();
        multiLineIsEnabled = getMultiLineHighlighterStatus();
        // get new line highlighter styling
        highlightStyle     = getHighlighterStyle();
        // trigger highlight with new styling
        triggerHighlight();
    });

    /**
     * main function that triggers the highlights
     */
    function triggerHighlight(): void {
        if (!activeTextEditor) {
            console.error("[*] NO Active Text Editor");
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
            // (isEnabled)
            //     ? activeTextEditor!.setDecorations(highlightStyle, activeTextEditor!.selections)
            //     : highlightStyle.dispose();
            switch (isEnabled) {
                case true: // isEnabled is true
                    switch (multiLineIsEnabled) {
                        case true: // isEnabled is true and multiLineIsEnabled is true
                            // const startLine = activeTextEditor!.selection.start;
                            // const endLine   = activeTextEditor!.selection.end;
                            // const rangeToHighlight = { range: new Range(startLine, endLine) };
                            // activeTextEditor!.setDecorations(highlightStyle, [rangeToHighlight]);
                            // const currentLineRange = activeTextEditor!.document.lineAt(activeTextEditor!.selection.anchor).range;
                            // activeTextEditor!.setDecorations(highlightStyle, [currentLineRange]);
                            // const startLine = activeTextEditor!.selection.start.line;
                            // const endLine   = activeTextEditor!.selection.end;
                            // const rangeToHighlight = { range: new Range(startLine, endLine) };
                            activeTextEditor.setDecorations(highlightStyle, activeTextEditor.selections);
                            break;
                        case false: // isEnabled is true and multiLineIsEnabled is false
                            switch (activeTextEditor.selection.isSingleLine) {
                                case true: // isEnabled is true and multiLineIsEnabled is false and VSCode is reporting a single line
                                    let currentPosition = [];
                                    for (let i = 0; i < activeTextEditor.selections.length; i++) {
                                        currentPosition[i] = { range: new Range(activeTextEditor.selections[i].anchor, activeTextEditor.selections[i].anchor) };
                                    }

                                    activeTextEditor.setDecorations(highlightStyle, currentPosition);
                                    // const currentLine = activeTextEditor.selection.active.line;
                                    // const newDecoration = { range: new Range(currentPosition, currentPosition) };
                                    // const singleLineHighlight = { range: new Range(activeTextEditor!.selection.anchor.line, activeTextEditor!.selection.anchor.line) };
                                    // activeTextEditor!.setDecorations(highlightStyle, [singleLineRange]);
                                    // activeTextEditor.setDecorations(highlightStyle, [activeTextEditor.selection]);
                                    break;
                                case false: // isEnabled is true and multiLineIsEnabled is false and VSCode is reporting multiple lines
                                    // Dispose of our highlighting style so multiple lines aren't all highlighted when clicking and dragging to highlight
                                    // highlightStyle.dispose();
                                    activeTextEditor.setDecorations(highlightStyle, []);
                                    // Since we disposed of our highlighting style, we need to re-acquire it for highlighting to continue to work after clicking and dragging to highlight
                                    // highlightStyle = getHighlighterStyle();
                                    break;
                                default: // isEnabled is true and multiLineIsEnabled is false and VSCode is reporting something else - break out of 3rd switch
                                    break;
                            }
                            break;
                        default: // isEnabled is true and multiLineIsEnabled is undetected - break out of 2nd switch statement
                            break;
                    }
                    break;
                case false: // isEnabled is false
                    highlightStyle.dispose();
                    break;
                default: // break out of initial switch is true or false not found
                    break;
            }

            //  Track new position, without this the line the the cursor begins on will never get styled
            new Position(activeTextEditor.selection.start.line, activeTextEditor.selection.start.character);
        }
    }

    /**
     * Function to get the user configured highlighting styles, or use defaults
     *
     * Designed with user configuration in mind, able to control different sides
     * independently from each other (in most cases). This allows for many different
     * configurations.
     *
     * @returns highlighterStyle
     */
    function getHighlighterStyle(): TextEditorDecorationType {
        // Used so we don't have to type out workspace.getConfiguration('mind-reader.lineHighlight') on every line, ie: shorthand
        const userConfig: WorkspaceConfiguration = workspace.getConfiguration('mind-reader.lineHighlight');

        const borderWidthTop    : string = userConfig.get('borderWidthTop')    || "0";
        const borderWidthRight  : string = userConfig.get('borderWidthRight')  || "0";
        const borderWidthBottom : string = userConfig.get('borderWidthBottom') || "2px";
        const borderWidthLeft   : string = userConfig.get('borderWidthLeft')   || "0";

        const borderStyleTop    : string = userConfig.get('borderStyleTop')    || "solid";
        const borderStyleRight  : string = userConfig.get('borderStyleRight')  || "solid";
        const borderStyleBottom : string = userConfig.get('borderStyleBottom') || "solid";
        const borderStyleLeft   : string = userConfig.get('borderStyleLeft')   || "solid";

        const borderColorTop    : string = userConfig.get('borderColorTop')    || "#191970";
        const borderColorRight  : string = userConfig.get('borderColorRight')  || "#191970";
        const borderColorBottom : string = userConfig.get('borderColorBottom') || "#191970";
        const borderColorLeft   : string = userConfig.get('borderColorLeft')   || "#191970";

        const backgroundColor   : string = userConfig.get('backgroundColor')   || "#00fa9a";

        const fontStyle         : string = userConfig.get('fontStyle')         || "normal";
        const fontWeight        : string = userConfig.get('fontWeight')        || "normal";
        const outlineColor      : string = userConfig.get('outlineColor')      || "#191970";
        const outlineStyle      : string = userConfig.get('outlineStyle')      || "solid";
        const outlineWidth      : string = userConfig.get('outlineWidth')      || "0";
        const textDecoration    : string = userConfig.get('textDecoration')    || "normal";
        const textColor         : string = userConfig.get('textColor')         || "normal";

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
        (workspace.getConfiguration("mind-reader.lineHighlight").get("isEnabled") === undefined)
            ? (enabledStatus = true)
            : (enabledStatus = workspace.getConfiguration("mind-reader.lineHighlight").get("isEnabled"));

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
        (workspace.getConfiguration("mind-reader.lineHighlight").get("multiLineIsEnabled") === undefined)
            ? (multiLineIsEnabled = true)
            : (multiLineIsEnabled = workspace.getConfiguration("mind-reader.lineHighlight").get("multiLineIsEnabled"));

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

        /**
         * Border Width Settings
         *      borderWidthTop    = Top    Border Width
         *      borderWidthRight  = Right  Border Width * Right border is a little finicky, I have all others at 1px, but need 15px for this one to match
         *      borderWidthBottom = Bottom Border Width
         *      borderWidthLeft   = Left   Border Width
         *
         * Uses CSS so should accept:
         *      thin | medium | thick
         *      px
         *      rem
         *      em
         *      cm
         *      % - Weird behavior
         *      inherit
         *
         * If no value is found in the settings, we set the value after the double pipes (||) instead
         */

        /**
         * Border Style Settings
         *      borderStyleTop    = Top    Border Style
         *      borderStyleRight  = Right  Border Style
         *      borderStyleBottom = Bottom Border Style
         *      borderStyleLeft   = Left   Border Style
         *
         * Uses CSS so should accept: (Some of them I can't tell a difference, but they do something)
         *      none
         *      hidden
         *      dotted
         *      dashed
         *      solid
         *      double
         *      groove
         *      ridge
         *      inset
         *      outset
         *
         * If no value is found in the settings, we set the value after the double pipes (||) instead
         */

        /**
         * Border Color Settings
         *      borderColorRight  = Right  Border Color
         *      borderColorBottom = Bottom Border Color
         *      borderColorTop    = Top    Border Color
         *      borderColorLeft   = Left   Border Color
         *
         * Uses CSS so should accept: (Some of them I can't tell a difference, but they do something)
         *      none - This one doesn't play nice
         *      string value like "red" | "blue" | "orange" etc - https://www.w3schools.com/cssref/css_colors.asp
         *      #<value>
         *      rgb(###, ###, ###)
         *      rgba(###, ###, ###, ###)
         *      hsla(##, ##%, ##%, .#);
         *      inherit - This one has weird behavior as well
         *
         * If no value is found in the settings, we set the value after the double pipes (||) instead
         */

        /**
         * Color of the background
         *
         * Uses CSS so should accept:
         *      none - This one doesn't play nice
         *      string value like "red" | "blue" | "orange" etc - https://www.w3schools.com/cssref/css_colors.asp
         *      #<value>
         *      rgb(###, ###, ###)
         *      rgba(###, ###, ###, ###)
         *      hsla(##, ##%, ##%, .#);
         *      inherit - This one has weird behavior as well
         *
         * If no value is found in the settings, we set the value after the double pipes (||) instead
         */

        /**
         * font-style: normal|italic|oblique|initial|inherit
         */

        /**
         * font-weight: normal|bold|bolder|lighter|number|initial|inherit
         */