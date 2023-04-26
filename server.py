import subprocess, sys
import os
#Install necessary modules for speech recognition usage.
#subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'SpeechRecognition', 'keyboard', 'PocketSphinx', 'pyaudio'])
import speech_recognition as sr
import socket
import hashlib
import base64
import colorama



from nlp import entity_action_recognizer,identify_command2,syns_load,get_synomymns



def voice_to_text():
    r = sr.Recognizer()

    with sr.Microphone() as source:
        while(True):
            r.adjust_for_ambient_noise(source)
            print('Please give your command. Listening...')

            audio = r.listen(source,timeout=7,phrase_time_limit=5)

            try:
                cmd =  r.recognize_google(audio)
                print('Did you say : ' + cmd)
                return str(cmd)
            
            except Exception as e:
                print("Error r "+ str(e) )
    

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
    print('Ready to communicate with MindReader\n')
#test
def test():
    syns = syns_load()
    uin = voice_to_text()
    entities,action = entity_action_recognizer('can you '+ uin,True)
    command_to_run = identify_command2(entities,action)
    print(command_to_run)



#Port to connect to VSCode using.
def tcp_connection():
    TCP_PORT = 12152
    print('Voice Server Activated [pid] ',os.getpid())
    #Start server socket to communicate.
    serversocket = socket.socket()
   
    serversocket.bind(('', TCP_PORT))
    serversocket.listen()
    #print('Server Socket Created and Listening: \n Server:',serversocket)
    clientsocket, clientaddr = serversocket.accept()
    print('MindReader connected')
    handle_syn_ack(clientsocket) #initail handshake
    #Connect to VSCode client code.
    syns = syns_load()
    user_input = ''
    print()
    print('Please select the command input mode.\n')
    
    mode = 1
    mode = input('   [1] -> [text]\n   [2] -> [voice]\n   [Exit] -> [exit]\n')
    
    while user_input!='Exit': # TO-DO: compare with messag from voice-to-text later.
        #send message to client
        if int(mode) == 1:
            print('[Text Mode]')
            user_input = input('Enter your command: ')
        elif int(mode) == 2:
            user_input = voice_to_text()
        entities,actions,preposition = entity_action_recognizer('can you '+ user_input,True)
        known_entities = []
        new_entities = []
        for entity in entities:
            known_entities.append((entity,get_synomymns(syns,[entity])))
        for knw_ents in known_entities:
            #print('Known Entities after searching for root words: ',knw_ents[1])
            new_entities.append(knw_ents[1])
        if len(new_entities) == len(entities):
            command_to_run,msg = identify_command2(new_entities,actions,preposition)
            response = command_to_run + ',' + msg
            #print('********',msg)
        else:
            command_to_run,msg = identify_command2(entities,actions,preposition)
            response = command_to_run + ',' + msg
        response = bytes(response.encode('utf-8'))
        print('Action Completed: ',msg)
        response_len = int(hex(len(response)),16)
        print()
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
    #clientsocket.close()

if __name__ == '__main__':
   tcp_connection()

   