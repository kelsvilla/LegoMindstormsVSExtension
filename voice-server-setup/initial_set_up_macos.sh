#!/bin/sh

ABSPATH=$(cd "$(dirname "$0")"; pwd -P)
ROOTDIR=$(cd "$(dirname "$0")/.."; pwd -P)
ELEVATE='';
if (( $UID !=0 )); 
then 
    ELEVATE='sudo';
fi
cd $ABSPATH
python3 -m venv venv
source venv/bin/activate
which python
LDFLAGS="-L/opt/homebrew/Cellar/portaudio/19.7.0/lib" CFLAGS="-I/opt/homebrew/Cellar/portaudio/19.7.0/include" pip install -r requirements.txt
