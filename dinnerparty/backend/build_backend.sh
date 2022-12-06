#!/bin/dash

echo 'Running migrations on database...'

. env/bin/activate 

# keep adding when new apps are added

python src/manage.py makemigrations accounts
python src/manage.py makemigrations ingredients
python src/manage.py makemigrations recipes
python src/manage.py makemigrations event_sessions

python src/manage.py makemigrations
python src/manage.py migrate 
