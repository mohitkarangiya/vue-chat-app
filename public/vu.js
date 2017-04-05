var socket = io();

var notif = new Howl({
	      src: ['notif.mp3']
	  });

var closer = new Howl({
	      src: ['closer.mp3']
	  });

var panidarang = new Howl({
	      src: ['panidarang.mp3']
	  });

var playlist={'closer':closer,'notif':notif,'panidarang':panidarang};

socket.on('play music',function(musicName){
	if(playlist[musicName]){
		playlist[musicName].play();
	}
});

socket.on('stop music',function(musicName){
	if(playlist[musicName]){
		playlist[musicName].stop();		
	}
});

socket.on('msg',function(msg){
	playlist['notif'].play();
	app.msgs.push(msg);	
	document.getElementById("bottom").scrollIntoView();
});

socket.on('clear',function(){
	app.msgs=[];
});

socket.on('poking',function(obj){
	if(obj.to==app.user){
		alert(obj.from+" poked you");
	}
});

socket.on('setUsers',function(users){
	app.users = users;
});

var app = new Vue({
	el:'#chatApp',
	data:{
		user:"",
		users:{},
		newUser:true,
		msgs:[],
		msg:"",
		timeoutId:'',
	},
	methods:{
		getUsername:function(){
			if(document.getElementById('nameInput').value!=""){
				this.user = document.getElementById('nameInput').value;
				this.newUser = false;
				socket.emit('new user',this.user);
			}
		},
		sendMsg:function(){
			var msgBox = document.getElementById('msgBox').value;
			if(msgBox=="/clear"){
				msgBox="";
				this.msg="";
				socket.emit('clear all');
			}else if(msgBox.split(" ")[0]=="/music"){
				socket.emit('play music',msgBox.split(" ")[1].toLowerCase());

				if(playlist[msgBox.split(" ")[1].toLowerCase()]){
					var obj = {user:this.user,msg:'Playing ' + msgBox.split(" ")[1]};
					socket.emit('new msg',obj);
					}

				msgBox="";
				this.msg="";
			}else if(msgBox=="/stop"){
				socket.emit('stop music');
				msgBox="";
				this.msg="";
				document.getElementById("bottom").scrollIntoView();
			}
			else if(msgBox.split(" ")[0]=="/poke"){
				socket.emit('poke',{from:this.user,to:msgBox.split(" ")[1]});
				msgBox="";
				this.msg="";
			}
			else if(msgBox!=""){
				var obj = {user:this.user,msg:msgBox};
				socket.emit('new msg',obj);
				msgBox="";
				this.msg="";
				document.getElementById("bottom").scrollIntoView();
			}
		},
	},
	watch:{
		msg:function(){
			if(this.msg!=""){
				socket.emit('typing',this.user);
				window.clearTimeout(this.timeoutId);
				this.timeoutId = window.setTimeout(function(){
					socket.emit('stopped typing',this.user);
				},1000);
			}
			if(this.msg==""){
				socket.emit('stopped typing',this.user);
			}
		}
	}
});
