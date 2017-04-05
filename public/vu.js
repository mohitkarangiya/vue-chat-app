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
	playlist[musicName].play();
});

socket.on('stop music',function(musicName){
	playlist[musicName].stop();
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

socket.on('stopped typing',function(userName){
	app.typers.splice(app.typers.IndexOf(userName),1);
})
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
		getUsername:function(event){
			if(event.target.value!=""){
				this.user = event.target.value;
				this.newUser = false;
				socket.emit('new user',this.user);
			}
		},
		sendMsg:function(event){
			if(event.target.value=="/clear"){
				event.target.value="";
				this.msg=""
				socket.emit('clear all');
			}else if(event.target.value.split(" ")[0]=="/music"){
				socket.emit('play music',event.target.value.split(" ")[1].toLowerCase());
				event.target.value="";
				this.msg=""
			}else if(event.target.value=="/stop"){
				socket.emit('stop music');
				event.target.value="";
				this.msg=""
			}
			else if(event.target.value.split(" ")[0]=="/poke"){
				socket.emit('poke',{from:this.user,to:event.target.value.split(" ")[1]});
				event.target.value="";
				this.msg=""
			}
			else if(event.target.value!=""){
				var obj = {user:this.user,msg:event.target.value};
				socket.emit('new msg',obj);
				event.target.value="";
				this.msg=""
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
