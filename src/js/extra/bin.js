
$(function(){

	var AssetsManager={
		_images:{},
		_fonts:{},
		_sounds:{},
		load:function(resources,callback){
			var status=true;
			/* load images */
			var img;
			for (var key in resources.images){
				img = new Image();
				img.onload = function(){
				    
				};
				img.src = resources.images[key];
				this._images[key]=img;
			}
			

			if(typeof(callback)=="function")
				callback(status);
		},

		image:function(key){
			return this._images[key];
		},

		font:function(key){
			return this.fonts[key];
		},

		sound:function(key){
			return this._sounds[key];
		}
  	};

  	var InputManager={
  		onClick:null
  	};
  
  	var Game={
  		/*list of assets files */
		_assets:{
			images:{
				/*world*/
				"bg":"src/medias/flappy_background.png",
				"gound":"src/medias/ground.png",
				
				/*entities*/
				"bird1":"src/medias/flappybird1.png",
				"bird2":"src/medias/flappybird2.png",
				"bird3":"src/medias/flappybird3.png",
				"bottom_pipe":"src/medias/bottom_pipe.png",
				"top_pipe":"src/medias/top_pipe.png",
				
				/*hud*/
				"game_over":"src/medias/game_over.png"
			},
			fonts:{},
			sounds:{},
		},

		/* double buffering support */
		_frontBuffer:null,
		_backBuffer:null,
		
		/* configuration */
		cfg:{
			SCREEN_WIDTH: 640,
			SCREEN_HEIGHT:480,
			FPS:30,
		},		

		init:function(container){
			var self=this;

			/*create canvas */
			var canvas = document.createElement("canvas");
			canvas.width = self.cfg.SCREEN_WIDTH;
			canvas.height = self.cfg.SCREEN_HEIGHT;
			container.appendChild(canvas);
			canvas.addEventListener('click',function(e){
				if(typeof(InputManager.onClick)=="function")
					InputManager.onClick(e);
			});
			
			/* assign front buffer */
			this._frontBuffer=canvas.getContext("2d");

			
			/* assign back buffer */
			this._backBuffer=canvas.cloneNode(true).getContext("2d");

			/* load assets */
			AssetsManager.load(this._assets,function(status){
				if(!status){
					alert("Unable to load game assets!");
					throw "Unable to load game assets!";
				}
			});

			/* start game loop */
			var lastTime;
			var step=function(){
				var now = Date.now();
			    var dt = (now - lastTime) / 1000.0;

			  	self.update(dt);
			  	self.draw(self._backBuffer);
			  	self._frontBuffer.drawImage(self._backBuffer.canvas, 0, 0);

			  	lastTime = now;
			  	requestAnimFrame(step);
			};
			step();
			
			
			/* old way not accurate !
				setInterval(function() {
					var now = Date.now();
				    var dt = (now - lastTime) / 1000.0;

				  	self.update(dt);
				  	self.draw(self._backBuffer);
				  	self._frontBuffer.drawImage(self._backBuffer.canvas, 0, 0);

				  	lastTime = now;
				}, 1000/self.cfg.FPS);
			*/

		},

		update:function(delta){

		},

		draw:function(gfx){
			/* clear screen */
			gfx.fillStyle = "#269DD7";
    		gfx.fillRect(0, 0, this.cfg.SCREEN_WIDTH, this.cfg.SCREEN_WIDTH);
			
			//your game logic here

			//bg
			var bgPattern = gfx.createPattern(AssetsManager.image("bg"), 'repeat');
			gfx.fillStyle=bgPattern;
			gfx.fillRect(0, 0, this.cfg.SCREEN_WIDTH, this.cfg.SCREEN_WIDTH);
			//gfx.drawImage(AssetsManager.image("bg"),0,0,139,480);
		}

	};

	var container=document.getElementById("container");
	Game.init(container);
});