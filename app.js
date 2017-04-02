var express = require('express'); //express
var http = require('http');	//http object
var port = 3000||process.env.PORT;	
app = express();		//express object run

var server = http.createServer(app);//http server,using app
var io = require('socket.io')(server);//attaching socket into the server

app.use(express.static('public'))

app.get('/',function(req,res){
	res.sendFile(__dirname+"/views/index.html");
});

io.on('connection',function(socket){
	socket.on('new user',function(user){
		console.log(user+" connected");
	});
	socket.on('new msg',function(obj){
		io.emit('msg',obj);
	});
	socket.on('clear all',function(obj){
		io.emit('clear');
	});
});

server.listen(port,function(){
	console.log("Server running at "+ port);
});