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
# CFLAGS="-I$ROOTDIR/dependencies/portaudio/19.7.0/include"
# LDFLAGS="-L$ROOTDIR/dependencies/portaudio/19.7.0/lib"
# cp -r $ROOTDIR/dependencies/portaudio /opt/homebrew/opt

# pip install --upgrade pip setuptools wheel
pip install -r requirements.txt


cd "$ROOTDIR/dependencies/PyAudio-0.2.13/portaudio-v19"
# ./configure --disable-mac-universal && make
make
make install

cd ..
export CFLAGS="-I $ROOTDIR/dependencies/PyAudio-0.2.13/portaudio-v19/include/ -L $ROOTDIR/dependencies/PyAudio-0.2.13/portaudio-v19/lib/"
# python3 setup.py build
# python3 setup.py install
pip install .
# pip install "$ROOTDIR/dependencies/PyAudio-0.2.13"
