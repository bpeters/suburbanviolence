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

		size: {x: 28, y: 60},
		offset: {x: 4, y: 4},

		maxVel: {x: 500, y: 500},
		friction: {x: 700, y: 0},

		collides: ig.Entity.COLLIDES.PASSIVE,

		animSheet: new ig.AnimationSheet( 'media/player.png', 64, 64 ),

		sfxJump: new ig.Sound( 'media/sounds/jump.*' ),
		sfxBanana: new ig.Sound( 'media/sounds/banana.*' ),

		flip: false,
		running: false,
		standing: true,
		banana: false,
		attacked: false,
		accelGround: 1200,
		accelAir: 100,
		jump: 450,
		health: 1,

		init: function( x, y, settings ) {
			this.parent( x, y, settings );

			this.addAnim( 'idle', 0.8, [0,0,5,5,6,6,7,7,8,8,9,9] );
			this.addAnim( 'run', 0.1, [10,11,12,13,14] );
			this.addAnim( 'banana', 0.1, [15,16,17,18,19] );
			this.addAnim( 'tossBanana', 1, [20] );
			this.addAnim( 'jump', 1, [1,2,3] );
			this.addAnim( 'fall', 0.1, [4,3,2], true );

			ig.game.player = this;
		},

		update: function() {

			if (this.pos.y > HEIGHT / 2 - this.size.y) {
				this.pos.y = HEIGHT / 2 - this.size.y;
				this.standing = true;
				this.vel.y = 0;
			}

			if( this.flip && this.running ) {
				this.accel.x = -this.accelGround;
			}
			else if( !this.flip && this.running) {
				this.accel.x = this.accelGround;
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

			if ( this.vel.y < 0 ) {
				this.currentAnim = this.anims.jump;
				this.standing = false;
				if( this.flip && this.running ) {
					this.accel.x = -this.accelAir;
				} else if( !this.flip && this.running) {
					this.accel.x = this.accelAir;
				} else {
					this.accel.x = 0;
				}
			} else if( this.vel.y > 0 ) {
				if ( this.currentAnim != this.anims.fall ) {
					this.currentAnim = this.anims.fall.rewind();
				}
				this.standing = false;
				if ( this.flip && this.running ) {
					this.accel.x = -this.accelAir;
				} else if( !this.flip && this.running) {
					this.accel.x = this.accelAir;
				} else {
					this.accel.x = 0;
				}
			} else if( this.vel.x != 0 ) {
				if (this.banana) {
					this.currentAnim = this.anims.banana;
				} else {
					this.currentAnim = this.anims.run;
				}
				this.standing = true;
			} else {
				this.currentAnim = this.anims.idle;
				this.standing = true;
			}

			this.currentAnim.flip.x = this.flip;

			if (this.pos.x > WIDTH / 2 + 400 ) {
				this.flip = true; 
			} else if (this.pos.x < WIDTH / 2 - 400) {
				this.flip = false;
			}

			if (this.running && !this.banana) {
				if((ig.input.pressed('banana') && this.player === 1) || (ig.input.pressed('banana-2') && this.player === 2)) {
					this.banana = true;
					this.currentAnim == this.anims.banana;
				}
			}

			if (this.running && !this.attacked) {
				if((ig.input.pressed('attack') && this.player === 1) || (ig.input.pressed('attack-2') && this.player === 2)) {
					if (this.banana) {
						this.currentAnim == this.anims.tossBanana
						this.banana = false;
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
					}
					this.attacked = true;
				}
			}

			// Move!
			this.parent();
		}

	});

	EntityBanana = ig.Entity.extend({

		size: {x: 20, y: 20},
		offset: {x: 12, y: 12},

		maxVel: {x: 500, y: 500},
		friction: {x: 700, y: 0},

		collides: ig.Entity.COLLIDES.PASSIVE,

		animSheet: new ig.AnimationSheet( 'media/banana.png', 32, 32 ),

		dropped: true,
		finished: false,
		accelGround: 600,
		health: 1,

		init: function( x, y, settings ) {
			this.parent( x, y, settings );

			this.addAnim( 'idle', 1, [1] );
			this.addAnim( 'dropped', 1, [0,1], true );

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
				this.currentAnim = this.anims.dropped;
			}
			else if( !this.flip && this.dropped) {
				this.accel.x = accel;
				this.currentAnim = this.anims.dropped;
			}
			else {
				this.currentAnim = this.anims.idle;
				this.accel.x = 0;
			}

			this.currentAnim.flip.x = this.flip;

			// Move!
			this.parent();
		},

		check: function( other ) {
			console.log(other);
			//this.kill();
		},

	});

});
