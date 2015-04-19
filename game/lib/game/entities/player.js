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

		collides: ig.Entity.COLLIDES.ACTIVE,

		animSheet: null,

		sfxJump: new ig.Sound( 'media/sounds/jump.*' ),
		sfxBanana: new ig.Sound( 'media/sounds/banana.*' ),
		sfxEquip: new ig.Sound( 'media/sounds/equip.*' ),

		white: new ig.Font( 'media/white.font.png' ),
		redbold: new ig.Font( 'media/red_bold.font.png' ),
		bluebold: new ig.Font( 'media/blue_bold.font.png' ),

		flip: false,
		running: false,
		standing: true,
		banana: false,
		cart: false,
		attacked: false,
		accelGround: 1200,
		accelAir: 100,
		accelCart: 3000,
		jump: 450,
		health: 1,
		deaths: 0,

		init: function( x, y, settings ) {
			this.parent( x, y, settings );

			this.animSheet = new ig.AnimationSheet( settings.sprite, 64, 64 ),

			this.addAnim( 'idle', 0.5, [0,0,5,5,6,6,7,7,8,8,9,9] );
			this.addAnim( 'run', 0.1, [10,11,12,13,14] );
			this.addAnim( 'banana', 0.1, [15,16,17,18,19] );
			this.addAnim( 'cart', 0.1, [30,31,32,33,34] );
			this.addAnim( 'tossBanana', 1, [20] );
			this.addAnim( 'jump', 1, [1,2,3] );
			this.addAnim( 'jumpBanana', 1, [21,22,23] );
			this.addAnim( 'fall', 0.1, [4,3,2], true );
			this.addAnim( 'fallBanana', 0.1, [24,23,22], true );
			this.addAnim( 'koBanana', 1, [25,26,27], true );

			ig.game.player = this;
		},

		update: function() {

			if( this.flip && this.running ) {
				if (this.cart) {
					this.accel.x  = -this.accelCart;
				} else {
					this.accel.x = -this.accelGround;
				}
			}
			else if( !this.flip && this.running) {
				if (this.cart) {
					this.accel.x = this.accelCart;
				} else {
					this.accel.x = this.accelGround;
				}
				
			}
			else {
				this.accel.x = 0;
			}

			if (this.standing && this.running && !this.cart) {
				if((ig.input.pressed('jump') && this.player === 1) || (ig.input.pressed('jump-2') && this.player === 2)) {
					this.vel.y = -this.jump;
					this.sfxJump.play();
				}
			}

			if ( this.vel.y < 0 ) {
				if (this.banana) {
					this.currentAnim = this.anims.jumpBanana;
				} else {
					this.currentAnim = this.anims.jump;
				}
				this.standing = false;
				if( this.flip && this.running) {
					this.accel.x = -this.accelAir;
				} else if( !this.flip && this.running) {
					this.accel.x = this.accelAir;
				} else {
					this.accel.x = 0;
				}
			} else if( this.vel.y > 0 ) {
				if ( this.currentAnim != this.anims.fall ) {
					if (this.banana) {
						this.currentAnim = this.anims.fallBanana.rewind();
					} else {
						this.currentAnim = this.anims.fall.rewind();
					}
					
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
				} else if (this.cart) {
					this.currentAnim = this.anims.cart;
				} else {
					this.currentAnim = this.anims.run;
				}
				this.standing = true;
			} else if (this.currentAnim === this.anims.koBanana && this.currentAnim.loopCount < 1) {

			} else {
				this.currentAnim = this.anims.idle;
				this.standing = true;
			}

			this.currentAnim.flip.x = this.flip;

			if (this.pos.x >= WIDTH - this.size.x) {
				this.vel.x = -10;
			} else if (this.pos.x <= 0) {
				this.vel.x = 10;
			} else if (this.pos.x > WIDTH / 2 + 400 ) {
				this.flip = true; 
			} else if (this.pos.x < WIDTH / 2 - 400) {
				this.flip = false;
			}

			if (this.cart && this.pos.y < 0) {
				this.pos.y = 100;
			}

			if (this.running && !this.banana && !this.attacked) {
				if((ig.input.pressed('banana') && this.player === 1) || (ig.input.pressed('banana-2') && this.player === 2)) {
					this.banana = true;
					this.currentAnim == this.anims.banana;
					this.sfxEquip.play();
				}
			}

			if (this.running) {
				if((ig.input.pressed('cart') && this.player === 1) || (ig.input.pressed('cart-2') && this.player === 2)) {
					this.cart = !this.cart;
					if (this.cart) {
						this.attacked = false;
						this.maxVel.x = 1000;
						this.currentAnim = this.anims.cart;
						this.sfxEquip.play();
						var spawnX, spawnY = this.pos.y;
						if (this.flip) {
							spawnX = this.pos.x - this.size.x;
						} else {
							spawnX = this.pos.x + this.size.x;
						}
						ig.game.spawnEntity( EntityCart, spawnY, spawnX, {
							flip: this.flip,
							type: this.type,
							checkAgainst: this.checkAgainst,
							player: this
						});
					} else {
						this.maxVel.x = 500;
						var carts = ig.game.getEntitiesByType( EntityCart );
						for (var i = 0; i < carts.length; i++) {
							if (carts[i].player.player === this.player) {
								carts[i].kill();
							}
						}
					}

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

		maxVel: {x: 200, y: 200},
		friction: {x: 700, y: 0},

		collides: ig.Entity.COLLIDES.PASSIVE,

		animSheet: new ig.AnimationSheet( 'media/banana.png', 32, 32 ),

		dropped: true,
		accelGround: 400,
		health: 1,

		init: function( x, y, settings ) {
			this.parent( x, y, settings );

			this.addAnim( 'idle', 1, [1] );
			this.addAnim( 'dropped', 1, [0,1], true );

			ig.game.banana = this;
		},

		update: function() {

			if (this.pos.y > HEIGHT - 130) {
				this.dropped = false;
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
			other.running = false;
			other.vel.x = 0;
			other.currentAnim = other.anims.koBanana.rewind();
			this.kill();
			other.deaths ++;
		},

	});

	EntityCart = ig.Entity.extend({

		size: {x: 32, y: 32},
		offset: {x: 32, y: 16},

		maxVel: {x: 200, y: 200},
		friction: {x: 700, y: 0},
		player : null,

		collides: ig.Entity.COLLIDES.ACTIVE,

		animSheet: new ig.AnimationSheet( 'media/cart.png', 64, 48 ),

		pushed: false,
		accelGround: 400,
		health: 1,

		init: function( x, y, settings ) {
			this.parent( x, y, settings );

			this.player = settings.player;

			this.addAnim( 'idle', 0.1, [0, 1, 2] );

			ig.game.cart = this;
		},

		update: function() {

			var accel = this.accelGround;
			if( this.flip && this.pushed) {
				this.accel.x = -accel;
			}
			else if( !this.flip && this.pushed) {
				this.accel.x = accel;
			}
			else {
				this.flip = this.player.flip;
				this.pos.y = this.player.pos.y + this.size.y;
				if (!this.flip) {
					this.pos.x = this.player.pos.x + this.player.size.x + this.size.x + this.player.offset.x;
				} else {
					this.pos.x = this.player.pos.x - this.player.size.x - this.player.offset.x ;
				}
			}

			this.currentAnim = this.anims.idle;

			this.currentAnim.flip.x = this.flip;

			// Move!
			this.parent();
		},

		check: function( other ) {
			
		},

	});

	EntityGround = ig.Entity.extend({

		size: {x: WIDTH, y: 100},
		gravityFactor: 0,
		friction: {x: 700, y: 0},

		collides: ig.Entity.COLLIDES.ACTIVE,

		init: function( x, y, settings ) {
			this.parent( x, y, settings );

			ig.game.ground = this;
		},

		update: function() {

			this.pos.y = HEIGHT - 100;
			this.pos.x = 0;

			// Move!
			this.parent();
		},

	});

	EntityShelf = ig.Entity.extend({

		size: {x: 160, y: 160},
		gravityFactor: 0,
		offset: {x: 16, y: 16},
		friction: {x: 700, y: 0},

		collides: ig.Entity.COLLIDES.NEVER,

		animSheet: new ig.AnimationSheet( 'media/shelf.png', 176, 176 ),

		init: function( x, y, settings ) {
			this.parent( x, y, settings );

			this.addAnim( 'idle', 1, [0] );

			ig.game.shelf = this;
		},

		update: function() {

			this.currentAnim == this.anims.idle;

			// Move!
			this.parent();
		},

	});

});
