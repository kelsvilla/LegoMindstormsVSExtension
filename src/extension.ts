import * as vscode                                                from "vscode";
import * as pl                                                    from "./pylex";
import CommandNodeProvider                                        from "./commandNodeProvider";
import Logger                                                     from "./log";
import { lineHighlighter }                                        from "./lineHighlighter";
//import * as path from 'path';
const { fork } = require('child_process');
import { accessCommands, hubCommands, navCommands, textCommands } from "./commands";
//import { runClient } from "./client";

// Output Logger
const product: string = vscode.workspace.getConfiguration("mind-reader").get("productType")!;
const outputChannel   = vscode.window.createOutputChannel(product + " Output");
export const logger   = new Logger(outputChannel);

let parser: pl.Parser = new pl.Parser();

export function activate(context: vscode.ExtensionContext) {
    /*activate voice command server
    //create a new child process to activate python voice server
    //fork is used so that the main thread does not have to wait for child process to complete.*/
    const child = fork('activateServer.ts');
    console.log('Foked to start server with pid.',child.pid);

    /*Issue:
    The creation of child is successful. The child.connected is 'true' indicating parent and child
    processes are ready to communicate, but when using child.send(msg), the child does not receive the message*/

    //if( child.connected === true){
      //console.log('parent and child is connected.');
      //send message to child
      child.send('start');
   // }
  //   child.stdout.on('data', function (data:string) {
  //     console.log('stdout: ' + data);
  // });

	  /*const serverModule = context.asAbsolutePath(
		path.join('node_modules', 'server', 'server.js')
	);*/

  // Engage LineHighlighter
  lineHighlighter();

  //runClient(serverModule);

  parser.parse("Beep Boop");

  const allCommands = [
    accessCommands,
    hubCommands,
    navCommands,
    textCommands,
  ].flat(1);

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
