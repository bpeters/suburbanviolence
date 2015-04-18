ig.module(
	'game.entities.player'
)
.requires(
	'impact.entity'
)
.defines(function(){

	var WIDTH = window.innerWidth;
	var HEIGHT = window.innerHeight;

	// Client Player
	EntityPlayer = ig.Entity.extend({

		size: {x: 40, y: 88},
		offset: {x: 17, y: 10},

		maxVel: {x: 400, y: 800},
		friction: {x: 800, y: 0},

		type: ig.Entity.TYPE.A, // Player friendly group
		checkAgainst: ig.Entity.TYPE.NONE,
		collides: ig.Entity.COLLIDES.PASSIVE,

		animSheet: new ig.AnimationSheet( 'media/player.png', 75, 100 ),

		sfxJump: new ig.Sound( 'media/sounds/jump.*' ),

		health: 3,
		flip: false,
		standing: true,
		accelGround: 1200,
		accelAir: 600,
		jump: 500,
		maxHealth: 3,
		coins: 0,

		init: function( x, y, settings ) {
			this.parent( x, y, settings );

			this.addAnim( 'idle', 1, [15,15,15,15,15,14] );
			this.addAnim( 'run', 0.07, [4,5,11,0,1,2,7,8,9,3] );
			this.addAnim( 'jump', 1, [13] );
			this.addAnim( 'fall', 0.4, [13,12], true ); // stop at the last frame

			ig.game.player = this;
		},

		update: function() {

			if (this.pos.y > HEIGHT / 2) {
				this.pos.y = HEIGHT / 2;
				this.standing = true;
				this.vel.y = 0;
			}

			// Handle user input; move left or right
			var accel = this.standing ? this.accelGround : this.accelAir;
			if( ig.input.state('left') ) {
				this.accel.x = -accel;
				this.flip = true;
			}
			else if( ig.input.state('right') ) {
				this.accel.x = accel;
				this.flip = false;
			}
			else {
				this.accel.x = 0;
			}

			// jump
			if (this.standing) {
				if(ig.input.pressed('jump')) {
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

			// Move!
			this.parent();
		}

	});

});
