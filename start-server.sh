#!/bin/bash
if [ -f running ]; then
	screen -r ludumdare
else 
	sleep 5
	screen -dmS ludumdare sh ludumdare.sh
	touch running
fi
