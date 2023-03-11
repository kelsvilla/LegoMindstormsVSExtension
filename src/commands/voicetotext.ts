import { CommandEntry } from './commandEntry';
import { TextEditor, window, Position } from "vscode";

export const voicetotextCommands: CommandEntry[] = [
    {
        name: 'mind-reader.insertIfLadder',
        callback: insertIfLadder,
    },
    {
        name: 'mind-reader.insertIfElseLadder',
        callback: insertIfElseLadder,
    },
    {
        name: 'mind-reader.insertForLoop',
        callback: insertForLoop,
    },
    {
        name: 'mind-reader.insertForNumberLoop',
        callback: insertForNumberLoop,
    },
    {
        name: 'mind-reader.insertNestedForLoop',
        callback: insertNestedForLoop,
    },
    {
        name: 'mind-reader.insertNestedForNumberLoop',
        callback: insertNestedForNumberLoop,
    },
    {
        name: 'mind-reader.insertTryLadder',
        callback: insertTryLadder,
    },
    {
        name: 'mind-reader.insertMindstormImport',
        callback: insertMindstormImport,
    }
];

// Write if ladder to text editor
function insertIfLadder(): void {
    // Only effect current open text editor
    const editor: TextEditor | undefined = window.activeTextEditor;
    // If editor is defined
    if (editor) {
            // Set text to add
            let text = '\nif (val1 == 0):\n\tif (val2 == 0):\n\t\tif (val3 == 0):\n\t\t\tprint("action")\n\t\telse:\n\t\t\tprint("action")\n\telse:\n\t\tprint("action")\nelse:\n\t\tprint("action")';
            // Insert created text
            editor.edit(editBuilder => {
                editBuilder.insert(editor.selection.active, text);
            });
    }
    // Editor is not defined
    else {
        window.showErrorMessage('No document currently active');
    }
}

// Write if else ladder to text editor
function insertIfElseLadder(): void {
    // Only effect current open text editor
    const editor: TextEditor | undefined = window.activeTextEditor;
    // If editor is defined
    if (editor) {
            // Set text to add
            let text = '\nif (val1 == 0):\n\tprint("action")\nelif (val1 == 0):\n\tprint("action")\nelse:\n\tprint("action")';
            // Insert created text
            editor.edit(editBuilder => {
                editBuilder.insert(editor.selection.active, text);
            });
    }
    else {
        // Editor is not defined
        window.showErrorMessage('No document currently active');
    }
}

// Write for loop to text editor
function insertForLoop(): void {
    // Only effect current open text editor
    const editor: TextEditor | undefined = window.activeTextEditor;
    // If editor is defined
    if (editor) {
            // Set text to add
            let text = "\nfor i in list:\n\tprint(i)";
            // Insert created text
            editor.edit(editBuilder => {
                editBuilder.insert(editor.selection.active, text);
            });
    }
    else {
        // Editor is not defined
        window.showErrorMessage('No document currently active');
    }
}

// Write for number loop to text editor
function insertForNumberLoop(): void {
    // Only effect current open text editor
    const editor: TextEditor | undefined = window.activeTextEditor;
    const start = 0;
    const end = 10;
    const increment = 1;
    // If editor is defined
    if (editor) {
            // Set text to add
            let text = "\nfor i in range(" + start + "," + end + "," + increment + "):\n\tprint(i)";
            // Insert created text
            editor.edit(editBuilder => {
                editBuilder.insert(editor.selection.active, text);
            });
    }
    else {
        // Editor is not defined
        window.showErrorMessage('No document currently active');
    }
}

// Write nested for loop to text editor
function insertNestedForLoop(): void {
    // Only effect current open text editor
    const editor: TextEditor | undefined = window.activeTextEditor;
    // If editor is defined
    if (editor) {
            // Set text to add
            let text = "\nfor i in list:\n\tfor j in list2:\n\t\tprint(i)\n\t\tprint(j)";
            // Insert created text
            editor.edit(editBuilder => {
                editBuilder.insert(editor.selection.active, text);
            });
    }
    else {
        // Editor is not defined
        window.showErrorMessage('No document currently active');
    }
}

