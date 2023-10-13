#!/bin/sh

ABSPATH=$(cd "$(dirname "$0")"; pwd -P)
ROOTDIR=(cd "$(dirname "$0")/.."; pwd -P)
ELEVATE='';
if (( $UID !=0 )); 
then 
    ELEVATE='sudo';
fi
cd $ABSPATH
python3 -m venv venv
source venv/bin/activate
which python
pip install --global-option='build_ext' --global-option="-I$ROOTDIR/dependencies/portaudio/19.7.0/include" --global-option="-L$ROOTDIR/dependencies/portaudio/19.7.0/lib" requirements.txt
#pip install -r requirements.txt
