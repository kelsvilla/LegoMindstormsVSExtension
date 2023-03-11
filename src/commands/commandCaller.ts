const pjson = require('../../package.json');//this is where the registered commands are fetched from
import * as vscode from 'vscode';

//to do: make the function take command as an argument once the voice input has been processed
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
       else{
        commandToRun = "";
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
else{
  console.log('The command cannot be fulfilled.');
}
}



