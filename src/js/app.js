var GameState={
	MENU:0,
	PLAY:1,
	OVER:2
};

var PlayerState={
	STATIC:0,
    FALL:1,
    RAISE:2,
    PIPE:3,
    GROUND:4
};

var GLOBAL={
	GROUND_Y:400,
	PLAYER_Y:200,
};

var Player=function(sprite){
    this.state=PlayerState.STATIC;
	this.sprite=sprite;
	this.x=0;
	this.y=0;
	this.w=34;
	this.h=24;
	this.vs=4;

	this.draw=function(gfx){
		var self=this;
		gfx.drawImage(self.sprite.frame,self.x,self.y,self.w,self.h);
	};

	this.update=function(dt){
		var self=this;

		if(self.state==PlayerState.STATIC){
			self.y +=0;
		}else if(self.state==PlayerState.FALL){
			self.y +=self.vs;
			//check max fall speed
			if(self.vs<=4.5){
				self.vs+=0.1;
			}
			//check hit the ground
			if(self.y >= GLOBAL.GROUND_Y-24){
				self.hitground();
			}
		}else if(self.state==PlayerState.RAISE){
			self.y +=self.vs;
			self.vs+=0.3;
			//check if raised has reached the top
			if(self.vs>=0){
				self.fall();
			}

		}else if(self.state==PlayerState.PIPE){
			self.y +=0;
		}else if(self.state==PlayerState.GROUND){
			self.y +=0;
		}
		
		self.sprite.update(dt);
	};

	this.fall=function(){
		var self=this;
		self.state=PlayerState.FALL;
		self.vs=2;
	};

	this.raise=function(){
		var self=this;
		self.state=PlayerState.RAISE;
		self.vs=-5;
		//play raise sound
		GLOBAL.ASSETS.sound("jump").play();
	};

	this.hitpipe=function(){
		var self=this;
		self.state=PlayerState.PIPE;
		self.vs=0;
		//play crach sound
		GLOBAL.ASSETS.sound("explosion").play();
	};

	this.hitground=function(){
		var self=this;
		self.state=PlayerState.GROUND;
		self.vs=0;
		//play crach sound
		GLOBAL.ASSETS.sound("explosion").play();
	};


	this.isOnPipe=function(){
		return (this.state==PlayerState.PIPE);
	};

	this.isOnGround=function(){
		return (this.state==PlayerState.GROUND);
	};

	this.getRect=function(){
		var self=this;
		//+1 is an added padding
		var rect={
			x:self.x+1,
			y:self.y+1,
			w:self.w-1,
			h:self.h-1
		};
		return rect;
	};

};

var Pipe=function(image,type){
	this.type=type;
	this.sprite=image;
	this.x=GLOBAL.WIDTH+62;
	this.y=0;
	this.w=50;
	this.h=Engine.Util.Random(180,206);
	this.hs=4; 

	this.draw=function(gfx){
		var self=this;

		if(self.type==1){
			gfx.drawImage(self.sprite,self.x,0,self.w,self.h);
		}else{
			gfx.drawImage(self.sprite,self.x,GLOBAL.HEIGHT-self.h,self.w,self.h);
		}
	};

	this.update=function(dt){
		var self=this;
		
		var self=this;
		self.x -=self.hs;
	};

	this.offScreen=function(){
		var self=this;
		//true when it is off screen
		return (self.x<=-62); 
	};

	this.getRect=function(){
		var self=this;
		//+1 is an added padding
		var rect;
		if(self.type==1){
			rect={
				x:self.x+1,
				y:self.y+1,
				w:self.w-1,
				h:self.h-1
			};
		}else{
			rect={
				x:self.x+1,
				y:GLOBAL.HEIGHT-self.h+1,
				w:self.w-1,
				h:self.h-1
			};
		}
		return rect;
	};

};

