# Configure Line Highlighter

The Line Highlighter feature is customizable. Changes to the highlighter's appearance can be done through your `settings.json` or through the settings window.
Before running Mind Reader for the first time it is recommended to add the following code block to your `settings.json` file

## Configure through settings.json

1. Launch VS Code
2. Open the `Command Palette` by pressing **Ctrl + Shift + P** (Windows) / **Cmd + Shift + P** (Mac)
3. The Command Palette should appear at the top of your screen ready for you to type
4. Type `settings` and highlight the option that appears saying `Preferences: Open Settings (JSON)` then select it
5. Your `settings.json` window should appear, scroll to the bottom and make sure the last item has a `,` before the closing curly bracket `}`
6. Paste the following code block (or the portion you want to change) after the last comma `,`, but before the closing curly bracket `}`:

```
    "mind-reader.lineHighlighter.isEnabled"          : true,
    "mind-reader.lineHighlighter.multiLineIsEnabled" : false,

    "mind-reader.lineHighlighter.backgroundColor"    : "#232C5C",

    "mind-reader.lineHighlighter.outlineColor"       : "#4866FE",
    "mind-reader.lineHighlighter.outlineWidth"       : "1px",
    "mind-reader.lineHighlighter.outlineStyle"       : "solid",

    "mind-reader.lineHighlighter.borderColorTop"     : "#FFFFFF",
    "mind-reader.lineHighlighter.borderColorRight"   : "#FFFFFF",
    "mind-reader.lineHighlighter.borderColorBottom"  : "#FFFFFF",
    "mind-reader.lineHighlighter.borderColorLeft"    : "#FFFFFF",

    "mind-reader.lineHighlighter.borderWidthTop"     : "1px",
    "mind-reader.lineHighlighter.borderWidthRight"   : "16px",
    "mind-reader.lineHighlighter.borderWidthBottom"  : "1px",
    "mind-reader.lineHighlighter.borderWidthLeft"    : "1px",

    "mind-reader.lineHighlighter.borderStyleTop"     : "solid",
    "mind-reader.lineHighlighter.borderStyleRight"   : "solid",
    "mind-reader.lineHighlighter.borderStyleBottom"  : "solid",
    "mind-reader.lineHighlighter.borderStyleLeft"    : "solid",

    "mind-reader.lineHighlighter.fontStyle"          : "normal",
    "mind-reader.lineHighlighter.fontWeight"         : "bolder",
    "mind-reader.lineHighlighter.textDecoration"     : "none",
    "mind-reader.lineHighlighter.textColor"          : "#FFFFFF",
```

After adding the code block, the `settings.json` file should look similar to this:\
![line_highlighter_setup](https://github.com/kelsvilla/LegoMindstormsVSExtension/assets/89543725/4e5135cb-e79d-4859-ac8c-af3ab3b6122e)

7. Save and close `settings.json`
    - The values are set to the default values and can be changed here manually. Changes made directly in the settings.json will take effect automatically.

## Configure through Settings Window

1. Open the settings window
    - Windows: Ctrl + , or File -> Preferences -> Settings
    - Mac: Command + , or Code -> Settings -> Settings
2. Navigate to Extensions -> Mind Reader -> Line Highlighter
3. Make any changes you need
4. Close the settings window

## Line Highlighter Settings Table

| **Item**               | **Description**                                       | **Accepted Value**                                                           | **Default Values** |
| ---------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------ |
| **isEnabled**          | Enable/Disables the line highlighter                  | boolean                                                                      | true               |
| **multiLineIsEnabled** | Highlight when clicking and dragging to select lines  | boolean                                                                      | false              |
| **backgroundColor**    | Changes the background color of the highlight         | HEX(A), RGB(A), HSL(A), Predefined Color String, or "none"                   | "#232C5C"          |
| **outlineColor**       | Outline Color                                         | HEX(A), RGB(A), HSL(A), Predefined Color String, or "none"                   | "#4866FE"          |
| **outlineWidth**       | Outline Width                                         | "medium", "thin", "thick", length (integer + string unit), or "none"         | "1px"              |
| **outlineStyle**       | Outline Style                                         | none, hidden, dotted, dashed, solid, double, groove, ridge, inset, or outset | "solid"            |
| **borderColorTop**     | Top Border Color                                      | HEX(A), RGB(A), HSL(A), Predefined Color String, or "none"                   | "#FFFFFF"          |
| **borderColorRight**   | Right Border Color                                    | HEX(A), RGB(A), HSL(A), Predefined Color String, or "none"                   | "#FFFFFF"          |
| **borderColorBottom**  | Bottom Border Color                                   | HEX(A), RGB(A), HSL(A), Predefined Color String, or "none"                   | "#FFFFFF"          |
| **borderColorLeft**    | Left Border Color                                     | HEX(A), RGB(A), HSL(A), Predefined Color String, or "none"                   | "#FFFFFF"          |
| **borderWidthTop**     | Top Border Width                                      | "medium", "thin", "thick", length (integer + string unit), or "none"         | "1px"              |
| **borderWidthRight**   | Right Border Width                                    | "medium", "thin", "thick", length (integer + string unit), or "none"         | "16px"             |
| **borderWidthBottom**  | Bottom Border Width                                   | "medium", "thin", "thick", length (integer + string unit), or "none"         | "1px"              |
| **borderWidthLeft**    | Left Border Width                                     | "medium", "thin", "thick", length (integer + string unit), or "none"         | "1px"              |
| **borderStyleTop**     | Top Border Style                                      | none, hidden, dotted, dashed, solid, double, groove, ridge, inset, or outset | "solid"            |
| **borderStyleRight**   | Right Border Style                                    | none, hidden, dotted, dashed, solid, double, groove, ridge, inset, or outset | "solid"            |
| **borderStyleBottom**  | Bottom Border Style                                   | none, hidden, dotted, dashed, solid, double, groove, ridge, inset, or outset | "solid"            |
| **borderStyleLeft**    | Left Border Style                                     | none, hidden, dotted, dashed, solid, double, groove, ridge, inset, or outset | "solid"            |
| **fontStyle**          | Styling to the font contained within the highlight    | "normal", "italic", "oblique", or "none"                                     | "normal"           |
| **fontWeight**         | Weight of the font contained within the highlight     | "normal", "bold", "bolder", "lighter", string based number, "none"           | "bolder"           |
| **textDecoration**     | Decoration of the font contained within the highlight | See: https://www.w3schools.com/cssref/pr_text_text-decoration.asp            | "none"             |
| **textColor**          | Color of the font contained within the highlight      | HEX(A), RGB(A), HSL(A), Predefined Color String, or "none"                   | "#FFFFFF"          |
