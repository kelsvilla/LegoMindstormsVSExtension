var os = require('os');
const { exec } = require('child_process');
import { rootDir } from "./extension";

export function installer(){
    if (os.type()==='Darwin'){
    const scriptPath = rootDir.replace('/out','/voice-server-setup/');
    // exec('xattr -d com.apple.quarantine '+ scriptPath + 'initial_set_up_macos.sh', (error:any, stdout:any, stderr:any) => {
    //   if (error) {
    //     console.error(`exec error: ${error}`);
    //     return;
    //   }
    //   console.log(`stdout: ${stdout}`);
    //   console.error(`stderr: ${stderr}`);
    // });
    exec('sh '+ scriptPath + 'initial_set_up_macos.sh', (error:any, stdout:any, stderr:any) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
}
  else if (os.type()==='Windows_NT'){
    exec('./voice-server-setup/initial_set_up_windows.sh', (error:any, stdout:any, stderr:any) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    });

  }
}