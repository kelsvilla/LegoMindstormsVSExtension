import * as vscode                                                from "vscode";
import * as pl                                                    from "./pylex";
import CommandNodeProvider                                        from "./commandNodeProvider";
import Logger                                                     from "./log";
import { lineHighlighter }                                        from "./lineHighlighter";
//import * as path from 'path';
const { spawn } = require('child_process');
import { accessCommands, hubCommands, navCommands, textCommands, voicetotextCommands } from "./commands";
//import { runClient } from "./client";

// Output Logger
const product: string = vscode.workspace.getConfiguration("mind-reader").get("productType")!;
const outputChannel   = vscode.window.createOutputChannel(product + " Output");
export const logger   = new Logger(outputChannel);

let parser: pl.Parser = new pl.Parser();

export function activate(context: vscode.ExtensionContext) {
  const defaults = {
    cwd: "/Users/jigme/Desktop/unt/Fall2022/Mind-Reader",
    env: process.env,
    stdio: [
      0, // Use parent's stdin for child.
      'pipe', // Pipe child's stdout to parent.
      'pipe', // Direct child's stderr to a file.
    ],
  };
  //start voice server
  const server = spawn('sh',['test.sh'],defaults);
  console.log(server);
  server.stderr.on('data',(err:any)=>{
    console.log('error: ',err.toString());
  });
  server.stdout.on('data',(data:any)=>{
    console.log(data.toString());
    // if (data.toString() === ' [1] -> [text]\n   [2] -> [voice]\n   [Exit] -> [exit]\n'){
    //   var readline = require('readline');

    //   var rl = readline.createInterface({
    //       input: process.stdin,
    //       output: process.stdout
    //       });

    //   rl.question(data, function(answer:any) {
    //   console.log("you selected :", answer);
    //   rl.close();
    //               });
    // }
  });
  // server.stdin.on('data',(err:any)=>{
  //   console.log('stdin: ',err.toString());
  // });

  lineHighlighter();

  //runClient(serverModule);

  parser.parse("Beep Boop");

  const allCommands = [
    accessCommands,
    hubCommands,
    navCommands,
    textCommands,
  ].flat(1);

  voicetotextCommands.forEach((command) => {
    context.subscriptions.push(
      vscode.commands.registerTextEditorCommand(command.name, command.callback)
    );
  });

  // Register Commands
  allCommands.forEach((command) => {
    context.subscriptions.push(
      vscode.commands.registerCommand(command.name, command.callback)
    );
  });

  let accessProvider = new CommandNodeProvider(
    [accessCommands, textCommands].flat(1)
  );
  vscode.window.registerTreeDataProvider("accessActions", accessProvider);

  let hubProvider = new CommandNodeProvider(hubCommands);
  vscode.window.registerTreeDataProvider("hubActions", hubProvider);

  vscode.window.showInformationMessage("Mind Reader finished loading!");
}

export function deactivate() {}
