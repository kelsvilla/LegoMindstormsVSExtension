import * as WebSocket from 'ws';
//import { voiceCommandCaller } from './commands/commandCaller';
//const pjson = require('../package.json');//this is where the registered commands are fetched from
/*import * as vscode from 'vscode';
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
   /*
    commands.forEach((command: vscode.Command) => {
        tokens.forEach((token=> {
        if(command.title.includes(token)){
           acceptedTokens.push(token);
           //test
           console.log("[test] accepted tokens: ",acceptedTokens);
           /* if all the tokens are part of a command lable then we can
           safely assume that the associated to the command lable is the
           one we are looking for */
    /*
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
    /*
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
*/
function test(){
let socket: WebSocket | null = null;
const socketPort = 12152;
socket = new WebSocket(`ws://localhost:${socketPort}`);
		console.log('[client] socket created .. ');
		if(socket!==null){
            console.log('[client]: socket status',socket);
            console.log('[client]: socket protocol',socket.protocol);

        }
        console.log('[client]: socket status',socket.readyState);
        socket.addEventListener('open', (event) =>{
            console.log('[client] is ready to communicate..',event.target.OPEN);
            //socket?.send('Hello I am Client');
        });
        /*socket.addEventListener('message',(message) =>{
            console.log('[client] received a message: ',message);
            //voiceCommandCaller(message.data.toString());
        });*/
        //socket.send('Hello');
        socket.on('message', (message) => {
            console.log('message recived',message);
        });
        console.log('[client]: socket status',socket.readyState);
    }

// function sendMessage(msg:string){
//         const socketPort = 12152;
//         const ws = new WebSocket(`ws://localhost:${socketPort}`,'http');

//         // Wait until the state of the socket is not ready and send the message when it is...
//         waitForSocketConnection(ws, function(){
//             console.log("message sent!!!");
//             ws.send(msg);
//         });
//     }
//     // Make the function wait until the connection is made...
// function waitForSocketConnection(socket:WebSocket, callback:any){
//         setTimeout(
//             function () {
//                 if (socket.readyState === 1) {
//                     console.log("Connection is made");
//                     if (callback !== null){
//                         callback();
//                     }
//                 } else {
//                     console.log("wait for connection...");
//                     waitForSocketConnection(socket, callback);
//                 }
//             }, 5);// wait 5 milisecond for the connection...
//          }
// sendMessage('hello');
test();
