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