var FlappyBirdGame={
	container:document.getElementById("container"),
	width:640,
	height:480,
	fps:60,
	clear:"#269DD7",
	assets:{
		images:{
			/*world*/
			"bg":"src/medias/flappy_background.png",
			"ground":"src/medias/ground.png",
			
			/*entities*/
			"bird1":"src/medias/flappybird1.png",
			"bird2":"src/medias/flappybird2.png",
			"bird3":"src/medias/flappybird3.png",
			"bottom_pipe":"src/medias/bottom_pipe.png",
			"top_pipe":"src/medias/top_pipe.png",
			
			/*hud*/
			"new":"src/medias/new.png",
			"game_over":"src/medias/game_over.png",
			"restart":"src/medias/restart.png",
		},
		fonts:{},
		sounds:{
			"music":"src/medias/music.m4a",
			"jump":"src/medias/jump.m4a",
			"explosion":"src/medias/explosion.m4a"
		}
	},

	state:GameState.MENU,

	go_sp:null,
	new_btn:null,
	restart_btn:null,
	score:0,

	player:null,
	pipes:null,

	init:function(engine){
		var self=this;

		//export constatants to global
		GLOBAL.WIDTH=self.width;
		GLOBAL.HEIGHT=self.height;
		GLOBAL.ASSETS=self.assets;

		self.input.onClick=function(e){
			var is_action=(Engine.Util.RectContains(self.new_btn.rect,e.clickPoint) || Engine.Util.RectContains(self.restart_btn.rect,e.clickPoint));
			self.click(e,is_action);
		};

		//game over sprite
		self.go_sp=self.assets.image("game_over");

		/* buttons */
		self.new_btn={
			img:GLOBAL.ASSETS.image("new"),
			rect:{
				x:(self.width/2)-38,
				y:(self.height/2),
				w:76,
				h:40
			}
		};

		self.restart_btn={
			img:GLOBAL.ASSETS.image("restart"),
			rect:{
				x:(self.width/2)-58,
				y:(self.height/2)+40,//40px as margin
				w:116,
				h:44
			}
		};

		var frames=[
			self.assets.image("bird1"),
			self.assets.image("bird2"),
			self.assets.image("bird3"),
		]
		self.player=new Player(new Engine.Sprite(frames,10, true));

		self.player.x=250;
		self.player.y=GLOBAL.PLAYER_Y;

		self.pipes=new Array();

		var bgAudio=self.assets.sound("music");
		bgAudio.volume=.02;
		bgAudio.addEventListener('ended', function() {
		    this.currentTime = 0;
		    this.play();
		}, false);
		bgAudio.play();
	},
	
	update:function(dt){
		var self=this;

		//player
		self.player.update(dt);


		if(self.state==GameState.MENU){
			//nothing todo keep for later improvements
		}

		if(self.state==GameState.PLAY){
			self.collisionCheck();

			//pipes
			self.spawn(dt);

			//rmv offscreen pipes
			var i=self.pipes.length;
			while(i--){
				if(self.pipes[i].offScreen())
					self.pipes.splice(i, 1);
			}

			//update pipes
			var length=self.pipes.length;
			for (var i =0; i < length; i++)
				self.pipes[i].update(dt);
		
			if(self.player.isOnGround() || self.player.isOnPipe()){
				self.state=GameState.OVER
			}
			
		}

		if(self.state==GameState.OVER){
			//nothing todo keep for later improvements
		}
		
	},

	draw:function(gfx){
		var self=this;

		//backgroun
		var bgPattern = gfx.createPattern(self.assets.image("bg"), 'repeat');
		gfx.fillStyle=bgPattern;
		gfx.fillRect(0, 0, this.width, this.height);

		//ground
		var groundPattern = gfx.createPattern(self.assets.image("ground"), 'repeat');
		gfx.fillStyle=groundPattern;
		gfx.fillRect(0,GLOBAL.GROUND_Y, this.width, 80);

		//player
		self.player.draw(gfx);

		if(self.state==GameState.MENU){
			gfx.drawImage(self.new_btn.img,self.new_btn.rect.x,self.new_btn.rect.y,self.new_btn.rect.w,self.new_btn.rect.h);
		}

		if(self.state==GameState.PLAY){
			//pipes
			var length=self.pipes.length;
			for (var i =0; i < length; i++)
				self.pipes[i].draw(gfx);
		}
		
		if(self.state==GameState.OVER){
			//game over
			gfx.drawImage(self.go_sp,(this.width/2)-94,(this.height/2)-19,188,38);
			gfx.drawImage(self.restart_btn.img,self.restart_btn.rect.x,self.restart_btn.rect.y,self.restart_btn.rect.w,self.restart_btn.rect.h);
		}

		/*draw score*/
		gfx.fillStyle="#000";
		gfx.font = '14px Pixel';
      	gfx.fillText('SCORE: '+self.score, 15, 25);

	},

	click:function(e,is_action){
		var self=this;

		if(self.state==GameState.MENU){
			if(is_action){
				self.score=0;
				self.state=GameState.PLAY;
			}
		}

		if(self.state==GameState.PLAY){
			if(self.player.state==PlayerState.STATIC){
				self.player.fall();
			}else{
				self.player.raise();
			}
		}

		if(self.state==GameState.OVER){
			if(!is_action)
				return;

			self.score=0;
			self.pipes.length=0; //clear pipes
			self.player.y=GLOBAL.PLAYER_Y;
			self.player.state=PlayerState.FALL;
			self.state=GameState.PLAY;
		}
		
	},

	elapsed_time:0,
	spawn:function(dt){
		var self=this;
		self.elapsed_time+=dt;
		if(self.elapsed_time<Engine.Util.Random(1,3))
			return;
		
		self.elapsed_time=0;

		self.score++;

		var pipe=null;
		var both=(Engine.Util.Random(1,4)==3);
		if(both){
			pipe=new Pipe(self.assets.image("top_pipe"),1);
			self.pipes.push(pipe);
			pipe=new Pipe(self.assets.image("bottom_pipe"),2);
			self.pipes.push(pipe);
		}else{
			var type=Engine.Util.Random(1,3);
			if(type==1){
				pipe=new Pipe(self.assets.image("top_pipe"),type);
			}else{
				pipe=new Pipe(self.assets.image("bottom_pipe"),type);
			}
			self.pipes.push(pipe);
		}
	},

	collisionCheck:function(){
		var length=this.pipes.length;
		var r1,r2;
		for (var i =0; i < length; i++){
			r1=this.pipes[i].getRect();
			r2=this.player.getRect();
			if(Engine.Util.IntersectRect(r1,r2)){
				this.player.hitpipe();
			}
		}
	}

};

var game=new Engine.Game(FlappyBirdGame);
game.init();
