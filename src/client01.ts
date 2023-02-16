import * as WebSocket from 'ws';
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
            socket?.send('Hello I am Client');
        });
        socket.addEventListener('message',(message) =>{
            console.log('[client] received a message: ',message);
        });
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
