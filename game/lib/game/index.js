ig.module(
	'game.main'
)
.requires(
	'impact.game',
	'impact.font',
	'game.levels.GameLevel',
	'game.entities.player'
)
.defines(function(){

	var WIDTH = window.innerWidth;
	var HEIGHT = window.innerHeight;

	GAME = ig.Game.extend({

		gravity: 800,

		white: new ig.Font( 'media/white.font.png' ),
		redbold: new ig.Font( 'media/red_bold.font.png' ),

		init: function() {

			//Load Level
			this.loadLevel( LevelGameLevel );
			this.spawnEntity(EntityPlayer, WIDTH / 2, HEIGHT / 2);
		},

		update: function() {

			this.parent();
		},

		draw: function() {
			this.parent();

			this.redbold.draw('Game Started', WIDTH / 2, 20, ig.Font.ALIGN.CENTER );
		}
	});

	TITLE = ig.Game.extend({

		gravity: 800,

		redbold: new ig.Font( 'media/red_bold.font.png' ),

		init: function() {

			ig.input.bind( ig.KEY.A, 'left' );
			ig.input.bind( ig.KEY.D, 'right' );
			ig.input.bind( ig.KEY.SPACE, 'jump' );

			this.loadLevel( LevelGameLevel );
		},

		update: function() {

			if( ig.input.pressed('jump')) {
				ig.system.setGame( GAME );
				return;
			}

			this.parent();
		},

		draw: function() {
			this.parent();

			this.redbold.draw('Suburban Violence', WIDTH / 2, 20, ig.Font.ALIGN.CENTER );

		}
	});

	// If our screen is smaller than 640px in width (that's CSS pixels), we scale the 
	// internal resolution of the canvas by 2. This gives us a larger viewport and
	// also essentially enables retina resolution on the iPhone and other devices 
	// with small screens.
	var scale = (WIDTH < 640) ? 2 : 1;

	// We want to run the game in "fullscreen", so let's use the window's size
	// directly as the canvas' style size.
	var canvas = document.getElementById('canvas');
	canvas.style.width = WIDTH + 'px';
	canvas.style.height = HEIGHT + 'px';

	// Listen to the window's 'resize' event and set the canvas' size each time
	// it changes.
	window.addEventListener('resize', function(){
		// If the game hasn't started yet, there's nothing to do here
		if( !ig.system ) { return; }

		// Resize the canvas style and tell Impact to resize the canvas itself;
		canvas.style.width = window.innerWidth + 'px';
		canvas.style.height = window.innerHeight + 'px';
		ig.system.resize( window.innerWidth * scale, window.innerHeight * scale );

		// Also repositon the touch buttons, if we have any
		if( window.myTouchButtons ) {
			window.myTouchButtons.align(); 
		}
	}, false);

	var width = WIDTH * scale, height = HEIGHT * scale;
	ig.main( '#canvas', TITLE, 60, width, height, 1, ig.ImpactSplashLoader );

});
