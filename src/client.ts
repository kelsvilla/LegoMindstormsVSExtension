import { workspace, commands } from 'vscode';
import * as WebSocket from 'ws';

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient';

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
		console.log('[client socket status]: ',socket.OPEN);
		if(socket!==null){

		socket.on('open',()=>{
			socket?.send('Hello from client, client connected ...');
		});
		socket.onmessage = function(event) {
			console.log(`[message] Data received from server: ${event.data}`);
		  };
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