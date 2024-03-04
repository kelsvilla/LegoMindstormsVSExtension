#!/bin/bash

if command -v festival &> /dev/null; then
    echo "festival is already installed."
else

    echo "Installing Festival..."

    if command -v apt-get &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y festival festvox-kallpc16k
    
    elif command -v yum &> /dev/null; then
        sudo yum install -y festival festvox-kallpc16k
    
    else
        echo "Unsupported package manager. Please install festival manually."
        exit 1
    fi 

    echo "Festival has successfully been installed."

fi