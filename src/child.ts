//import { ChildProcess } from "child_process";

const { exec } = require("child_process");
//create an event listener for incomming message from parent
//issue: for some reason this event listerner is not activate after parent sends some message.
process.on("message", (message) => {
	console.log("message received from parent: ", message);
	exec(
		"source /Users/jigme/Desktop/unt/Fall2022/Mind-Reader/venv/bin/activate && which python && python3 /Users/jigme/Desktop/unt/Fall2022/Mind-Reader/server.py",
		function (error: any, stdout: any, stderr: any) {
			console.log("stdout: " + stdout);
			console.log("stderr: " + stderr);
			if (error !== null) {
				console.log("exec error: " + error);
			}
		},
	);
});

/*if(message ==='start'){
     console.log('pid of server : ',exec.pid);
	 console.log('Activating virtual environment.');
     //[Note: exec completely replaces the current process and takes control]

     //TO-DO: create virtual environment and use dynamic urls to activate it.
	 exec('source /Users/jigme/Desktop/unt/Fall2022/Mind-Reader/venv/bin/activate && which python && python3 /Users/jigme/Desktop/unt/Fall2022/Mind-Reader/server.py',function (error:any, stdout:any, stderr:any) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
             console.log('exec error: ' + error);
        }
	 });
    }*/

//});
