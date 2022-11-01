import subprocess, sys

#Install necessary modules for speech recognition usage.
subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'SpeechRecognition', 'keyboard', 'PocketSphinx', 'pyaudio'])

import speech_recognition as sr
import keyboard, socket, time

#Port to connect to VSCode using.
TCP_PORT = 12152

#Start server socket to communicate.
serversocket = socket.socket()
serversocket.bind(('', TCP_PORT))
serversocket.listen(10)

#Connect to VSCode client code.
clientsocket, clientaddr = serversocket.accept()

#Initialize microphone as default audio input.
microphone = sr.Microphone()

#Initialize recognizer object.
recognizeMachine = sr.Recognizer()

while True:
    #Wait for keypress repeatedly.
    keyboard.wait("x")
    print("Starting listen now:")
    
    answer = ''
    
    while True:
        #Loop until recognizer returns string.
        with microphone as audiosource:
            recognizeMachine.adjust_for_ambient_noise(audiosource) #Help with background noise.
            sound = recognizeMachine.listen(audiosource) #Listen to microphone for recognition data.
        
        #Use Pocket Sphinx to analyze and return string.
        answer = recognizeMachine.recognize_sphinx(sound)
        
        #Print string response for testing purposes.
        print(answer)

        if answer:
            #Send string over port to VSCode.
            clientsocket.send(answer.encode())
            break
    
    if answer == 'goodbye' or answer == 'good buy':
        break

#Close socket port.
clientsocket.close()