// Write nested for range number to text editor
function insertNestedForNumberLoop(): void {
    // Only effect current open text editor
    const editor: TextEditor | undefined = window.activeTextEditor;
    const start1 = 0;
    const end1 = 10;
    const increment1 = 1;
    const start2 = 0;
    const end2 = 10;
    const increment2 = 1;
    // If editor is defined
    if (editor) {
            // Set text to add
            let text = "\nfor i in range(" + start1 + "," + end1 + "," + increment1 + "):\n\tfor j in range(" + start2 + "," + end2 + "," + increment2 + "):\n\t\tprint(i)\n\t\tprint(j)";
            // Insert created text
            editor.edit(editBuilder => {
                editBuilder.insert(editor.selection.active, text);
            });
    }
    else {
        // Editor is not defined
        window.showErrorMessage('No document currently active');
    }
}

// Write try ladder to text editor
function insertTryLadder(): void {
    // Only effect current open text editor
    const editor: TextEditor | undefined = window.activeTextEditor;
    // If editor is defined
    if (editor) {
            // Set text to add
            let text = '\ntry:\n\tprint("Try Action")\nexcept FileNotFoundError as e:\n\tprint(e)\nexcept Exception as e:\n\tprint(e)\nelse:\n\tprint("On Success Action")\nfinally:\n\tprint("After Success or Fail")';
            // Insert created text
            editor.edit(editBuilder => {
                editBuilder.insert(editor.selection.active, text);
            });
    }
    else {
        // Editor is not defined
        window.showErrorMessage('No document currently active');
    }
}

// Write standard Mindstorm imports to text editor
function insertMindstormImport(): void {
    // Only effect current open text editor
    const editor: TextEditor | undefined = window.activeTextEditor;
    // If editor is defined
    if (editor) {
            // Set text to add
            let text = "from mindstorms import MSHub, Motor, MotorPair, ColorSensor, DistanceSensor, App\n"
            + "from minstorms.control import wait_for_seconds, wait_until, Timer\n"
            + "from minstorms.operator import greater_than, greater_than_or_equal_to, less_than, less_than_or_equal_to, equal_to, not_equal_to\n"
            + "import math\n\n"
            + "hub = MSHub()\nmovement_motors = MotorPair('A','B')\nmovement_motors.set_default_speed(50)\ndistance_sensor = DistanceSensor('D')\n";
            // Insert created text
            editor.edit(editBuilder => {
                editBuilder.insert(new Position(0, 0), text);
            });
    }
    else {
        // Editor is not defined
        window.showErrorMessage('No document currently active');
    }
}

// Write while loop to text editor
function insertWhileLoop(): void {
    // Only effect current open text editor
    const editor: TextEditor | undefined = window.activeTextEditor;
    // If editor is defined
    if (editor) {
            // Set text to add
            let text = '\nwhiledone = False\nwhile !whiledone:\n\tprint("Action")';
            // Insert created text
            editor.edit(editBuilder => {
                editBuilder.insert(editor.selection.active, text);
            });
    }
    else {
        // Editor is not defined
        window.showErrorMessage('No document currently active');
    }
}

// Write do while loop to text editor
function insertDoWhileLoop(): void {
    // Only effect current open text editor
    const editor: TextEditor | undefined = window.activeTextEditor;
    // If editor is defined
    if (editor) {
            // Set text to add
            let text = '\nbreakervar = False\nwhile True:\n\tprint("Action")\n\tif (breakerVar == True):\n\t\tbreak';
            // Insert created text
            editor.edit(editBuilder => {
                editBuilder.insert(editor.selection.active, text);
            });
    }
    else {
        // Editor is not defined
        window.showErrorMessage('No document currently active');
    }
}