import * as WebSocket from "ws";
import * as vscode from "vscode";
import * as path from "path";
var os = require("os");
const { spawn } = require("child_process");
import { rootDir } from "./extension";
function activateVoiceServer() {
	//activate server
	//Gets expected path of virtual python interpretor, which is $ROOTDIR/voice-server-setup/venv/{bin | Scripts}/python
	const normalizedProjectRoot = path
		.normalize(rootDir)
		.replace(`${path.sep}out`, "");
	const interpretor = path.join(
		normalizedProjectRoot,
		`voice-server-setup`,
		"venv",
		`${os.type() === "Darwin" ? "bin" : "Scripts"}`,
		"python",
	);
	const defaults = {
		cwd: normalizedProjectRoot,
		env: {
			...process.env,
			NLTK_DATA: path.join(
				normalizedProjectRoot,
				"dependencies",
				"nltk_data",
			),
		},
		stdio: [
			"pipe", // Use parent's stdin for child.
			"pipe", // Pipe child's stdout to parent.
			"pipe", // pipe child's stderr to a parent.
		],
	};
	//console.log('test: ${workspaceFolder}');
	//start voice server
	const server = spawn(interpretor, ["server.py"], defaults);
	vscode.window.showInformationMessage("Server Started");
	return server;
}
function runClient()
{
    let socket: WebSocket | null = null;
    const socketPort = 12152;
    socket = new WebSocket(`ws://localhost:${socketPort}`);
    console.log('[client] socket created .. ');
    //console.log('[client]: socket status',socket.readyState);
    socket.addEventListener('open', (event) => {
        console.log('[client] is ready to communicate..', event.target.OPEN);
        //socket?.send('Hello I am Client');
    });
    //socket.send('Hello');
    socket.on('message', (message) => {
        console.log('message recived', message);
        //const cmd = vscode.commands.executeCommand(message.toString());
        if (message.toString()!=='Shutting down voice commands.')
        {
        if(message.toString().split(',').length !== 2) return;
        const [cmdName, logMsg] = message.toString().split(',');
        vscode.commands.executeCommand(cmdName).then(
            () => {
                console.log('command to run success:',cmdName);
                setTimeout(() => {
                    vscode.window.showInformationMessage(logMsg).then(
                        (success) => {
                            console.log(success);
                        }, (reject) => {
                            console.log(reject);
                        }
                    );
                }, 5);

            }, (reject) => {
                vscode.window.showInformationMessage("Action Cannot be Completed!");
                console.log(reject);
            });
        }
        else{
            vscode.window.showInformationMessage("Exiting Voice Commands.");
        }
    });
    //console.log('[client]: socket status', socket.readyState);
}

export function startStreaming() {
	/* activate the voice server */
	const server = activateVoiceServer();

	//stderr -> vscode error
	server.stderr.on("data", (err: any) => {
		console.log("error: ", err.toString());
		vscode.window.showErrorMessage(err.toString());
	});
	//child stdout -> vscode info
	server.stdout.on("data", (data: any) => {
		console.log("python message: ", data.toString());
		//server ready for connection
		var serverMsg = data.toString();
		if (data.toString() === serverMsg) {
			/* start client */
			console.log("server is ready..");
			runClient();
		} else {
			console.log("server not ready yet");
			console.log(serverMsg);
		}
		vscode.window.showInformationMessage(data.toString());
	});
}
