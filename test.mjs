import * as fs from "fs"

let commands = JSON.parse(fs.readFileSync("package.json","utf8"))["contributes"]["commands"]

console.log(commands)

for (let command of commands) {
    let humanReadable = command.command.replace(/^mind-reader\./, ''); // strip extensions name
      // Convert camelCaseText to Title Case Text
      humanReadable = humanReadable.replace(/([A-Z])/g, ' $1');
      humanReadable = humanReadable.charAt(0).toUpperCase() + humanReadable.slice(1);
      command["voiceEntry"] = humanReadable
}

console.log(JSON.stringify(commands))