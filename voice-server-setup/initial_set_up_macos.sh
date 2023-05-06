#!/bin/sh
#echo ${PWD}
ABSPATH=$(cd "$(dirname "$0")"; pwd -P)
#echo $ABSPATH
ELEVATE='';
if (( $UID !=0 )); 
then 
    ELEVATE='sudo';
fi
cd $ABSPATH
if [ -d "venv" ]
then 
    echo "Directory venv already exists."
else
    python3 -m venv venv
    source venv/bin/activate
    which python
    pip install -r requirements.txt
fi
