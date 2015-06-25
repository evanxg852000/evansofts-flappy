/*
	http://jlongster.com/Making-Sprite-based-Games-with-Canvas

*/

/* better animation */
var requestAnimFrame = (function(){
    return window.requestAnimationFrame    ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();

/* game engine */
if(typeof(window.Engine)=="undefined")
    window.Engine={};
else
    if(typeof(window.Engine)!="object"){ throw new Exception("GameEngine is already defined in the global namespace");};

Engine.AssetsManager={
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

		/* load fonts */
		
		/* load sounds */
		var snd;
		for (var key in resources.sounds){
			snd = new Audio(resources.sounds[key]);
			snd.volume = .5;
			snd.load();
			/*may check*/
			this._sounds[key]=snd;
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

Engine.InputManager={
  		onClick:null
};

Engine.Game=function(game){
	this._game=game;
	this._canvas=null;
	/* double buffering support */
	this._frontBuffer=null;
	this._backBuffer=null;

	this.init=function(){
		var self=this;

		/*create canvas */
		var canvas = document.createElement("canvas");
		canvas.width = self._game.width;
		canvas.height = self._game.height;
		self._game.container.appendChild(canvas);
		self._canvas=canvas;

		canvas.addEventListener('click',function(e){
			e.clickPoint=self._getMousePos(self._canvas,e);

			if(typeof(Engine.InputManager.onClick)=="function")
				Engine.InputManager.onClick(e);
		});
			
		/* assign front buffer */
		self._frontBuffer=canvas.getContext("2d");

		
		/* assign back buffer */
		self._backBuffer=canvas.cloneNode(true).getContext("2d");

		/* load assets */
		Engine.AssetsManager.load(self._game.assets,function(status){
			if(!status){
				alert("Unable to load game assets!");
				throw "Unable to load game assets!";
			}
		});

		/* init current game */
		self._game.engine=self;
		self._game.input=Engine.InputManager;
		self._game.assets=Engine.AssetsManager;
		self._game.init(self);


		/* start game loop */
		var lastTime=0;
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

	};

	this.update=function(dt){
		var self=this;
		self._game.update(dt);
	};

	this.draw=function(gfx){
		var self=this;
		/* clear screen */
		gfx.fillStyle = self._game.clear;
		gfx.fillRect(0, 0, self._game.width, self._game.height);
		self._game.draw(gfx);	
	};

	this._getMousePos=function(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        };
    };

};


Engine.Sprite=function (frames,speed, loop,callback){
	this.frames = frames;
    this.speed = typeof speed === 'number' ? speed : 0;
    this.loop = loop;
    this._index = 1; 
    this.frame=frames[this._index]; 

    this.update=function(dt){
        this._index += this.speed*dt;
        if(this.speed > 0) {
            var max = this.frames.length;
            var idx = Math.floor(this._index);
            this.frame = this.frames[idx % max];

            if(!this.loop && idx >= max){
            	if(typeof(callback)=="function")
    				callback();
            }
        }else{
            this.frame = this.frames[0];;
        }
    }

};

Engine.Util={};

Engine.Util.Random=function(min, max,uniform){
	if(typeof(uniform)=="boolean" && nonuniform==true)
		return Math.random() * (max - min) + min;
	return Math.floor(Math.random() * (max - min)) + min;
}

Engine.Util.IntersectRect= function (r1, r2) {
  return !(r2.x > r1.x+r1.w || 
           r2.x+r2.w < r1.x || 
           r2.y > r1.y+r1.h ||
           r2.y+r2.h < r1.y);
}

Engine.Util.RectContains= function (r, p) {
	return !(r.x>p.x     ||
			 r.x+r.w<p.x ||
			 r.y>p.y     ||
			 r.y+r.h<p.y);
}