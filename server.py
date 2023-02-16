import subprocess, sys
import os
#Install necessary modules for speech recognition usage.
#subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'SpeechRecognition', 'keyboard', 'PocketSphinx', 'pyaudio'])
import requests
import speech_recognition as sr
import keyboard, socket, time
import hashlib
import base64, struct

def handle_syn_ack(clientsocket):
    #syn msg is received from the client upon successful connection
    syn_request = clientsocket.recv(2000)
    print('syn_request ',syn_request)
    request = syn_request.decode('utf-8')
    #collect key to generate accept key
    keys_pos = request.find('Sec-WebSocket-Key')
    start_pos = keys_pos + 19
    end = start_pos + 24
    key = request[start_pos:end]
    h = hashlib.sha1((key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').encode('utf-8'))
    accept = bytes(base64.b64encode(h.digest()))

    # print('swk: ',key)
    # print('length: ',len(key))
    # print('accept: ',accept)

    #send ack message to client
    clientsocket.sendall(b'HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: '+accept+b'\r\n\r\n')
    print('Handshake Complete with client: ')
    #send message:

#Port to connect to VSCode using.
TCP_PORT = 12152

#Start server socket to communicate.
serversocket = socket.socket()

serversocket.bind(('', TCP_PORT))
serversocket.listen()
print('Server Socket Created and Listening: \n Server:',serversocket)

#Connect to VSCode client code.
while True:
    clientsocket, clientaddr = serversocket.accept()
    print('cliensocket: ',clientsocket)
    print('clienaddr: ',clientaddr)
    handle_syn_ack(clientsocket) #initail handshake

    #send message to client test
    msg = bytes('Hello Word'.encode('utf-8'))
    msg_len = len(msg)
    # Create a websocket frame
    frame = bytearray()
    
    # Append frame header, (use hexadeciaml) 
    frame.append(0x81)  # FIN + OpCode (1 byte)
    frame.append(0x0A)  # Payload length (1 byte), 
    # Append payload
    frame.extend(msg)

    clientsocket.send(frame)
    #Initialize microphone as default audio input.

    microphone = sr.Microphone()
    
    #Initialize recognizer object.
    recognizeMachine = sr.Recognizer()
    
   
    
    

# while True:
#     #Wait for keypress repeatedly.
#     #keyboard.wait("x")
#     print("Starting listen now:")
    
#     answer = 'Increase Font Scale'
    
#     while True:
#         #Loop until recognizer returns string.
#         with microphone as audiosource:
#             recognizeMachine.adjust_for_ambient_noise(audiosource) #Help with background noise.
#             sound = recognizeMachine.listen(audiosource) #Listen to microphone for recognition data.
        
#         #Use Pocket Sphinx to analyze and return string.
#         answer = recognizeMachine.recognize_sphinx(sound)
        
#         #Print string response for testing purposes.
#         print(answer)

#         if answer:
#             #Send string over port to VSCode.
#             clientsocket.send(answer.encode())
#             break
    
#     if answer == 'goodbye' or answer == 'good buy':
#         break

# #Close socket port.
clientsocket.close()