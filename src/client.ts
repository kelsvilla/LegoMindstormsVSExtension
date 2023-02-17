import { workspace, commands } from 'vscode';
import * as WebSocket from 'ws';

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient';

const pjson = require('../package.json');//this is where the registered commands are fetched from
import * as vscode from 'vscode';
export function voiceCommandCaller(input:string) {

    //break down the input string
    let tokens = input.split(" ");
    //figure out the command to run based on input
    let commandToRun = "";
    let acceptedTokens: String[] = [];
    let rejectedTokens: String[] = [];
    //collect available functions
    const commands = pjson.contributes.commands;
    /*naive search for identifying command matching input.
    TO-DO: apply better approach to identify commands if possible
    The user input is compaired against the command title, the titles are attached to the command during registration
    */
    commands.forEach((command: vscode.Command) => {
        tokens.forEach((token=> {
        if(command.title.includes(token)){
           acceptedTokens.push(token);
           //test
           console.log("[test] accepted tokens: ",acceptedTokens);
           /* if all the tokens are part of a command lable then we can
           safely assume that the associated to the command lable is the
           one we are looking for */
           if(acceptedTokens.length===tokens.length){
            console.log('Pass: all tokens identified');
            //set command to run when this command is accepted
            commandToRun = command.command;
            //test
            console.log('[test] identified command to run: ', commandToRun);
           }
        }
        /* keep record of the rejected tokens for further analysis.
          for example:
          user might say 'Increase Font Size' instead of 'Increase Font Scale',
          which is a valid command and we should be taken into consideration.
        */
        else{
            rejectedTokens.push(token);
        }
        }));
        acceptedTokens = []; //reset
    });
    //call the command
    if (commandToRun!==""){
    const cmd = vscode.commands.executeCommand(commandToRun);
    console.log(cmd);
    }
    }

let client: LanguageClient;
let socket: WebSocket | null = null;

export function runClient(serverModule: string) {
    const socketPort = workspace.getConfiguration('languageServerExample').get('port', 12152);

	commands.registerCommand('languageServerExample.startStreaming', () => {
		//todo: run server using command line
		//for testing: run server maually through command line
		// Establish websocket connection
		socket = new WebSocket(`ws://localhost:${socketPort}`);
		console.log('[client socket created] : ',socket);
		console.log('[client socket readyState]: ',socket.readyState);
		if(socket!==null){
			socket.addEventListener('open', (event) =>{
				console.log('[client] is ready to communicate..',event.target.OPEN);
				//socket?.send('Hello I am Client');
			});
			socket.on('message',(message) => {
			let command = message.toString();
			console.log(`[message] Data received from server: `,command);
			voiceCommandCaller(command);
		  });
		}
	});

	// The debug options for the server
	// --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
	const debugOptions = { execArgv: ['--nolazy', '--inspect=12152'] }; //I assume since our server can only handle one connection at a time
	//the server refuses connection from the debugger.

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	const serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions
		}
	};

	// Options to control the language client
	const clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: [{ scheme: 'file', language: 'plaintext' }],
		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		}
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'languageServerExample',
		'Language Server Example',
		serverOptions,
		clientOptions
	);

	// Start the client. This will also launch the server
	console.log('[Start] starting client..');
	client.start();
	console.log('[Start] started client..');

}

export function callVoice() {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send("PING");
    }
}

export function deactivate() {
	if (!client) {
		return undefined;
	}
	return client.stop();
}