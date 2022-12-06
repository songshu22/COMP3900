#!/bin/dash

echo 'Installing required packages in a vitural Python environment...'

python3 -m venv env
. env/bin/activate 
pip install -r requirements.txt > /dev/null
