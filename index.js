var express = require("express");
var fs = require("fs");
var mysql = require("mysql");
var crypto = require("crypto");

var connection = mysql.createConnection({
	user:'web-user',
	password:process.env.MYSQL_PASSWORD,
	database:'ludumdare'
});

connection.connect();
console.log("Connecting to database...");
connection.query("CREATE TABLE IF NOT EXISTS levels (level integer not null, leveldata text not null, primary key(level))");
connection.query("CREATE TABLE IF NOT EXISTS users (id text not null)");
connection.query("CREATE TABLE IF NOT EXISTS levelscores (level integer not null, user text not null, score integer not null)");

var app = express();

app.post('/user/',function(req,res){
	//create a new userid
	valid=false;
	var num = 0;
	var hash = "";
	var done = false;
	num = Math.random() * 100000;
	hash = crypto.createHash('md5').update(""+num).digest("hex");
	connection.query("SELECT COUNT(*) as count FROM users WHERE id = ?",hash,function(err,rows,fields){
		if(rows[0].count == 0){
			valid = true;
		} else {
			//this is hacky as fuck....
			//it just re-hashes if there was a clash
			hash = crypto.createHash('md5').update(""+hash).digest("hex");
		}
		connection.query("INSERT INTO users (id) VALUES (?)",hash);
		console.log("Generated userid: "+hash);
		res.send(hash);	
	});
});

app.get('/user/:id',function(req,res){
	//get stats for user
	console.log("Getting stats for user "+req.params.id);
	connection.query("SELECT * FROM levelscores WHERE user = ?",req.params.id,function(err,rows,fields){
	  if(err){
			res.send("error");
			return;
		}
		resp="";
		resp+=(rows.length+"\n");
		for(var i = 0;i<rows.length;++i){
			resp+=(rows[i].level+" "+rows[i].score+"\n");
		}
		res.send(resp);
	});
});

app.get('/level/:level/record',function(req,res){
	console.log("Getting level record for level "+req.params.level);
	connection.query("SELECT score FROM levelscores WHERE level = ? ORDER BY score DESC LIMIT 1",req.params.level,function(err,rows,fields){
		if(rows.length < 1){
			res.send(-1+"");
			return;
		}
		res.send(rows[0].score+"");
	});
});

app.get('/level/',function(req,res){
	//coutn of levels
	connection.query("SELECT COUNT(*) as count FROM levels",function(err,rows,fields){
	  console.log("Serving level count: "+rows[0].count);
		res.send(""+rows[0].count);
	});
});

app.get('/level/:level',function(req,res){
	//get level data
	console.log("Serving level "+req.params.level);
	connection.query("SELECT * FROM levels WHERE level = ?",req.params.level,function(err,results,fields){
		if(err){
			console.log(err);
			res.send("error");
			return;
		}
		if(results.length ==0){
			console.log("level "+req.params.level+" not found");
			res.send("level not found");
		}
		console.log("level served "+results[0].leveldata);
		res.send(results[0].leveldata);
	});
});

app.post('/level/:level/user/:id/score/:score',function(req,res){
	//post score for level (easy to cheat)
	console.log("Posting new score for level "+req.params.level);
	if(req.params.score<1){
		res.send("invalid score");
		return;
	}
	connection.query("SELECT COUNT(*) as count FROM users WHERE id = ?",req.params.id,function(err,results,fields){
		if(results[0].count == 0){
			res.send("userid not found");
			return;
		} else {
			connection.query("SELECT COUNT(*) as count FROM levels WHERE level = ?",req.params.level,function(err,results,fields){
				if(results[0].count == 0){
					res.send("level not found");
					return;
				} else {
					connection.query("INSERT INTO levelscores (level,user,score) VALUES (?,?,?)",[req.params.level,req.params.id,req.params.score]);
					res.send("score posted");
				}
			});
		}
	});
});	

app.get('/level/:level/stats',function(req,res){
	//get stats for level
	console.log("Getting stats for level "+req.params.level);
	connection.query("SELECT * FROM levelscores WHERE level = ?",req.params.level,function(err,rows,fields){
	  if(err){
			res.send("error");
			return;
		}
		resp="";
		resp+=(rows.length+"\n");
		for(var i = 0;i<rows.length;++i){
			resp+=(rows[i].user+" "+rows[i].score+"\n");
		}
		res.send(resp);
	});
});

app.listen(8000);
