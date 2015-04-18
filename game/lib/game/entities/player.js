ig.module(
	'game.entities.player'
)
.requires(
	'impact.entity'
)
.defines(function(){

	var WIDTH = window.innerWidth;
	var HEIGHT = window.innerHeight;

	EntityPlayer = ig.Entity.extend({

		size: {x: 40, y: 88},
		offset: {x: 17, y: 10},

		maxVel: {x: 800, y: 800},
		friction: {x: 800, y: 0},

		collides: ig.Entity.COLLIDES.PASSIVE,

		animSheet: new ig.AnimationSheet( 'media/player.png', 75, 100 ),

		sfxJump: new ig.Sound( 'media/sounds/jump.*' ),
		sfxBanana: new ig.Sound( 'media/sounds/banana.*' ),

		flip: false,
		running: false,
		standing: true,
		attacked: false,
		accelGround: 1200,
		accelAir: 600,
		jump: 500,
		health: 1,

		init: function( x, y, settings ) {
			this.parent( x, y, settings );

			if (this.player === 1) {
				this.addAnim( 'idle', 1, [15,15,15,15,15,14] );
				this.addAnim( 'run', 0.07, [4,5,11,0,1,2,7,8,9,3] );
				this.addAnim( 'jump', 1, [13] );
				this.addAnim( 'fall', 0.4, [13,12], true ); // stop at the last frame
			} else {
				this.addAnim( 'idle', 1, [15,15,15,15,14] );
				this.addAnim( 'run', 0.07, [4,5,11,0,1,2,7,8,9,3] );
				this.addAnim( 'jump', 1, [13] );
				this.addAnim( 'fall', 0.4, [13,12], true ); // stop at the last frame
			}

			ig.game.player = this;
		},

		update: function() {

			if (this.pos.y > HEIGHT / 2 - this.size.y) {
				this.pos.y = HEIGHT / 2 - this.size.y;
				this.standing = true;
				this.vel.y = 0;
			}

			var accel = this.standing ? this.accelGround : this.accelAir;
			if( this.flip && this.running ) {
				this.accel.x = -accel;
			}
			else if( !this.flip && this.running) {
				this.accel.x = accel;
			}
			else {
				this.accel.x = 0;
			}

			if (this.standing && this.running) {
				if((ig.input.pressed('jump') && this.player === 1) || (ig.input.pressed('jump-2') && this.player === 2)) {
					this.vel.y = -this.jump;
					this.sfxJump.play();
				}
			}

			if( this.vel.y < 0 ) {
				this.currentAnim = this.anims.jump;
				this.standing = false;
			}
			else if( this.vel.y > 0 ) {
				if( this.currentAnim != this.anims.fall ) {
					this.currentAnim = this.anims.fall.rewind();
				}
				this.standing = false;
			}
			else if( this.vel.x != 0 ) {
				this.currentAnim = this.anims.run;
				this.standing = true;
			}
			else {
				this.currentAnim = this.anims.idle;
				this.standing = true;
			}

			this.currentAnim.flip.x = this.flip;

			if (this.pos.x > WIDTH - this.size.x) {
				this.pos.x = WIDTH - this.size.x;
				this.flip = true;
				this.running = false;
				this.attacked = false;
			} else if (this.pos.x < 0) {
				this.pos.x = 0;
				this.flip = false;
				this.running = false;
				this.attacked = false;
			}

			if (this.running && !this.attacked) {
				if((ig.input.pressed('attack') && this.player === 1) || (ig.input.pressed('attack-2') && this.player === 2)) {
					var spawnX, spawnY = this.pos.y + this.size.y / 2;
					if (this.flip) {
						spawnX = this.pos.x - 32;
					} else {
						spawnX = this.pos.x + this.size.x + 32;
					}
					ig.game.spawnEntity( EntityBanana, spawnX, spawnY, {
						flip: this.flip,
						type: this.type,
						checkAgainst: this.checkAgainst,
					});
					this.sfxBanana.play();
					this.attacked = true;
				}
			}

			// Move!
			this.parent();
		}

	});

	EntityBanana = ig.Entity.extend({

		size: {x: 26, y: 26},
		offset: {x: 6, y: 6},

		maxVel: {x: 400, y: 800},
		friction: {x: 800, y: 0},

		collides: ig.Entity.COLLIDES.PASSIVE,

		animSheet: new ig.AnimationSheet( 'media/banana.png', 32, 32 ),

		dropped: true,
		finished: false,
		accelGround: 1200,
		accelAir: 600,
		jump: 500,
		health: 1,

		init: function( x, y, settings ) {
			this.parent( x, y, settings );

			this.addAnim( 'idle', 1, [0] );

			ig.game.banana = this;
		},

		update: function() {

			if (this.pos.y > HEIGHT / 2 - 13) {
				this.pos.y = HEIGHT / 2 - 13;
				this.finished = true;
				this.dropped = false;
				this.vel.y = 0;
			}

			var accel = this.accelGround;
			if( this.flip && this.dropped ) {
				this.accel.x = -accel;
			}
			else if( !this.flip && this.dropped) {
				this.accel.x = accel;
			}
			else {
				this.accel.x = 0;
			}

			this.currentAnim = this.anims.idle;

			this.currentAnim.flip.x = this.flip;

			// Move!
			this.parent();
		},

		check: function( other ) {
			other.kill();
			this.kill();
		},

	});

});
