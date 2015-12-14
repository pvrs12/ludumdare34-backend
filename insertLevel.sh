#!/bin/bash
if [ $# -lt 1 ]; then
	echo 'You must provide the file containing the level'
	exit 1
fi
leveldata=$(cat $1)
highestLevel=$(echo "SELECT level FROM levels ORDER BY level DESC LIMIT 1;" | mysql -uweb-user -p$MYSQL_PASSWORD -D ludumdare | tail -n1)
let "highestLevel = $highestLevel+1";
cmd="INSERT INTO levels (level,leveldata) VALUES ($highestLevel,'$leveldata');";
echo $cmd | mysql -uweb-user -p$MYSQL_PASSWORD -D ludumdare
echo $highestLevel
