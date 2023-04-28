import * as WebSocket from 'ws';
import * as vscode from 'vscode';
const { fork } = require('child_process');

export function startStreaming() {
    //create socket connection
    const child = fork('child.ts');
    child.send('Hello, Child!');
    //child.stdout.on('data', function (data:any) {
    //  console.log('stdout: ' + data);
    //});
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
        const cmdMsg = message.toString().split(',');
        vscode.commands.executeCommand(cmdMsg[0]).then(
            (success) => {
                console.log(success);
                setTimeout(() => {
                    vscode.window.showInformationMessage(cmdMsg[1]).then(
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
    });
    console.log('[client]: socket status', socket.readyState);
}
