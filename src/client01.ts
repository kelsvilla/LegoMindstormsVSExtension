import * as WebSocket from 'ws';
import * as vscode from 'vscode';
const pjson = require('../package.json');/*this is where the registered commands
are fetched from*/

function voiceCommandCaller(input:string) {

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

export function startStreaming(){
//create socket connection
let socket: WebSocket | null = null;
const socketPort = 12152;
socket = new WebSocket(`ws://localhost:${socketPort}`);
		console.log('[client] socket created .. ');
        //console.log('[client]: socket status',socket.readyState);
        socket.addEventListener('open', (event) =>{
            console.log('[client] is ready to communicate..',event.target.OPEN);
            //socket?.send('Hello I am Client');
        });
        //socket.send('Hello');
        socket.on('message', (message) => {
            console.log('message recived',message);
            voiceCommandCaller(message.toString());
        });
        console.log('[client]: socket status',socket.readyState);
    }

startStreaming();