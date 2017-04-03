var express = require('express'); //express
var http = require('http');	//http object
var port = process.env.PORT||3000;	
app = express();		//express object run

var server = http.createServer(app);//http server,using app
var io = require('socket.io')(server);//attaching socket into the server

var numofUsers=0;
var Users={};

app.use(express.static('public'))

app.get('/',function(req,res){
	res.sendFile(__dirname + "/views/index.html");
});

io.on('connection',function(socket){
	socket.on('new user',function(user){
		Users[socket.id]={'user':user,'typing':false};
		io.emit('setUsers',Users);
	});
	socket.on('new msg',function(obj){
		io.emit('msg',obj);
	});
	socket.on('clear all',function(obj){
		io.emit('clear');
	});
	socket.on('poke',function(obj){
		io.emit('poking',obj);
	});
	socket.on('typing',function(userName){
		Users[socket.id].typing=true;
		io.emit('setUsers',Users);
	})

	socket.on('stopped typing',function(userName){
		Users[socket.id].typing=false;
		io.emit('setUsers',Users);
	})
	socket.on('disconnect',function(){
		io.emit('stopped typing',Users[socket.id]);
		delete Users[socket.id];
		io.emit('setUsers',Users);
	});
});

server.listen(port,function(){
	console.log("Server running at "+ port);
});
