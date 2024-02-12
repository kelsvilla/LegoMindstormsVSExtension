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
pip install -r requirements.txt

cd $ROOTDIR/dependencies/portaudio
./configure --disable-mac-universal && make
cd $ROOTDIR/dependencies/portaudio/lib/.libs
find . -maxdepth 1 -exec mv {} .. \;

CFLAGS='-I${ROOTDIR}/dependencies/portaudio/include -L${ROOTDIR}/dependencies/portaudio/lib'
pip install ${ROOTDIR}/dependencies/PyAudio-0.2.14