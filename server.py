

import subprocess, sys
#Install necessary modules for speech recognition usage.

subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'SpeechRecognition', 'keyboard', 'PocketSphinx', 'pyaudio'])

import speech_recognition as sr
import socket
import hashlib
import base64
# import colorama

import os, time



from nlp import entity_action_recognizer,identify_command2,syns_load,alternatives,buildEntities



def voice_to_text():
    r = sr.Recognizer()

    with sr.Microphone() as source:
        r.adjust_for_ambient_noise(source)
        while(True):
            print('Please give your command. Listening...',flush=True)
            audio = r.listen(source,timeout=7,phrase_time_limit=5)

            try:
                cmd =  r.recognize_google(audio)
                print('Did you say : ' + cmd,flush=True)
                return str(cmd)
            
            except (Exception,sr.exceptions.WaitTimeoutError) as e:
                time.sleep(5) 

    

def handle_syn_ack(clientsocket):
    #syn msg is received from the client upon successful connection
    syn_request = clientsocket.recv(2000)
    #print('syn_request ',syn_request)
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
    #print('Handshake Complete with client ',clientsocket.getsockname())



#Port to connect to VSCode using.
def tcp_connection():
    TCP_PORT = 12152

    #Start server socket to communicate.
    serversocket = socket.socket()
    try:
        serversocket.bind(('', TCP_PORT))
        
    except OSError as ose:
        print('address already in use. Kill previous attached server. Terminating for now',flush=True) #address already in use
        #os.system('')
    serversocket.listen()
    print("OK",flush=True)
    time.sleep(10)
    clientsocket, clientaddr = serversocket.accept()
    print('Sever connection to Mind-Reader successful',flush=True)
    handle_syn_ack(clientsocket) #initial handshake
    #Connect to VSCode client code.
    syns = syns_load()
    user_input = ''
    #print()
    #print('Please select the command input mode.\n')
    
    
    mode = 2
    #mode = input('   [1] -> [text]\n   [2] -> [voice]\n   [Exit] -> [exit]\n')
    
    while user_input!='exit': # TO-DO: compare with messag from voice-to-text later.
        #send message to client
       
        response = ''

        if int(mode) == 1:
            print('[Text Mode]')
            user_input = input('Enter your command: ')
        elif int(mode) == 2:
            user_input = voice_to_text()
            if user_input == 'exit':
                response = 'Shutting down voice commands.'
                break
        
        entities,actions,preposition = entity_action_recognizer('can you '+ user_input,True)

        if len(entities) == 0 or len(actions) == 0:
            print('Unable to recognize entity or action. Command will not be executed. Try using other variations',flush=True)
        else:
            #print(entities,actions,preposition)
            new_entities = [] 
            for entity in entities:
                #create entities by using root words.
                new_entities.append(buildEntities(alternatives(syns,[entity])))
            if preposition == '':
                new_entitis = new_entities[0]
                for new_entity in new_entitis:
                    command_to_run,msg = identify_command2([new_entity],actions,preposition)
                    if command_to_run != 'NULL':
                        response = command_to_run + ',' + msg
                        break
                #print('********',msg)
            else:
                new_entitis = []
                preceding_ents = new_entities[0]
                trailing_ents = new_entities[1]
                for i in range(0,len(preceding_ents)):
                    for j in range(0,len(trailing_ents)):
                        new_entitis.append([preceding_ents[i],trailing_ents[j]])
                for new_ents in new_entitis:
                    command_to_run,msg = identify_command2(new_ents,actions,preposition)
                    if command_to_run != 'NULL':
                        response = command_to_run + ',' + msg
                        break
            if response != '':
                response = bytes(response.encode('utf-8'))
                #print('Action Completed: ',msg)
                response_len = int(hex(len(response)),16)
                #print()
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
            #break
    response = bytes(response.encode('utf-8'))
    #print('Action Completed: ',msg)
    response_len = int(hex(len(response)),16)
    #print()
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
        # r, w = os.pipe()
        # w = os.fdopen(w, 'w')
        # w.write('Voice Server activating')
        tcp_connection()
    
       
   

   