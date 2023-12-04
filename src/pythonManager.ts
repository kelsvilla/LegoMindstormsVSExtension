var os = require("os");
const { exec } = require("child_process");
import { rootDir } from "./extension";
import * as path from "path";

export function installer() {
	const scriptPath = path
		.normalize(rootDir)
		.replace(`${path.sep}out`, `${path.sep}voice-server-setup${path.sep}`);
	if (os.type() === "Darwin") {
		// exec('xattr -d com.apple.quarantine '+ scriptPath + 'initial_set_up_macos.sh', (error:any, stdout:any, stderr:any) => {
		//   if (error) {
		//     console.error(`exec error: ${error}`);
		//     return;
		//   }
		//   console.log(`stdout: ${stdout}`);
		//   console.error(`stderr: ${stderr}`);
		// });
		exec(
			"sh " + scriptPath + "initial_set_up_macos.sh",
			(error: any, stdout: any, stderr: any) => {
				if (error) {
					console.error(`exec error: ${error}`);
					return;
				}
				console.log(`stdout: ${stdout}`);
				console.error(`stderr: ${stderr}`);
			},
		);
	} else if (os.type() === "Windows_NT") {
		exec(
			`${scriptPath}initial_set_up_windows.bat`,
			(error: any, stdout: any, stderr: any) => {
				if (error) {
					console.error(`exec error: ${error}`);
					return;
				}
				console.log(`stdout: ${stdout}`);
				console.error(`stderr: ${stderr}`);
			},
		);
	}
}
