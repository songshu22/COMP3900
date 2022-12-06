#!/bin/bash
echo 'Setting up app...'

# Upate packages with no prompts
# NB: Enter password where promped
echo 'Updating packages'

# Check if docker installed
echo 'Checking if docker installed...'
if ! command -v docker &> /dev/null
then
    echo 'Docker not found - Installing docker...'
    # Install / check curl 
    sudo apt update
    sudo apt install curl -y
    
    # install docker using convenience script
    curl -fsSL https://get.docker.com -o get-docker.sh
    if `sudo sh get-docker.sh &> /dev/null`
    then
        echo 'Docker installed!'
    else
        RED="\033[0;31m"
        NO_COLOUR="\033[0m"
        printf "${RED}Error installing docker, please visit https://docs.docker.com/get-docker/ to install docker for you system.${NO_COLOUR}\n"
        exit
    fi
    
else
    echo 'Docker installed!'
fi


if [[ "$USER" == "lubuntu"* ]]; then
    # Install google chrome and open to the application
    wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
    sudo apt install ./google-chrome-stable_current_amd64.deb
    google-chrome localhost &
fi

echo 'Running app...'
sudo docker compose up