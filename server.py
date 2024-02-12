import speech_recognition as sr
import socket
import hashlib
import base64
import os
from nlp import NaturalLanguageProcessor, Command

def voice_to_text():
    r = sr.Recognizer()

    with sr.Microphone() as source:
        r.adjust_for_ambient_noise(source)
        while(True):
            print('Please give your command. Listening...',flush=True)

            try:
                audio = r.listen(source,timeout=7,phrase_time_limit=5)
                cmd =  r.recognize_google(audio)
                print('Did you say : ' + cmd,flush=True)
                return str(cmd)
            
            except (Exception, sr.exceptions.WaitTimeoutError) as e:
                if type(e) != sr.exceptions.WaitTimeoutError and type(e) != sr.exceptions.UnknownValueError:
                    print("There was an issue with the microphone input.", flush=True)

def handle_syn_ack(clientsocket):
    #syn msg is received from the client upon successful connection
    syn_request = clientsocket.recv(2000)
    request = syn_request.decode('utf-8')
    #collect key to generate accept key
    keys_pos = request.find('Sec-WebSocket-Key')
    start_pos = keys_pos + 19 #watch out! This may change in future.
    end = start_pos + 24
    key = request[start_pos:end]
    h = hashlib.sha1((key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').encode('utf-8'))
    accept = bytes(base64.b64encode(h.digest()))

    #send ack message to client
    clientsocket.sendall(b'HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: '+accept+b'\r\n\r\n')

#Port to connect to VSCode using.
def tcp_connection():
    TCP_PORT = 12152

    #Start server socket to communicate.
    serversocket = socket.socket()
    try:
        serversocket.bind(('', TCP_PORT))
        
    except OSError as ose:
        print('address already in use. Kill previous attached server. Terminating for now',flush=True) #address already in use

    serversocket.listen()
    print("OK",flush=True)
    clientsocket, clientaddr = serversocket.accept()
    print('Server connection to Mind-Reader successful',flush=True)
    handle_syn_ack(clientsocket) #initial handshake
    #Connect to VSCode client code.
    #Initialize NLP class to hold costly state between commands
    nlp = NaturalLanguageProcessor(langLocation=os.path.join(os.getenv('SPACY_DATA'), "en_core_web_md", "en_core_web_md-3.7.1"))
    user_input = ''
    
    mode = 2 #Relic of older code where text mode was used to debug.
    while user_input!='exit':
        #Initialize message sent to client
        response = ''

        if int(mode) == 1:
            print('[Text Mode]')
            user_input = input('Enter your command: ')
        elif int(mode) == 2:
            user_input = voice_to_text()
            if user_input == 'exit':
                response = 'Shutting down voice commands.'
                break
        
        matches: list[Command] = nlp.get_similar_commands(user_input)
        if matches[0]["similarity"] > 0.7:
            response = f"{matches[0]['command']},_"

        #Valid command was received, send response to client
        if response != '':
            response = bytes(response.encode('utf-8'))
            response_len = int(hex(len(response)),16)
            #a message should be sent following the websocket protocol.
            # Create a websocket frame containing the message
            frame = bytearray()
            
            # Append frame header, (use hexadecimal) 
            frame.append(0x81)  # FIN + OpCode (1 byte)
            frame.append(response_len)  # Payload length (msg_len byte), 
            # Append payload
            frame.extend(response)
            
            #send message to client
            clientsocket.send(frame)


    response = bytes(response.encode('utf-8'))
    response_len = int(hex(len(response)),16)
    #a message should be sent following the websocket protocol.

    # Create a websocket frame containing the message
    frame = bytearray()
    
    # Append frame header, (use hexadecimal) 
    frame.append(0x81)  # FIN + OpCode (1 byte)
    frame.append(response_len)  # Payload length (msg_len byte), 
    # Append payload
    frame.extend(response)
    
    #send message to client
    clientsocket.send(frame)
    clientsocket.close()

if __name__ == '__main__':
        tcp_connection()
