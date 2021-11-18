import * as vscode from 'vscode';

/**
 * @type {Object} Command // Command to register with the VS Code Extension API
 * @prop {string} command // Name of the command; e.g., 'mind-reader.selectTheme'
 * @prop {callback} callback // Callback to register when `command` is invoked
 */
type Command = {
  name: string,
  callback: () => void
};

// The list of commands to register in the extension
const commands: Command[] = [
  {
    name: 'mind-reader.selectTheme',

    // callbacks can be inlined...
    callback: () => vscode.commands.executeCommand('workbench.action.selectTheme'),
  },

  {
    name: 'mind-reader.increaseFontScale',
    callback: increaseFontScale, // ...or factored out into separate functions below
  },

  {
    name: 'mind-reader.decreaseFontScale',
    callback: decreaseFontScale,
  },

  {
    name: 'mind-reader.resetFontScale',
    callback: resetFontScale,
  },

  {
    name: 'mind-reader.increaseEditorScale',
    callback: increaseEditorScale,
  },

  {
    name: 'mind-reader.decreaseEditorScale',
    callback: decreaseEditorScale,
  },

  {
    name: 'mind-reader.resetEditorScale',
    callback: resetEditorScale,
  },

  {
    name: 'mind-reader.openWebview',
    callback: openWebview,
  }
];

// COMMAND CALLBACK IMPLEMENTATIONS

function increaseFontScale(): void {
  vscode.commands.executeCommand('editor.action.fontZoomIn');
}

function decreaseFontScale(): void {
  vscode.commands.executeCommand('editor.action.fontZoomOut');
}

function resetFontScale(): void {
  vscode.commands.executeCommand('editor.action.fontZoomReset');
}

function increaseEditorScale(): void {
  vscode.commands.executeCommand('workbench.action.zoomIn');
}

function decreaseEditorScale(): void {
  vscode.commands.executeCommand('workbench.action.zoomOut');
}

function resetEditorScale(): void {
  vscode.commands.executeCommand('workbench.action.zoomReset');
}

function openWebview(): void {
  //vscode.commands.executeCommand('workbench.action.zoomOut');
  const panel = vscode.window.createWebviewPanel(
    'mindReader', // Identifies the type of the webview. Used internally
    'Mind Reader', // Title of the panel displayed to the user
    vscode.ViewColumn.One, // Editor column to show the new webview panel in.
    {}
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
      <h1>Welcome to Mind_Reader!</h1>
      <p></p>
      <p>We are the Single Semester Snobs and this is our Tool to Help Blind Students Program Lego Mindstorms Robots in Python.</p>
      <p>This tool includes features such as a hotkey that says how many spaces in the text starts, an Accessibility Pane, </p>
      <p>Audio Alerts, and an advanced settings window. The tool has hotkeys for both PC and Mac commands. </p>
      <p>This system is intended for everyone, but primarily for students K-12 who are visually impaired. </p>
      <p>Our goal is to provide an enhanced experience for students who are visually impaired that is transparent to sighted students. </p>
      <p>This allows for everyone to use the same software solution, whether or not they are vision impaired. </p>
      <p></p>
      <h2>This is the Lego Spike Prime!</h2z>
      <p></p>
      <img src="https://cdn.vox-cdn.com/thumbor/qoaa6N2ppl7oj97MR-aj43qPy0w=/0x0:1024x576/920x613/filters:focal(431x207:593x369):format(webp)/cdn.vox-cdn.com/uploads/chorus_image/image/63339099/lego_spike.0.png" width="300" />
      <p></p>
      <a href="https://www.lego.com/en-us/product/lego-education-spike-prime-set-45678">Get the robot!</a>
  </body>
  </html>`;
}

export default commands;
