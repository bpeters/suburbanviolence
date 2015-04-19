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
		playerScore: 0,
		player2Score: 0,

		white: new ig.Font( 'media/white.font.png' ),
		redbold: new ig.Font( 'media/red_bold.font.png' ),
		bluebold: new ig.Font( 'media/blue_bold.font.png' ),

		init: function() {

			ig.input.bind( ig.KEY.W, 'jump' );
			ig.input.bind( ig.KEY.E, 'attack' );
			ig.input.bind( ig.KEY._1, 'banana' );
			ig.input.bind( ig.KEY._2, 'cart' );

			ig.input.bind( ig.KEY.I, 'jump-2' );
			ig.input.bind( ig.KEY.O, 'attack-2' );
			ig.input.bind( ig.KEY._0, 'banana-2' );
			ig.input.bind( ig.KEY._9, 'cart-2' );

			ig.input.bind( ig.KEY.SPACE, 'start' );

			this.loadLevel( LevelGameLevel );
			this.spawnEntity(EntityGround, 0, HEIGHT - 100);
			this.spawnEntity(EntityShelf, WIDTH / 2, HEIGHT - 276);
			this.spawnEntity(EntityShelf, WIDTH / 2 - 400, HEIGHT - 276);
			this.spawnEntity(EntityShelf, WIDTH / 2 - 200, HEIGHT - 276);
			this.spawnEntity(EntityShelf, WIDTH / 2 + 200, HEIGHT - 276);
			this.spawnEntity(EntityShelf, WIDTH / 2 + 400, HEIGHT - 276);
			this.spawnEntity(EntityPlayer, WIDTH / 2 - 400, HEIGHT - 200, {
				player: 1,
				type: ig.Entity.TYPE.A,
				checkAgainst: ig.Entity.TYPE.B
			});
			this.spawnEntity(EntityPlayer, WIDTH / 2 + 400, HEIGHT - 200, {
				player: 2,
				type: ig.Entity.TYPE.B,
				checkAgainst: ig.Entity.TYPE.A,
				flip: true
			});
		},

		restartPlayers: function(player, player2) {
			player.running = false;
			player2.running = false;
			player.attacked = false;
			player2.attacked = false;
			this.player2Score = player.deaths;
			this.playerScore = player2.deaths;
		},

		update: function() {

			var player = this.getEntitiesByType( EntityPlayer )[0];
			var player2 = this.getEntitiesByType( EntityPlayer )[1];

			if (!player || !player2) {
				ig.system.setGame( GAME );
				return;
			}

			if (this.player2Score < player.deaths || this.playerScore < player2.deaths) {
				this.restartPlayers(player, player2);
			}
			var count;
			if(ig.input.pressed('start') && (!player.running || !player2.running)) {
				player.running = true;
				player2.running = true;
			}
			this.parent();
		},

		draw: function() {
			this.parent();

			var player = this.getEntitiesByType( EntityPlayer )[0];
			var player2 = this.getEntitiesByType( EntityPlayer )[1];

			if(!player.running || !player2.running) {
				this.redbold.draw('Suburban Violence', WIDTH / 2, 20, ig.Font.ALIGN.CENTER );
				this.bluebold.draw('Press SPACE to start dual', WIDTH / 2, 50, ig.Font.ALIGN.CENTER );
				this.redbold.draw(this.playerScore + ' - ' + this.player2Score, WIDTH / 2, 90, ig.Font.ALIGN.CENTER );
			} else {
				this.redbold.draw('Suburban Violence', WIDTH / 2, 20, ig.Font.ALIGN.CENTER );
				this.bluebold.draw('Press W or I to Jump', WIDTH / 2, 50, ig.Font.ALIGN.CENTER );
				this.bluebold.draw('Press 1 or 0 to Equip Weapon', WIDTH / 2, 80, ig.Font.ALIGN.CENTER );
				this.bluebold.draw('Press E or O to Use Weapon', WIDTH / 2, 110, ig.Font.ALIGN.CENTER );
				this.redbold.draw(player2.deaths + ' - ' + player.deaths, WIDTH / 2, 150, ig.Font.ALIGN.CENTER );
			}
			
		}
	});

	TITLE = ig.Game.extend({

		gravity: 800,

		redbold: new ig.Font( 'media/red_bold.font.png' ),

		init: function() {


		},

		update: function() {

			if( ig.input.pressed('start')) {
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
	ig.main( '#canvas', GAME, 60, width, height, 1, ig.ImpactSplashLoader );

});
