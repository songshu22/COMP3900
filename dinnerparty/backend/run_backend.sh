#!/bin/dash
. ./env/bin/activate
echo 'Running backend server on port 81'
python3 src/manage.py runserver 0.0.0.0:81