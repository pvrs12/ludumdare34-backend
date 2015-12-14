#!/bin/bash
if [ $# -lt 2 ]; then
	echo 'You must provide the file containing the level and the level number'
	exit 1
fi
levelnum=$2
leveldata=$(cat $1)
cmd="UPDATE levels SET leveldata='$leveldata' where level=$levelnum;";
echo $cmd | mysql -uweb-user -p$MYSQL_PASSWORD -D ludumdare
echo $levelnum
