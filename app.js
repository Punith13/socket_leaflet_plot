var express = require('express');
var app = express()
   , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);
  
var fs = require('fs');
var port = 3700;

// webserver on port 3700
server.listen(port); 

var socket = io.listen(server);

//use static files in ROOT/public folder
app.use(express.static(__dirname + '/public')); 

// Pipe stream index.html 

app.get("/", function(req, res){ 
   res.writeHead(200,{"Context-Type":"text/html"});
	fs.createReadStream("index.html").pipe(res);
});


app.get("/drop", function(req, res){ 
   res.writeHead(200,{"Context-Type":"text/html"});
	fs.createReadStream("drop.html").pipe(res);
});

var sdtp = require('./controller/senddatatoproc');

socket.on('connection', function(socket) {
   
   sdtp(socket);
   
});


var mssql = require('./controller/mssql');
mssql(app);