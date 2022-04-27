import * as vscode      from "vscode";
// import * as fs       from "fs";
// import * as os       from 'os';

import { CommandEntry } from "./commandEntry";

export const navCommands: CommandEntry[] = [
  {
    name: 'mind-reader.openWebview',
    callback: openWebview,
  },
  {
    name: "mind-reader.openKeybinds",
    callback: () => vscode.commands.executeCommand("workbench.action.openGlobalKeybindings", "mind-reader"),
  },

  //Navigation Keys......
  // TODO: Why is this here? Extensions can rebind existing keybinds.
  {
    name: 'mind-reader.showAllSymbols',
    callback: () => vscode.commands.executeCommand('workbench.action.showAllSymbols'),
  },

  {
    name: 'mind-reader.gotoLine',
    callback: () => vscode.commands.executeCommand('workbench.action.gotoLine'),
  },

  {
    name: 'mind-reader.quickOpen',
    callback: () => vscode.commands.executeCommand('workbench.action.quickOpen'),
  },

  {
    name: 'mind-reader.gotoSymbol',
    callback: () => vscode.commands.executeCommand('workbench.action.gotoSymbol'),
  },

  {
    name: 'mind-reader.showProblems',
    callback: () => vscode.commands.executeCommand('workbench.actions.view.problems'),
  },

  {
    name: 'mind-reader.nextInFiles',
    callback: () => vscode.commands.executeCommand('editor.action.marker.nextInFiles'),
  },

  {
    name: 'mind-reader.prevInFiles',
    callback: () => vscode.commands.executeCommand('editor.action.marker.prevInFiles'),
  },

  {
    name: 'mind-reader.showCommands',
    callback: () => vscode.commands.executeCommand('workbench.action.showCommands'),
  },

  {
    name: 'mind-reader.quickOpenPreviousRecentlyUsedEditorInGroup',
    callback: () => vscode.commands.executeCommand('workbench.action.quickOpenPreviousRecentlyUsedEditorInGroup'),
  },

  {
    name: 'mind-reader.navigateBack',
    callback: () => vscode.commands.executeCommand('workbench.action.navigateBack'),
  },

  {
    name: 'mind-reader.getQuickInputBack',
    callback: () => vscode.commands.executeCommand('workbench.action.quickInputBack'),
  },

  {
    name: 'mind-reader.navigateForward',
    callback: () => vscode.commands.executeCommand('workbench.action.navigateForward'),
  },
];

// COMMAND CALLBACK IMPLEMENTATIONS
function openWebview(): void {
  const panel = vscode.window.createWebviewPanel(
    "mindReader",          // Identifies the type of the webview. Used internally
    "Mind Reader",         // Title of the panel displayed to the user
    vscode.ViewColumn.One, // Editor column to show the new webview panel in.
    {}
  ); // Webview options. More on these later.

  panel.webview.html = getWebviewContent();
}

// function getWebviewContent(filepath: string) {
//   return fs.readFileSync(filepath, {encoding: 'utf-8'});
// }

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

// export function getPlatform(): 'windows' | 'mac' | 'linux' | undefined {
//   let platform: 'windows' | 'mac' | 'linux' | undefined;

//   if (os.platform().toUpperCase() === 'WIN32') {
//     platform = 'windows';
//     return platform;
//   }

//   if (os.platform().toUpperCase() === 'DARWIN') {
//     platform = 'mac';
//     return platform;
//   }

//   if (os.platform().toUpperCase() === 'linux') {
//     platform = 'linux';
//     return platform;
//   }

//   platform = undefined;
//   return platform;
// }

// function getDocumentWorkspaceFolder(): string | undefined {
//   const fileName = vscode.window.activeTextEditor?.document.fileName;
//   return vscode.workspace.workspaceFolders
//     ?.map((folder) => folder.uri.fsPath)
//     .filter((fsPath) => fileName?.startsWith(fsPath))[0];
// }

// function openKeyBindWin(): void {
//   //vscode.commands.executeCommand('workbench.action.zoomOut');
//   const panel = vscode.window.createWebviewPanel(
//     'mindReader', // Identifies the type of the webview. Used internally
//     'MR Key Bindings', // Title of the panel displayed to the user
//     vscode.ViewColumn.One, // Editor column to show the new webview panel in.
//     {}
//   ); // Webview options. More on these later.

//   const userPlatform: 'windows' | 'mac' | 'linux' | undefined = getPlatform();

//   switch (userPlatform) {
//     case 'windows':
//       if(vscode.workspace.workspaceFolders !== undefined) {
//         let wf = vscode.workspace.workspaceFolders[0].uri.path;
//         let f = vscode.workspace.workspaceFolders[0].uri.fsPath;
//         const message = `YOUR-EXTENSION: folder: ${wf} - ${f}`;
//         vscode.window.showInformationMessage(message);
//     }
//     else {
//         const message = "YOUR-EXTENSION: Working folder not found, open a folder an try again" ;
//         vscode.window.showErrorMessage(message);
//     }
//       // panel.webview.html = getWebviewContent('media/html/winkeys.html');
//       break;
//     case 'mac':
//       // panel.webview.html = getWebviewContent('media/html/mackeys.html');
//       break;
//     case 'linux':
//       // panel.webview.html = getWebviewContent('media/html/linuxkeys.html');
//       break;
//     default:
//       // panel.webview.html = getWebviewContent("../../media/html/main.html");
//       break;
//   }
// }

// function openKeyBindWin(os: 'Mac' | 'Windows'): void {
//   //vscode.commands.executeCommand('workbench.action.zoomOut');
//   const panel = vscode.window.createWebviewPanel(
//     'mindReader', // Identifies the type of the webview. Used internally
//     'MR Key Bindings', // Title of the panel displayed to the user
//     vscode.ViewColumn.One, // Editor column to show the new webview panel in.
//     {}
//   ); // Webview options. More on these later.

//   if (os === 'Windows') {
//     panel.webview.html = getWebviewContent('WINDOWS');
//     // panel.webview.html = getWebviewContent('/media/html/winkeys.html');
//   } else if (os === 'Mac') {
//     panel.webview.html = getWebviewContent('MAC');
//     // panel.webview.html = getWebviewContent('/media/html/mackeys.html');
//   }
// }

//vscode.commands.executeCommand('workbench.action.openGlobalKeybindings');
