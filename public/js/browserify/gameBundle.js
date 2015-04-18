(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
ig.module(
	'game.entities.player'
)
.requires(
	'impact.entity'
)
.defines(function(){

	var ismove = 0;

	// Client Player
	EntityPlayer = ig.Entity.extend({

		collides: ig.Entity.COLLIDES.PASSIVE,
		type: ig.Entity.TYPE.A,
		checkAgainst: ig.Entity.TYPE.NONE,

		nettimer: 0,
		name: "player",
		gamename: playername,
		currentanimation: 0,

		messagebox: "",
		messageboxtimer: 100,

		init_health: 32,
		init_shield: 16,
		init_shield_recharge: 300,

		health: 32,
		shield: 16,
		shield_recharge: 300,
		speed: 100,
		kills: 0,
		kill_streaks: 0,
		points: 0,
		creds: 1000,
		direction: 1,
		walk: 2,

		s1_dmg: 4,
		s1_desiredVel: 300,
		s1_range: 200,
		s1_init_recharge: 50,
		s1_recharge: 50,
		s1_type: 0,


		init: function( x, y, settings ) {
			this.size.x = this.health + (this.shield + this.health/2);
			this.size.y = this.health + (this.shield + this.health/2);
			this.x = x;
			this.y = y;

			console.log(this.gamename);
			socket.emit('initializeplayer', this.gamename);

			this.parent( x, y, settings );
		},

		kill: function() {
			socket.emit('killplayer');
		},

		setSize: function() {
			this.size.x = this.health + (this.shield + this.health/2);
			this.size.y = this.health + (this.shield + this.health/2);
		},

		update: function() {

			//make sure player actually dies
			if (this.health <= 0) {
				this.kill();
			}

			//Spending Creds
			if ( this.creds > 0 ) {
				if( ig.input.pressed('health') ) {
					this.health = this.health + 2;
					this.init_health = this.health;
					this.creds = this.creds - 2;

					//update range
					this.s1_range = this.s1_range + 2;

					//update size
					this.setSize();

				} else if( ig.input.pressed('shield') ) {
					this.init_shield = this.init_shield + 1;
					this.shield = this.shield + 1;
					this.creds = this.creds - 2;

					//update size
					this.setSize();

				} else if( ig.input.pressed('shield_recharge') ) {
					if ( this.init_shield_recharge > 100 ) {
						this.init_shield_recharge = this.init_shield_recharge - 4;
						this.creds = this.creds - 2;
					}
				} else if( ig.input.pressed('speed') ) {
					this.speed = this.speed + 1;
					this.creds = this.creds - 2;
				} else if( ig.input.pressed('dmg') ) {
					this.s1_dmg = this.s1_dmg + 1;
					this.s1_desiredVel = this.s1_desiredVel - 2;
					this.s1_init_recharge = this.s1_init_recharge + 1;
					this.creds = this.creds - 2;
				} else if( ig.input.pressed('vel') ) {
					this.s1_desiredVel = this.s1_desiredVel + 2;
					this.s1_init_recharge = this.s1_init_recharge + 1;
					this.creds = this.creds - 2;
				} else if( ig.input.pressed('range') ) {
					this.s1_range = this.s1_range + 10;
					this.s1_init_recharge = this.s1_init_recharge + 1;
					this.creds = this.creds - 2;
				} else if( ig.input.pressed('recharge') ) {
					this.s1_init_recharge = this.s1_init_recharge - 1;
					this.s1_recharge = this.s1_init_recharge;
					this.creds = this.creds - 2;
				}
			}

			// Shooting
			if( this.s1_recharge === this.s1_init_recharge ) {
				if( ig.input.state('shoot1') ) {
					var mx = (ig.input.mouse.x + ig.game.screen.x);
					var my = (ig.input.mouse.y + ig.game.screen.y);
					var r = Math.atan2(my-this.pos.y, mx-this.pos.x);
					ig.game.spawnEntity( EntityBullet, this.pos.x, this.pos.y, {angle: r, dmg: this.s1_dmg, desiredVel: this.s1_desiredVel, range: this.s1_range});
					socket.emit('recievedata','shoot',{
						positionx: this.pos.x,
						positiony: this.pos.y,
						angle: r,
						dmg: this.s1_dmg,
						desiredVel: this.s1_desiredVel,
						range: this.s1_range,
						gamename: this.gamename
					});
					this.s1_recharge = 0;
				}
				
			}
			if ( this.s1_recharge < this.s1_init_recharge ) {
				this.s1_recharge = this.s1_recharge + 1;
			}

			// Recharge Shield
			if( this.shield_recharge < 1 ) {
				for(var i = 0; this.shield < this.init_shield; i++) {
					this.shield = this.shield + 1;

					//update size
					this.setSize();
				}
				this.shield_recharge = this.init_shield_recharge;
			}
			if ( this.shield < this.init_shield) {
				this.shield_recharge = this.shield_recharge - 1;
			}

			// Movement
			if (ig.input.state('left') && ismove != 3) {
				if (ig.input.state('up')) {
					currentanimation = 8;

				} else if (ig.input.state('down')) {
					currentanimation = 6;

				} else {
					currentanimation = 7;
					ismove = 7;

				}

			} else if (ig.input.state('right') && ismove != 7) {
				if (ig.input.state('up')) {
					currentanimation = 2;

				} else if (ig.input.state('down')) {
					currentanimation = 4;

				} else {
					this.currentAnim = this.anims.right;
					currentanimation = 3;
					ismove = 3;
				}
			} else if (ig.input.state('down') && ismove != 1) {
				if (ig.input.state('left')) {
					currentanimation = 6;

				} else if (ig.input.state('right')) {
					currentanimation = 4;

				} else {
					currentanimation = 5;
					ismove = 5;
				}

			} else if (ig.input.state('up') && ismove != 5) {
				if (ig.input.state('left')) {
					currentanimation = 8;

				} else if (ig.input.state('right')) {
					currentanimation = 2;

				} else {
					currentanimation = 1;
					ismove = 1;
				}

			} else {
				this.vel.x = 0;
				this.vel.y = 0;
				ismove = 0;
				currentanimation = 0;

				if (this.direction == 1) {
					currentanimation = 9;
				}
				if (this.direction == 2) {
					currentanimation = 10;
				}
				if (this.direction == 3) {
					currentanimation = 11;
				}
				if (this.direction == 4) {
					currentanimation = 12;
				}
				if (this.direction == 5) {
					currentanimation = 13;
				}
				if (this.direction == 6) {
					currentanimation = 14;
				}
				if (this.direction == 7) {
					currentanimation = 15;
				}
				if (this.direction == 8) {
					currentanimation = 16;
				}
			}

			switch (currentanimation) {
			case 1:
				this.vel.x = 0;
				this.vel.y = -this.speed;
				this.direction = 1;
				socket.emit('recievedata','move',{
					positionx: this.pos.x,
					positiony: this.pos.y,
					currentanimation: currentanimation,
					health: this.health,
					shield: this.shield,
					speed: this.speed,
					gamename: this.gamename,
					init_health: this.init_health
				});
				break;

			case 2:
				this.vel.x = +this.speed;
				this.vel.y = -this.speed;
				this.direction = 2;
				socket.emit('recievedata','move',{
					positionx: this.pos.x,
					positiony: this.pos.y,
					currentanimation: currentanimation,
					health: this.health,
					shield: this.shield,
					speed: this.speed,
					gamename: this.gamename,
					init_health: this.init_health
				});
				break;

			case 3:
				this.vel.x = +this.speed;
				this.vel.y = 0;
				this.direction = 3;
				socket.emit('recievedata','move',{
					positionx: this.pos.x,
					positiony: this.pos.y,
					currentanimation: currentanimation,
					health: this.health,
					shield: this.shield,
					speed: this.speed,
					gamename: this.gamename,
					init_health: this.init_health
				});
				break;

			case 4:
				this.vel.x = +this.speed;
				this.vel.y = +this.speed;
				this.direction = 4;
				socket.emit('recievedata','move',{
					positionx: this.pos.x,
					positiony: this.pos.y,
					currentanimation: currentanimation,
					health: this.health,
					shield: this.shield,
					speed: this.speed,
					gamename: this.gamename,
					init_health: this.init_health
				});
				break;

			case 5:
				this.vel.x = 0;
				this.vel.y = +this.speed;
				this.direction = 5;
				socket.emit('recievedata','move',{
					positionx: this.pos.x,
					positiony: this.pos.y,
					currentanimation: currentanimation,
					health: this.health,
					shield: this.shield,
					speed: this.speed,
					gamename: this.gamename,
					init_health: this.init_health
				});
				break;

			case 6:
				this.vel.x = -this.speed;
				this.vel.y = +this.speed;
				this.direction = 6;
				socket.emit('recievedata','move',{
					positionx: this.pos.x,
					positiony: this.pos.y,
					currentanimation: currentanimation,
					health: this.health,
					shield: this.shield,
					speed: this.speed,
					gamename: this.gamename,
					init_health: this.init_health
				});
				break;

			case 7:
				this.vel.x = -this.speed;
				this.vel.y = 0;
				this.direction = 7;
				socket.emit('recievedata','move',{
					positionx: this.pos.x,
					positiony: this.pos.y,
					currentanimation: currentanimation,
					health: this.health,
					shield: this.shield,
					speed: this.speed,
					gamename: this.gamename,
					init_health: this.init_health
				});
				break;

			case 8:
				this.vel.x = -this.speed;
				this.vel.y = -this.speed;
				this.direction = 8;
				socket.emit('recievedata','move',{
					positionx: this.pos.x,
					positiony: this.pos.y,
					currentanimation: currentanimation,
					health: this.health,
					shield: this.shield,
					speed: this.speed,
					gamename: this.gamename,
					init_health: this.init_health
				});
				break;
			}

			//Sync Player Details
			if(this.nettimer < 1) {
				this.nettimer = 100;
				socket.emit('recievedata','sync',{
					positionx: this.pos.x,
					positiony: this.pos.y,
					currentanimation: currentanimation,
					health: this.health,
					shield: this.shield,
					speed: this.speed,
					gamename: this.gamename,
					init_health: this.init_health
				});
			}
			this.nettimer = this.nettimer - 1;

			this.parent();

			//screen movement (Camera)
			ig.game.screen.x = this.pos.x - ig.system.width/2;
			ig.game.screen.y = this.pos.y - ig.system.height/2;
		},

		draw: function() {
			this.parent();

			//draw player
			switch (currentanimation) {
				case 9:
				case 10:
				case 11:
				case 11:
				case 12:
				case 13:
				case 14:
				case 15:
				case 16:
				case 0:
					ig.system.context.fillStyle = "rgb(0,0,0)";
					ig.system.context.beginPath();
					ig.system.context.arc(this.pos.x - ig.game.screen.x, this.pos.y - ig.game.screen.y, this.health/2, 0, 2 * Math.PI, false);
					ig.system.context.closePath();
					ig.system.context.fill();
					break;

				case 1:
					ig.system.context.fillStyle = "rgb(0,0,0)";
					ig.system.context.beginPath();
					ig.system.context.arc(this.pos.x - ig.game.screen.x, this.pos.y - ig.game.screen.y - this.walk, this.health/2, 0, 2 * Math.PI, false);
					ig.system.context.closePath();
					ig.system.context.fill();
					break;

				case 2:
					ig.system.context.fillStyle = "rgb(0,0,0)";
					ig.system.context.beginPath();
					ig.system.context.arc(this.pos.x - ig.game.screen.x + this.walk, this.pos.y - ig.game.screen.y - this.walk, this.health/2, 0, 2 * Math.PI, false);
					ig.system.context.closePath();
					ig.system.context.fill();
					break;

				case 3:
					ig.system.context.fillStyle = "rgb(0,0,0)";
					ig.system.context.beginPath();
					ig.system.context.arc(this.pos.x - ig.game.screen.x + this.walk, this.pos.y - ig.game.screen.y, this.health/2, 0, 2 * Math.PI, false);
					ig.system.context.closePath();
					ig.system.context.fill();
					break;

				case 4:
					ig.system.context.fillStyle = "rgb(0,0,0)";
					ig.system.context.beginPath();
					ig.system.context.arc(this.pos.x - ig.game.screen.x + this.walk, this.pos.y - ig.game.screen.y + this.walk, this.health/2, 0, 2 * Math.PI, false);
					ig.system.context.closePath();
					ig.system.context.fill();
					break;

				case 5:
					ig.system.context.fillStyle = "rgb(0,0,0)";
					ig.system.context.beginPath();
					ig.system.context.arc(this.pos.x - ig.game.screen.x, this.pos.y - ig.game.screen.y + this.walk, this.health/2, 0, 2 * Math.PI, false);
					ig.system.context.closePath();
					ig.system.context.fill();
					break;

				case 6:
					ig.system.context.fillStyle = "rgb(0,0,0)";
					ig.system.context.beginPath();
					ig.system.context.arc(this.pos.x - ig.game.screen.x - this.walk, this.pos.y - ig.game.screen.y + this.walk, this.health/2, 0, 2 * Math.PI, false);
					ig.system.context.closePath();
					ig.system.context.fill();
					break;

				case 7:
					ig.system.context.fillStyle = "rgb(0,0,0)";
					ig.system.context.beginPath();
					ig.system.context.arc(this.pos.x - ig.game.screen.x -this.walk, this.pos.y - ig.game.screen.y, this.health/2, 0, 2 * Math.PI, false);
					ig.system.context.closePath();
					ig.system.context.fill();
					break;

				case 8:
					ig.system.context.fillStyle = "rgb(0,0,0)";
					ig.system.context.beginPath();
					ig.system.context.arc(this.pos.x - ig.game.screen.x - this.walk, this.pos.y - ig.game.screen.y - this.walk, this.health/2, 0, 2 * Math.PI, false);
					ig.system.context.closePath();
					ig.system.context.fill();
					break;
				}

			//draw shield
			if (this.health > 0 || this.shield > 0) {
				ig.system.context.globalAlpha = 0.8;
				ig.system.context.strokeStyle = "rgb(0,0,0)";
				ig.system.context.lineWidth = 1;
				var gradient = ig.system.context.createRadialGradient(this.pos.x - ig.game.screen.x, this.pos.y - ig.game.screen.y, (this.shield + this.health/2), this.pos.x - ig.game.screen.x, this.pos.y - ig.game.screen.y, 0);
				gradient.addColorStop(0, "rgba(0, 0, 0, 0.3)");
				gradient.addColorStop(0.5, "rgba(0, 0, 0, 0)");
				ig.system.context.fillStyle = gradient;
				ig.system.context.beginPath();
				ig.system.context.arc(this.pos.x - ig.game.screen.x, this.pos.y - ig.game.screen.y, (this.shield + this.health/2), 0, 2 * Math.PI, false);
				ig.system.context.closePath();
				ig.system.context.fill();
				ig.system.context.stroke();
				ig.system.context.globalAlpha = 1;
			}
		}

	});

	// Other Player
	EntityOtherplayer = ig.Entity.extend({

		collides: ig.Entity.COLLIDES.PASSIVE,
		type: ig.Entity.TYPE.B,

		name: "otherplayer",
		animation: 0,

		init_health: 32,
		init_shield: 16,
		init_shield_recharge: 300,

		health: 32,
		shield: 16,
		shield_recharge: 300,
		speed: 100,
		kills: 0,
		kill_streaks: 0,
		points: 0,
		creds: 0,
		direction: 1,
		walk: 2,

		s1_dmg: 4,
		s1_desiredVel: 300,
		s1_range: 200,
		s1_recharge: 50,
		s1_type: 0,

		init: function( x, y, settings ) {
			this.size.x = this.health + (this.shield + this.health/2);
			this.size.y = this.health + (this.shield + this.health/2);
			this.parent( x, y, settings );
		},

		netmoveplayer: function() {
			this.pos.x = positionx;
			this.pos.y = positiony;
		},

		update: function() {
			this.parent();
		},

		draw: function() {
			this.parent();

			//draw player
			switch (this.animation) {
				case 9:
				case 10:
				case 11:
				case 11:
				case 12:
				case 13:
				case 14:
				case 15:
				case 16:
				case 0:
					ig.system.context.fillStyle = "rgb(0,0,0)";
					ig.system.context.beginPath();
					ig.system.context.arc(this.pos.x - ig.game.screen.x, this.pos.y - ig.game.screen.y, this.health/2, 0, 2 * Math.PI, false);
					ig.system.context.closePath();
					ig.system.context.fill();
					break;

				case 1:
					ig.system.context.fillStyle = "rgb(0,0,0)";
					ig.system.context.beginPath();
					ig.system.context.arc(this.pos.x - ig.game.screen.x, this.pos.y - ig.game.screen.y - this.walk, this.health/2, 0, 2 * Math.PI, false);
					ig.system.context.closePath();
					ig.system.context.fill();
					break;

				case 2:
					ig.system.context.fillStyle = "rgb(0,0,0)";
					ig.system.context.beginPath();
					ig.system.context.arc(this.pos.x - ig.game.screen.x + this.walk, this.pos.y - ig.game.screen.y - this.walk, this.health/2, 0, 2 * Math.PI, false);
					ig.system.context.closePath();
					ig.system.context.fill();
					break;

				case 3:
					ig.system.context.fillStyle = "rgb(0,0,0)";
					ig.system.context.beginPath();
					ig.system.context.arc(this.pos.x - ig.game.screen.x + this.walk, this.pos.y - ig.game.screen.y, this.health/2, 0, 2 * Math.PI, false);
					ig.system.context.closePath();
					ig.system.context.fill();
					break;

				case 4:
					ig.system.context.fillStyle = "rgb(0,0,0)";
					ig.system.context.beginPath();
					ig.system.context.arc(this.pos.x - ig.game.screen.x + this.walk, this.pos.y - ig.game.screen.y + this.walk, this.health/2, 0, 2 * Math.PI, false);
					ig.system.context.closePath();
					ig.system.context.fill();
					break;

				case 5:
					ig.system.context.fillStyle = "rgb(0,0,0)";
					ig.system.context.beginPath();
					ig.system.context.arc(this.pos.x - ig.game.screen.x, this.pos.y - ig.game.screen.y + this.walk, this.health/2, 0, 2 * Math.PI, false);
					ig.system.context.closePath();
					ig.system.context.fill();
					break;

				case 6:
					ig.system.context.fillStyle = "rgb(0,0,0)";
					ig.system.context.beginPath();
					ig.system.context.arc(this.pos.x - ig.game.screen.x - this.walk, this.pos.y - ig.game.screen.y + this.walk, this.health/2, 0, 2 * Math.PI, false);
					ig.system.context.closePath();
					ig.system.context.fill();
					break;

				case 7:
					ig.system.context.fillStyle = "rgb(0,0,0)";
					ig.system.context.beginPath();
					ig.system.context.arc(this.pos.x - ig.game.screen.x -this.walk, this.pos.y - ig.game.screen.y, this.health/2, 0, 2 * Math.PI, false);
					ig.system.context.closePath();
					ig.system.context.fill();
					break;

				case 8:
					ig.system.context.fillStyle = "rgb(0,0,0)";
					ig.system.context.beginPath();
					ig.system.context.arc(this.pos.x - ig.game.screen.x - this.walk, this.pos.y - ig.game.screen.y - this.walk, this.health/2, 0, 2 * Math.PI, false);
					ig.system.context.closePath();
					ig.system.context.fill();
					break;
				}

			//draw shield
			if (this.health > 0 || this.shield > 0) {
				ig.system.context.globalAlpha = 0.8;
				ig.system.context.strokeStyle = "rgb(0,0,0)";
				ig.system.context.lineWidth = 1;
				var gradient = ig.system.context.createRadialGradient(this.pos.x - ig.game.screen.x, this.pos.y - ig.game.screen.y, (this.shield + this.health/2), this.pos.x - ig.game.screen.x, this.pos.y - ig.game.screen.y, 0);
				gradient.addColorStop(0, "rgba(0, 0, 0, 0.3)");
				gradient.addColorStop(0.5, "rgba(0, 0, 0, 0)");
				ig.system.context.fillStyle = gradient;
				ig.system.context.beginPath();
				ig.system.context.arc(this.pos.x - ig.game.screen.x, this.pos.y - ig.game.screen.y, (this.shield + this.health/2), 0, 2 * Math.PI, false);
				ig.system.context.closePath();
				ig.system.context.fill();
				ig.system.context.stroke();
				ig.system.context.globalAlpha = 1;
			}

		}

	});

	//Player Bullet
	EntityBullet = ig.Entity.extend({

		collides: ig.Entity.COLLIDES.PASSIVE,
		type: ig.Entity.TYPE.NONE,
		checkAgainst: ig.Entity.TYPE.B,

		dmg: 0,
		desiredVel: 0,
		range: 0,

		init: function( x, y, settings ) {
			this.dmg = settings.dmg;
			this.desiredVel = settings.desiredVel;
			this.range = settings.range;

			this.size.x = this.dmg;
			this.size.y = this.dmg;

			var startx = x;
			var starty = y;

			var vely = Math.sin(settings.angle) * this.desiredVel;
			var velx =  Math.cos(settings.angle) * this.desiredVel;

			this.maxVel.x = this.vel.x = this.accel.x = velx;
			this.maxVel.y = this.vel.y = this.accel.y = vely;

			this.parent( x, y, settings );
		},

		update: function() {
			this.parent();
		},

		handleMovementTrace: function( res ) {
			this.parent( res );

			var player = ig.game.getEntitiesByType( EntityPlayer )[0];

			if( res.collision.x || res.collision.y ) {
				this.kill();
			} else if (this.distanceTo(player) > this.range) {
				this.kill();
			}
		},

		check: function( other ) {
			var player = ig.game.getEntitiesByType( EntityPlayer )[0];
			if (other.shield <= 0) {

				if (other.health - this.dmg <= 0) {

					//Enemy recieves damage = health to prevent crash
					other.receiveDamage( other.health, this );

					//Player recieves credits and points
					player.creds = player.creds + other.init_health * player.kill_streaks;
					player.points = player.points + other.init_health * player.kill_streaks;
					player.kills = player.kills + 1;

					// Set player kill streak
					player.kill_streaks = 0;
					for (i = 0; i <= player.kills - 3; i = i + 3) {
						player.kill_streaks = player.kill_streaks + 1;
					}

				} else {
					//Enemy recieves damage
					other.receiveDamage( this.dmg, this );

					//Player recieves points
					player.points = player.points + this.dmg * player.kill_streaks;
				}

			} else if (other.shield - this.dmg <= 0) {
				other.shield = 0;
			} else {
				other.shield = other.shield - this.dmg;
			}
			this.kill();
		},

		draw: function() {
			ig.system.context.fillStyle = "rgb(0,0,0)";
			ig.system.context.beginPath();
			ig.system.context.fillRect(this.pos.x - ig.game.screen.x, this.pos.y - ig.game.screen.y, this.size.x, this.size.y);
			ig.system.context.closePath();
			ig.system.context.fill();
			this.parent();
		}

	});

	// Other player bullet
	EntityNetbullet = ig.Entity.extend({

		collides: ig.Entity.COLLIDES.PASSIVE,
		type: ig.Entity.TYPE.NONE,
		checkAgainst: ig.Entity.TYPE.A,

		dmg: 0,
		desiredVel: 0,
		range: 0,

		enemy: {
			startx: 0,
			starty: 0,
			gamename: "",
		},

		init: function( x, y, settings ) {
			this.dmg = settings.dmg;
			this.desiredVel = settings.desiredVel;
			this.range = settings.range;

			this.size.x = this.dmg;
			this.size.y = this.dmg;

			this.enemy.startx = x;
			this.enemy.starty = y;
			this.enemy.gamename = settings.thisgamename;

			var vely = Math.sin(settings.angle) * this.desiredVel;
			var velx =  Math.cos(settings.angle) * this.desiredVel;

			this.maxVel.x = this.vel.x = this.accel.x = velx;
			this.maxVel.y = this.vel.y = this.accel.y = vely;

			this.parent( x, y, settings );
		},

		update: function() {
			this.parent();
		},

		handleMovementTrace: function( res ) {
			this.parent( res );

			var player = ig.game.getEntitiesByType( EntityPlayer )[0];
			if( res.collision.x || res.collision.y ) {
				this.kill();
			} else if (this.enemy.startx + this.range < this.pos.x || this.enemy.startx - this.range > this.pos.x) {
				this.kill();
			} else if (this.enemy.starty + this.range < this.pos.y || this.enemy.starty - this.range > this.pos.y) {
				this.kill();
			}
		},

		check: function( other ) {
			var otherplayer = ig.game.getEntitiesByType( EntityOtherplayer );
			if(otherplayer) {
				for(var i in otherplayer) {
					if(this.enemy.gamename == otherplayer[i].gamename) {
						var enemy = otherplayer[i];
					}
				}
			}
			if (other.shield <= 0) {
				if (other.health - this.dmg <= 0) {
					//A player recieves damage = health to prevent crash
					other.receiveDamage( other.health, this );
				} else {
					//A player recieves damage
					other.receiveDamage( this.dmg, this );
				}
			} else if (other.shield - this.dmg <= 0) {
				other.shield = 0;
			} else {
				other.shield = other.shield - this.dmg;
			}
			this.kill();
		},

		draw: function() {
			ig.system.context.fillStyle = "rgb(0,0,0)";
			ig.system.context.beginPath();
			ig.system.context.fillRect(this.pos.x - ig.game.screen.x, this.pos.y - ig.game.screen.y, this.size.x, this.size.y);
			ig.system.context.closePath();
			ig.system.context.fill();
			this.parent();
		}

	});

});

},{}],2:[function(require,module,exports){
ig.module( 'game.levels.GameLevel' )
.requires( 'impact.image' )
.defines(function(){
LevelGameLevel=/*JSON[*/{
  "entities":[],
  "layer":[
    {
      "name":"ground",
      "width":100,
      "height":100,
      "linkWithCollision":false,
      "visible":true,
      "tilesetName":"media/tiles/white.png",
      "repeat":true,
      "preRender":false,
      "distance":"1",
      "tilesize":32,
      "foreground":false,
      "data":[[1]]
    }
  ]
}/*]JSON*/;
LevelGameLevelResources=[new ig.Image('media/tiles/white.png')];
});

},{}],3:[function(require,module,exports){
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

MyGame = ig.Game.extend({

	white: new ig.Font( 'media/white.font.png' ),
	redbold: new ig.Font( 'media/red_bold.font.png' ),

	minimap : {
		size : 10, //128x128px on the screen
		c : 16, // Compression factor, for a square map of 16x128pixel .
		//Absolute positions on the screen
		x: 0,
		y: 0
	},

	init: function() {

		//Handle Client Input
		ig.input.bind( ig.KEY.W, 'up' );
		ig.input.bind( ig.KEY.S, 'down' );
		ig.input.bind( ig.KEY.A, 'left' );
		ig.input.bind( ig.KEY.D, 'right' );
		ig.input.bind( ig.KEY.MOUSE1, 'shoot1');
		ig.input.bind( ig.KEY.MOUSE2, 'shoot2');
		ig.input.bind( ig.KEY._1, 'health');
		ig.input.bind( ig.KEY._2, 'shield');
		ig.input.bind( ig.KEY._3, 'shield_recharge');
		ig.input.bind( ig.KEY._4, 'speed');
		ig.input.bind( ig.KEY._5, 'dmg');
		ig.input.bind( ig.KEY._6, 'vel');
		ig.input.bind( ig.KEY._7, 'range');
		ig.input.bind( ig.KEY._8, 'recharge');

		//Load Level
		this.loadLevel( LevelGameLevel );

		//Start Client In Random Location
		var startx = Math.floor(Math.random()*9999);
		var starty = Math.floor(Math.random()*9999);
		this.spawnEntity(EntityPlayer, startx, starty);
	},

	update: function() {

		this.parent();
	},

	draw: function() {
		this.parent();

		//Draw MiniMap
		var players = this.getEntitiesByType(EntityOtherplayer);
		var player = this.getEntitiesByType( EntityPlayer )[0];
		var ctx = ig.system.context;
		var s = ig.system.scale;
		var x,y,size;
		ctx.save();
		ctx.fillStyle = "rgba(150, 150, 150, 0.1)";
		ctx.fillRect(this.minimap.x,
								 this.minimap.y,
								 this.minimap.x+this.minimap.size,
								 this.minimap.y+this.minimap.size);

		// Draw Other Players on MiniMap
		for (i=0;i<players.length;i++) {
				x = players[i].pos.x * s / this.minimap.c + this.minimap.x;
				y = players[i].pos.y * s / this.minimap.c + this.minimap.y;
				size = players[i].size.x * s / this.minimap.c;
				ctx.fillStyle = "rgb(255,0,0)";
				ctx.fillRect(x,y,size,size);

				this.redbold.draw(players[i].gamename, x - 10, y - 20 );
		}

		// Draw Client Player on MiniMap
		x = player.pos.x * s / this.minimap.c + this.minimap.x;
		y = player.pos.y * s / this.minimap.c + this.minimap.y;
		size = player.size.x * s / this.minimap.c;
		ctx.fillStyle = "rgb(0,0,0)";
		ctx.fillRect(x,y,size,size);
		ctx.restore();
		this.white.draw(player.gamename, x - 10, y - 20  );

		//Draw Player Stats
		this.white.draw( "Lite Streaks:        " + player.kill_streaks, 20, 50 );
		this.white.draw( "Kills:               " + player.kills, 20, 75 );
		this.white.draw( "Points:              " + player.points, 20, 100 );
		if ( player.creds > 0 ){
	this.redbold.draw( "Credits:             " + player.creds, 20, 165 );
		}
		this.white.draw( "1 - Health:          " + player.health, 20, 190 );
		this.white.draw( "2 - Shield:          " + player.shield, 20, 215 );
		this.white.draw( "3 - Shield Recharge: " + player.shield_recharge, 20, 240 );
		this.white.draw( "4 - Speed:           " + player.speed, 20, 265 );
		this.white.draw( "5 - Damage:          " + player.s1_dmg, 20, 290 );
		this.white.draw( "6 - Velocity:        " + player.s1_desiredVel, 20, 315 );
		this.white.draw( "7 - Range            " + player.s1_range, 20, 340 );
		this.white.draw( "8 - Recharge         " + player.s1_recharge, 20, 365 );

		//Player Messages
		player.messageboxtimer = player.messageboxtimer - 1;
		if( player.messageboxtimer < 1 ) {
			player.messageboxtimer = 100;
			var newtext = "";
			var newsplit = player.messagebox.split("\n");
			for(var i = 0; i < newsplit.length; i++) {
				if( i > 1 ) {
					newtext = newtext + "\n" + newsplit[i];
				}
			}
		player.messagebox = newtext;
		}
		this.white.draw( player.messagebox, 20, -10 );

		//Display Intro Text
		var intro = true;
		if (intro) {
			this.redbold.draw("Welcome To Lite Streak", (window.innerWidth / 2) - 100, 20 );
		}

	}
});

ig.main( '#canvas', MyGame, 60, window.innerWidth, window.innerHeight, 1 );

});

},{}],4:[function(require,module,exports){
ig.module(
	'impact.animation'
)
.requires(
	'impact.timer',
	'impact.image' 
)
.defines(function(){ "use strict";

ig.AnimationSheet = ig.Class.extend({
	width: 8,
	height: 8,
	image: null,
	
	init: function( path, width, height ) {
		this.width = width;
		this.height = height;
		
		this.image = new ig.Image( path );
	}
});



ig.Animation = ig.Class.extend({
	sheet: null,
	timer: null,
	
	sequence: [],	
	flip: {x: false, y: false},
	pivot: {x: 0, y: 0},
	
	frame: 0,
	tile: 0,
	loopCount: 0,
	alpha: 1,
	angle: 0,
	
	
	init: function( sheet, frameTime, sequence, stop ) {
		this.sheet = sheet;
		this.pivot = {x: sheet.width/2, y: sheet.height/2 };
		this.timer = new ig.Timer();

		this.frameTime = frameTime;
		this.sequence = sequence;
		this.stop = !!stop;
		this.tile = this.sequence[0];
	},
	
	
	rewind: function() {
		this.timer.set();
		this.loopCount = 0;
		this.frame = 0;
		this.tile = this.sequence[0];
		return this;
	},
	
	
	gotoFrame: function( f ) {
		// Offset the timer by one tenth of a millisecond to make sure we
		// jump to the correct frame and circumvent rounding errors
		this.timer.set( this.frameTime * -f - 0.0001 );
		this.update();
	},
	
	
	gotoRandomFrame: function() {
		this.gotoFrame( Math.floor(Math.random() * this.sequence.length) )
	},
	
	
	update: function() {
		var frameTotal = Math.floor(this.timer.delta() / this.frameTime);
		this.loopCount = Math.floor(frameTotal / this.sequence.length);
		if( this.stop && this.loopCount > 0 ) {
			this.frame = this.sequence.length - 1;
		}
		else {
			this.frame = frameTotal % this.sequence.length;
		}
		this.tile = this.sequence[ this.frame ];
	},
	
	
	draw: function( targetX, targetY ) {
		var bbsize = Math.max(this.sheet.width, this.sheet.height);
		
		// On screen?
		if(
		   targetX > ig.system.width || targetY > ig.system.height ||
		   targetX + bbsize < 0 || targetY + bbsize < 0
		) {
			return;
		}
		
		if( this.alpha != 1) {
			ig.system.context.globalAlpha = this.alpha;
		}
		
		if( this.angle == 0 ) {		
			this.sheet.image.drawTile(
				targetX, targetY,
				this.tile, this.sheet.width, this.sheet.height,
				this.flip.x, this.flip.y
			);
		}
		else {
			ig.system.context.save();
			ig.system.context.translate(
				ig.system.getDrawPos(targetX + this.pivot.x),
				ig.system.getDrawPos(targetY + this.pivot.y)
			);
			ig.system.context.rotate( this.angle );
			this.sheet.image.drawTile(
				-this.pivot.x, -this.pivot.y,
				this.tile, this.sheet.width, this.sheet.height,
				this.flip.x, this.flip.y
			);
			ig.system.context.restore();
		}
		
		if( this.alpha != 1) {
			ig.system.context.globalAlpha = 1;
		}
	}
});

});
},{}],5:[function(require,module,exports){
ig.module(
	'impact.background-map'
)
.requires(
	'impact.map',
	'impact.image'
)
.defines(function(){ "use strict";

ig.BackgroundMap = ig.Map.extend({	
	tiles: null,
	scroll: {x: 0, y:0},
	distance: 1,
	repeat: false,
	tilesetName: '',
	foreground: false,
	enabled: true,
	
	preRender: false,
	preRenderedChunks: null,
	chunkSize: 512,
	debugChunks: false,
	
	
	anims: {},
	
	
	init: function( tilesize, data, tileset ) {
		this.parent( tilesize, data );
		this.setTileset( tileset );
	},
	
	
	setTileset: function( tileset ) {
		this.tilesetName  = tileset instanceof ig.Image ? tileset.path : tileset;
		this.tiles = new ig.Image( this.tilesetName );
		this.preRenderedChunks = null;
	},
	
	
	setScreenPos: function( x, y ) {
		this.scroll.x = x / this.distance;
		this.scroll.y = y / this.distance;
	},
	
	
	preRenderMapToChunks: function() {
		var totalWidth = this.width * this.tilesize * ig.system.scale,
			totalHeight = this.height * this.tilesize * ig.system.scale;
		
		// If this layer is smaller than the chunkSize, adjust the chunkSize
		// accordingly, so we don't have as much overdraw
		this.chunkSize = Math.min( Math.max(totalWidth, totalHeight), this.chunkSize );
			
		var chunkCols = Math.ceil(totalWidth / this.chunkSize),
			chunkRows = Math.ceil(totalHeight / this.chunkSize);
		
		this.preRenderedChunks = [];
		for( var y = 0; y < chunkRows; y++ ) {
			this.preRenderedChunks[y] = [];
			
			for( var x = 0; x < chunkCols; x++ ) {
				
				
				var chunkWidth = (x == chunkCols-1)
					? totalWidth - x * this.chunkSize
					: this.chunkSize;
					
				var chunkHeight = (y == chunkRows-1)
					? totalHeight - y * this.chunkSize
					: this.chunkSize;
					
				this.preRenderedChunks[y][x] = this.preRenderChunk( x, y, chunkWidth, chunkHeight );
			}
		}
	},
	
	
	preRenderChunk: function( cx, cy, w, h ) {
		var tw = w / this.tilesize / ig.system.scale + 1,
			th = h / this.tilesize / ig.system.scale + 1;
		
		var nx = (cx * this.chunkSize / ig.system.scale) % this.tilesize,
			ny = (cy * this.chunkSize / ig.system.scale) % this.tilesize;
		
		var tx = Math.floor(cx * this.chunkSize / this.tilesize / ig.system.scale),
			ty = Math.floor(cy * this.chunkSize / this.tilesize / ig.system.scale);
		
		
		var chunk = ig.$new('canvas');
		chunk.width = w;
		chunk.height = h;
		chunk.retinaResolutionEnabled = false; // Opt out for Ejecta
		
		var chunkContext = chunk.getContext('2d');
		ig.System.scaleMode(chunk, chunkContext);
		
		var screenContext = ig.system.context;
		ig.system.context = chunkContext;
		
		for( var x = 0; x < tw; x++ ) {
			for( var y = 0; y < th; y++ ) {
				if( x + tx < this.width && y + ty < this.height ) {
					var tile = this.data[y+ty][x+tx];
					if( tile ) {
						this.tiles.drawTile(
							x * this.tilesize - nx,	y * this.tilesize - ny,
							tile - 1, this.tilesize
						);
					}
				}
			}
		}
		ig.system.context = screenContext;
		
		return chunk;
	},
	
	
	draw: function() {
		if( !this.tiles.loaded || !this.enabled ) {
			return;
		}
		
		if( this.preRender ) {
			this.drawPreRendered();
		}
		else {
			this.drawTiled();
		}
	},
		
	
	drawPreRendered: function() {
		if( !this.preRenderedChunks ) {
			this.preRenderMapToChunks();
		}
		
		var dx = ig.system.getDrawPos(this.scroll.x),
			dy = ig.system.getDrawPos(this.scroll.y);
			
			
		if( this.repeat ) {
			var w = this.width * this.tilesize * ig.system.scale;
			dx = (dx%w + w) % w;

			var h = this.height * this.tilesize * ig.system.scale;
			dy = (dy%h + h) % h;
		}
		
		var minChunkX = Math.max( Math.floor(dx / this.chunkSize), 0 ),
			minChunkY = Math.max( Math.floor(dy / this.chunkSize), 0 ),
			maxChunkX = Math.ceil((dx+ig.system.realWidth) / this.chunkSize),
			maxChunkY = Math.ceil((dy+ig.system.realHeight) / this.chunkSize),
			maxRealChunkX = this.preRenderedChunks[0].length,
			maxRealChunkY = this.preRenderedChunks.length;
			
		
		if( !this.repeat ) {
			maxChunkX = Math.min( maxChunkX, maxRealChunkX );
			maxChunkY = Math.min( maxChunkY, maxRealChunkY );
		}
		
		
		var nudgeY = 0;
		for( var cy = minChunkY; cy < maxChunkY; cy++ ) {
			
			var nudgeX = 0;
			for( var cx = minChunkX; cx < maxChunkX; cx++ ) {
				var chunk = this.preRenderedChunks[cy % maxRealChunkY][cx % maxRealChunkX];
				
				var x = -dx + cx * this.chunkSize - nudgeX;
				var y = -dy + cy * this.chunkSize - nudgeY;
				ig.system.context.drawImage( chunk, x, y);
				ig.Image.drawCount++;
				
				if( this.debugChunks ) {
					ig.system.context.strokeStyle = '#f0f';
					ig.system.context.strokeRect( x, y, this.chunkSize, this.chunkSize );
				}
				
				// If we repeat in X and this chunk's width wasn't the full chunk size
				// and the screen is not already filled, we need to draw anohter chunk
				// AND nudge it to be flush with the last chunk
				if( this.repeat && chunk.width < this.chunkSize && x + chunk.width < ig.system.realWidth ) {
					nudgeX += this.chunkSize - chunk.width;
					maxChunkX++;
				}
			}
			
			// Same as above, but for Y
			if( this.repeat && chunk.height < this.chunkSize && y + chunk.height < ig.system.realHeight	) {
				nudgeY += this.chunkSize - chunk.height;
				maxChunkY++;
			}
		}
	},
	
	
	drawTiled: function() {	
		var tile = 0,
			anim = null,
			tileOffsetX = (this.scroll.x / this.tilesize).toInt(),
			tileOffsetY = (this.scroll.y / this.tilesize).toInt(),
			pxOffsetX = this.scroll.x % this.tilesize,
			pxOffsetY = this.scroll.y % this.tilesize,
			pxMinX = -pxOffsetX - this.tilesize,
			pxMinY = -pxOffsetY - this.tilesize,
			pxMaxX = ig.system.width + this.tilesize - pxOffsetX,
			pxMaxY = ig.system.height + this.tilesize - pxOffsetY;
			
		
		// FIXME: could be sped up for non-repeated maps: restrict the for loops
		// to the map size instead of to the screen size and skip the 'repeat'
		// checks inside the loop.
		
		for( var mapY = -1, pxY = pxMinY; pxY < pxMaxY; mapY++, pxY += this.tilesize) {
			var tileY = mapY + tileOffsetY;
				
			// Repeat Y?
			if( tileY >= this.height || tileY < 0 ) {
				if( !this.repeat ) { continue; }
				tileY = (tileY%this.height + this.height) % this.height;
			}
			
			for( var mapX = -1, pxX = pxMinX; pxX < pxMaxX; mapX++, pxX += this.tilesize ) {
				var tileX = mapX + tileOffsetX;
				
				// Repeat X?
				if( tileX >= this.width || tileX < 0 ) {
					if( !this.repeat ) { continue; }
					tileX = (tileX%this.width + this.width) % this.width;
				}
				
				// Draw!
				if( (tile = this.data[tileY][tileX]) ) {
					if( (anim = this.anims[tile-1]) ) { 
						anim.draw( pxX, pxY );
					}
					else {
						this.tiles.drawTile( pxX, pxY, tile-1, this.tilesize );
					}
				}
			} // end for x
		} // end for y
	}
});

});
},{}],6:[function(require,module,exports){
ig.module(
	'impact.collision-map'
)
.requires(
	'impact.map'
)
.defines(function(){ "use strict";

ig.CollisionMap = ig.Map.extend({
	
	lastSlope: 1,
	tiledef: null,
	
	init: function( tilesize, data, tiledef ) {
		this.parent( tilesize, data );
		this.tiledef = tiledef || ig.CollisionMap.defaultTileDef;
		
		for( var t in this.tiledef ) {
			if( t|0 > this.lastSlope ) {
				this.lastSlope = t|0;
			}
		}
	},
	
	
	trace: function( x, y, vx, vy, objectWidth, objectHeight ) {
		// Set up the trace-result
		var res = {
			collision: {x: false, y: false, slope: false},
			pos: {x: x, y: y},
			tile: {x: 0, y: 0}
		};
		
		// Break the trace down into smaller steps if necessary
		var steps = Math.ceil(Math.max(Math.abs(vx), Math.abs(vy)) / this.tilesize);
		if( steps > 1 ) {
			var sx = vx / steps;
			var sy = vy / steps;
			
			for( var i = 0; i < steps && (sx || sy); i++ ) {
				this._traceStep( res, x, y, sx, sy, objectWidth, objectHeight, vx, vy, i );
				
				x = res.pos.x;
				y = res.pos.y;
				if( res.collision.x ) {	sx = 0; vx = 0; }
				if( res.collision.y ) {	sy = 0;	vy = 0; }
				if( res.collision.slope ) { break; }
			}
		}
		
		// Just one step
		else {
			this._traceStep( res, x, y, vx, vy, objectWidth, objectHeight, vx, vy, 0 );
		}
		
		return res;
	},
	
	
	_traceStep: function( res, x, y, vx, vy, width, height, rvx, rvy, step ) {
		
		res.pos.x += vx;
		res.pos.y += vy;
		
		var t = 0;
		
		// Horizontal collision (walls)
		if( vx ) {
			var pxOffsetX = (vx > 0 ? width : 0);
			var tileOffsetX = (vx < 0 ? this.tilesize : 0);
			
			var firstTileY = Math.max( Math.floor(y / this.tilesize), 0 );
			var lastTileY = Math.min( Math.ceil((y + height) / this.tilesize), this.height );
			var tileX = Math.floor( (res.pos.x + pxOffsetX) / this.tilesize );
			
			// We need to test the new tile position as well as the current one, as we
			// could still collide with the current tile if it's a line def.
			// We can skip this test if this is not the first step or the new tile position
			// is the same as the current one.
			var prevTileX = Math.floor( (x + pxOffsetX) / this.tilesize );
			if( step > 0 || tileX == prevTileX || prevTileX < 0 || prevTileX >= this.width ) {
				prevTileX = -1;
			}
			
			// Still inside this collision map?
			if(	tileX >= 0 && tileX < this.width ) {
				for( var tileY = firstTileY; tileY < lastTileY; tileY++ ) {
					if( prevTileX != -1 ) {
						t = this.data[tileY][prevTileX];
						if(	
							t > 1 && t <= this.lastSlope && 
							this._checkTileDef(res, t, x, y, rvx, rvy, width, height, prevTileX, tileY) 
						) {
							break;
						}
					}
					
					t = this.data[tileY][tileX];
					if(
						t == 1 || t > this.lastSlope || // fully solid tile?
						(t > 1 && this._checkTileDef(res, t, x, y, rvx, rvy, width, height, tileX, tileY)) // slope?
					) {
						if( t > 1 && t <= this.lastSlope && res.collision.slope ) {
							break;
						}
						
						// full tile collision!
						res.collision.x = true;
						res.tile.x = t;
						x = res.pos.x = tileX * this.tilesize - pxOffsetX + tileOffsetX;
						rvx = 0;
						break;
					}
				}
			}
		}
		
		// Vertical collision (floor, ceiling)
		if( vy ) {
			var pxOffsetY = (vy > 0 ? height : 0);
			var tileOffsetY = (vy < 0 ? this.tilesize : 0);
			
			var firstTileX = Math.max( Math.floor(res.pos.x / this.tilesize), 0 );
			var lastTileX = Math.min( Math.ceil((res.pos.x + width) / this.tilesize), this.width );
			var tileY = Math.floor( (res.pos.y + pxOffsetY) / this.tilesize );
			
			var prevTileY = Math.floor( (y + pxOffsetY) / this.tilesize );
			if( step > 0 || tileY == prevTileY || prevTileY < 0 || prevTileY >= this.height ) {
				prevTileY = -1;
			}
			
			// Still inside this collision map?
			if( tileY >= 0 && tileY < this.height ) {
				for( var tileX = firstTileX; tileX < lastTileX; tileX++ ) {
					if( prevTileY != -1 ) {
						t = this.data[prevTileY][tileX];
						if( 
							t > 1 && t <= this.lastSlope &&
							this._checkTileDef(res, t, x, y, rvx, rvy, width, height, tileX, prevTileY) ) {
							break;
						}
					}
					
					t = this.data[tileY][tileX];
					if(
						t == 1 || t > this.lastSlope || // fully solid tile?
						(t > 1 && this._checkTileDef(res, t, x, y, rvx, rvy, width, height, tileX, tileY)) // slope?
					) {
						if( t > 1 && t <= this.lastSlope && res.collision.slope ) {
							break;
						}
						
						// full tile collision!
						res.collision.y = true;
						res.tile.y = t;
						res.pos.y = tileY * this.tilesize - pxOffsetY + tileOffsetY;
						break;
					}
				}
			}
		}
		
		// res is changed in place, nothing to return
	},
	
	
	_checkTileDef: function( res, t, x, y, vx, vy, width, height, tileX, tileY ) {
		var def = this.tiledef[t];
		if( !def ) { return false; }
		
		var lx = (tileX + def[0]) * this.tilesize,
			ly = (tileY + def[1]) * this.tilesize,
			lvx = (def[2] - def[0]) * this.tilesize,
			lvy = (def[3] - def[1]) * this.tilesize,
			solid = def[4];
		
		// Find the box corner to test, relative to the line
		var tx = x + vx + (lvy < 0 ? width : 0) - lx,
			ty = y + vy + (lvx > 0 ? height : 0) - ly;
		
		// Is the box corner behind the line?
		if( lvx * ty - lvy * tx > 0 ) {
			
			// Lines are only solid from one side - find the dot product of
			// line normal and movement vector and dismiss if wrong side
			if( vx * -lvy + vy * lvx < 0 ) {
				return solid;
			}
			
			// Find the line normal
			var length = Math.sqrt(lvx * lvx + lvy * lvy);
			var nx = lvy/length,
				ny = -lvx/length;
			
			// Project out of the line
			var proj = tx * nx + ty * ny;
			var px = nx * proj,
				py = ny * proj;
			
			// If we project further out than we moved in, then this is a full
			// tile collision for solid tiles.
			// For non-solid tiles, make sure we were in front of the line. 
			if( px*px+py*py >= vx*vx+vy*vy ) {
				return solid || (lvx * (ty-vy) - lvy * (tx-vx) < 0.5);
			}
			
			res.pos.x = x + vx - px;
			res.pos.y = y + vy - py;
			res.collision.slope = {x: lvx, y: lvy, nx: nx, ny: ny};
			return true;
		}
		
		return false;
	}
});


// Default Slope Tile definition. Each tile is defined by an array of 5 vars:
// - 4 for the line in tile coordinates (0 -- 1)
// - 1 specifing whether the tile is 'filled' behind the line or not
// [ x1, y1, x2, y2, solid ]

// Defining 'half', 'one third' and 'two thirds' as vars  makes it a bit
// easier to read... I hope.
var H = 1/2,
	N = 1/3,
	M = 2/3,
	SOLID = true,
	NON_SOLID = false;
	
ig.CollisionMap.defaultTileDef = {	
	/* 15 NE */	 5: [0,1, 1,M, SOLID],  6: [0,M, 1,N, SOLID],  7: [0,N, 1,0, SOLID],
	/* 22 NE */	 3: [0,1, 1,H, SOLID],  4: [0,H, 1,0, SOLID],
	/* 45 NE */  2: [0,1, 1,0, SOLID],
	/* 67 NE */ 10: [H,1, 1,0, SOLID], 21: [0,1, H,0, SOLID],
	/* 75 NE */ 32: [M,1, 1,0, SOLID], 43: [N,1, M,0, SOLID], 54: [0,1, N,0, SOLID],
	
	/* 15 SE */	27: [0,0, 1,N, SOLID], 28: [0,N, 1,M, SOLID], 29: [0,M, 1,1, SOLID],
	/* 22 SE */	25: [0,0, 1,H, SOLID], 26: [0,H, 1,1, SOLID],
	/* 45 SE */	24: [0,0, 1,1, SOLID],
	/* 67 SE */	11: [0,0, H,1, SOLID], 22: [H,0, 1,1, SOLID],
	/* 75 SE */	33: [0,0, N,1, SOLID], 44: [N,0, M,1, SOLID], 55: [M,0, 1,1, SOLID],
	
	/* 15 NW */	16: [1,N, 0,0, SOLID], 17: [1,M, 0,N, SOLID], 18: [1,1, 0,M, SOLID],
	/* 22 NW */	14: [1,H, 0,0, SOLID], 15: [1,1, 0,H, SOLID],
	/* 45 NW */	13: [1,1, 0,0, SOLID],
	/* 67 NW */	 8: [H,1, 0,0, SOLID], 19: [1,1, H,0, SOLID],
	/* 75 NW */	30: [N,1, 0,0, SOLID], 41: [M,1, N,0, SOLID], 52: [1,1, M,0, SOLID],
	
	/* 15 SW */ 38: [1,M, 0,1, SOLID], 39: [1,N, 0,M, SOLID], 40: [1,0, 0,N, SOLID],
	/* 22 SW */ 36: [1,H, 0,1, SOLID], 37: [1,0, 0,H, SOLID],
	/* 45 SW */ 35: [1,0, 0,1, SOLID],
	/* 67 SW */  9: [1,0, H,1, SOLID], 20: [H,0, 0,1, SOLID],
	/* 75 SW */ 31: [1,0, M,1, SOLID], 42: [M,0, N,1, SOLID], 53: [N,0, 0,1, SOLID],
	
	/* Go N  */ 12: [0,0, 1,0, NON_SOLID],
	/* Go S  */ 23: [1,1, 0,1, NON_SOLID],
	/* Go E  */ 34: [1,0, 1,1, NON_SOLID],
	/* Go W  */ 45: [0,1, 0,0, NON_SOLID]
	
	// Now that was fun!
};


// Static Dummy CollisionMap; never collides
ig.CollisionMap.staticNoCollision = { trace: function( x, y, vx, vy ) {
	return {
		collision: {x: false, y: false, slope: false},
		pos: {x: x+vx, y: y+vy},
		tile: {x: 0, y: 0}
	};
}};

});
},{}],7:[function(require,module,exports){
ig.module(
	'impact.debug.debug'
)
.requires(	
	'impact.debug.entities-panel',
	'impact.debug.maps-panel',
	'impact.debug.graph-panel'
)
.defines(function(){ "use strict";
	
/* Empty module to require all debug panels */

});
},{}],8:[function(require,module,exports){
ig.module(
	'impact.debug.entities-panel'
)
.requires(
	'impact.debug.menu',
	'impact.entity'
)
.defines(function(){ "use strict";


ig.Entity.inject({
	colors: {
		names: '#fff',
		velocities: '#0f0',
		boxes: '#f00'
	},
	
	draw: function() {
		this.parent();		
		
		// Collision Boxes
		if( ig.Entity._debugShowBoxes ) {
			ig.system.context.strokeStyle = this.colors.boxes;
			ig.system.context.lineWidth = 1.0;
			ig.system.context.strokeRect(	
				ig.system.getDrawPos(this.pos.x.round() - ig.game.screen.x) - 0.5,
				ig.system.getDrawPos(this.pos.y.round() - ig.game.screen.y) - 0.5,
				this.size.x * ig.system.scale,
				this.size.y * ig.system.scale
			);
		}
		
		// Velocities
		if( ig.Entity._debugShowVelocities ) {
			var x = this.pos.x + this.size.x/2;
			var y = this.pos.y + this.size.y/2;
			
			this._debugDrawLine( this.colors.velocities, x, y, x + this.vel.x, y + this.vel.y );
		}
		
		// Names & Targets
		if( ig.Entity._debugShowNames ) {
			if( this.name ) {
				ig.system.context.fillStyle = this.colors.names;
				ig.system.context.fillText(
					this.name,
					ig.system.getDrawPos(this.pos.x - ig.game.screen.x), 
					ig.system.getDrawPos(this.pos.y - ig.game.screen.y)
				);
			}
			
			if( typeof(this.target) == 'object' ) {
				for( var t in this.target ) {
					var ent = ig.game.getEntityByName( this.target[t] );
					if( ent ) {
						this._debugDrawLine( this.colors.names,
							this.pos.x + this.size.x/2, this.pos.y + this.size.y/2,
							ent.pos.x + ent.size.x/2, ent.pos.y + ent.size.y/2
						);
					}
				}
			}
		}
	},
	
	
	_debugDrawLine: function( color, sx, sy, dx, dy ) {
		ig.system.context.strokeStyle = color;
		ig.system.context.lineWidth = 1.0;

		ig.system.context.beginPath();
		ig.system.context.moveTo( 
			ig.system.getDrawPos(sx - ig.game.screen.x),
			ig.system.getDrawPos(sy - ig.game.screen.y)
		);
		ig.system.context.lineTo( 
			ig.system.getDrawPos(dx - ig.game.screen.x),
			ig.system.getDrawPos(dy - ig.game.screen.y)
		);
		ig.system.context.stroke();
		ig.system.context.closePath();
	}
});


ig.Entity._debugEnableChecks = true;
ig.Entity._debugShowBoxes = false;
ig.Entity._debugShowVelocities = false;
ig.Entity._debugShowNames = false;

ig.Entity.oldCheckPair = ig.Entity.checkPair;
ig.Entity.checkPair = function( a, b ) {
	if( !ig.Entity._debugEnableChecks ) {
		return;
	}
	ig.Entity.oldCheckPair( a, b );
};


ig.debug.addPanel({
	type: ig.DebugPanel,
	name: 'entities',
	label: 'Entities',
	options: [
		{
			name: 'Checks & Collisions',
			object: ig.Entity,
			property: '_debugEnableChecks'
		},
		{
			name: 'Show Collision Boxes',
			object: ig.Entity,
			property: '_debugShowBoxes'
		},
		{
			name: 'Show Velocities',
			object: ig.Entity,
			property: '_debugShowVelocities'
		},
		{
			name: 'Show Names & Targets',
			object: ig.Entity,
			property: '_debugShowNames'
		}
	]
});


});
},{}],9:[function(require,module,exports){
ig.module(
	'impact.debug.graph-panel'
)
.requires(
	'impact.debug.menu',
	'impact.system',
	'impact.game',
	'impact.image'
)
.defines(function(){ "use strict";


ig.Game.inject({	
	draw: function() {
		ig.graph.beginClock('draw');
		this.parent();
		ig.graph.endClock('draw');
	},
	
	
	update: function() {
		ig.graph.beginClock('update');
		this.parent();
		ig.graph.endClock('update');
	},
	
	
	checkEntities: function() {
		ig.graph.beginClock('checks');
		this.parent();
		ig.graph.endClock('checks');
	}
});



ig.DebugGraphPanel = ig.DebugPanel.extend({
	clocks: {},
	marks: [],
	textY: 0,
	height: 128,
	ms: 64,
	timeBeforeRun: 0,
	
	
	init: function( name, label ) {
		this.parent( name, label );
		
		this.mark16ms = (this.height - (this.height/this.ms) * 16).round();
		this.mark33ms = (this.height - (this.height/this.ms) * 33).round();
		this.msHeight = this.height/this.ms;
		
		this.graph = ig.$new('canvas');
		this.graph.width = window.innerWidth;
		this.graph.height = this.height;
		this.container.appendChild( this.graph );
		this.ctx = this.graph.getContext('2d');
		
		this.ctx.fillStyle = '#444';
		this.ctx.fillRect( 0, this.mark16ms, this.graph.width, 1 );
		this.ctx.fillRect( 0, this.mark33ms, this.graph.width, 1 );
		
		this.addGraphMark( '16ms', this.mark16ms );
		this.addGraphMark( '33ms', this.mark33ms );
		
		this.addClock( 'draw', 'Draw', '#13baff' );
		this.addClock( 'update', 'Entity Update', '#bb0fff' );
		this.addClock( 'checks', 'Entity Checks & Collisions', '#a2e908' );
		this.addClock( 'lag', 'System Lag', '#f26900' );
		
		ig.mark = this.mark.bind(this);
		ig.graph = this;
	},
	
	
	addGraphMark: function( name, height ) {
		var span = ig.$new('span');
		span.className = 'ig_debug_graph_mark';
		span.textContent = name;
		span.style.top = height.round() + 'px';
		this.container.appendChild( span );
	},
	
	
	addClock: function( name, description, color ) {		
		var mark = ig.$new('span');
		mark.className = 'ig_debug_legend_color';
		mark.style.backgroundColor = color;
		
		var number = ig.$new('span');
		number.className = 'ig_debug_legend_number';
		number.appendChild( document.createTextNode('0') );
		
		var legend = ig.$new('span');
		legend.className = 'ig_debug_legend';
		legend.appendChild( mark );
		legend.appendChild( document.createTextNode(description +' (') );
		legend.appendChild( number );
		legend.appendChild( document.createTextNode('ms)') );
		
		this.container.appendChild( legend );
		
		this.clocks[name] = {
			description: description,
			color: color,
			current: 0,
			start: Date.now(),
			avg: 0,
			html: number
		};
	},
	
	
	beginClock: function( name, offset ) {
		this.clocks[name].start = Date.now() + (offset || 0);
	},
	
	
	endClock: function( name ) {
		var c = this.clocks[name];
		c.current = Math.round(Date.now() - c.start);
		c.avg = c.avg * 0.8 + c.current * 0.2;
	},
	
	
	mark: function( msg, color ) {
		if( this.active ) {
			this.marks.push( {msg:msg, color:(color||'#fff')} );
		}
	},
	
	
	beforeRun: function() {
		this.endClock('lag');
		this.timeBeforeRun = Date.now();
	},
	
	
	afterRun: function() {
		var frameTime = Date.now() - this.timeBeforeRun;
		var nextFrameDue = (1000/ig.system.fps) - frameTime;
		this.beginClock('lag', Math.max(nextFrameDue, 0));
		
		
		var x = this.graph.width-1;
		var y = this.height;
		
		this.ctx.drawImage( this.graph, -1, 0 );
		
		this.ctx.fillStyle = '#000';
		this.ctx.fillRect( x, 0, 1, this.height );
		
		this.ctx.fillStyle = '#444';
		this.ctx.fillRect( x, this.mark16ms, 1, 1 );
		
		this.ctx.fillStyle = '#444';
		this.ctx.fillRect( x, this.mark33ms, 1, 1 );
		
		for( var ci in this.clocks ) {
			var c = this.clocks[ci];
			c.html.textContent = c.avg.toFixed(2);
			
			if( c.color && c.current > 0 ) {
				this.ctx.fillStyle = c.color;
				var h = c.current * this.msHeight;
				y -= h;
				this.ctx.fillRect(	x, y, 1, h );
				c.current = 0;
			}
		}
		
		this.ctx.textAlign = 'right';
		this.ctx.textBaseline = 'top';
		this.ctx.globalAlpha = 0.5;
		
		for( var i = 0; i < this.marks.length; i++ ) {
			var m = this.marks[i];
			this.ctx.fillStyle = m.color;
			this.ctx.fillRect(	x, 0, 1, this.height );
			if( m.msg ) {
				this.ctx.fillText( m.msg, x-1, this.textY );
				this.textY = (this.textY+8)%32;
			}
		}
		this.ctx.globalAlpha = 1;
		this.marks = [];
	}
});


ig.debug.addPanel({
	type: ig.DebugGraphPanel,
	name: 'graph',
	label: 'Performance'
});


});
},{}],10:[function(require,module,exports){
ig.module(
	'impact.debug.maps-panel'
)
.requires(
	'impact.debug.menu',
	'impact.game',
	'impact.background-map'
)
.defines(function(){ "use strict";


ig.Game.inject({
	loadLevel: function( data ) {
		this.parent(data);
		ig.debug.panels.maps.load(this);
	}
});

	
ig.DebugMapsPanel = ig.DebugPanel.extend({
	maps: [],
	mapScreens: [],
	
	
	init: function( name, label ) {
		this.parent( name, label );
		this.load();
	},
	
	
	load: function( game ) {
		this.options = [];
		this.panels = [];
		
		if( !game || !game.backgroundMaps.length ) {
			this.container.innerHTML = '<em>No Maps Loaded</em>';
			return;	
		}
		
		this.maps = game.backgroundMaps;
		this.mapScreens = [];
		this.container.innerHTML = '';
		
		for( var m = 0; m < this.maps.length; m++ ) {
			var map = this.maps[m];
			
			var subPanel = new ig.DebugPanel( m, 'Layer '+m );
			
			var head = new ig.$new('strong');
			head.textContent = m +': ' + map.tiles.path;
			subPanel.container.appendChild( head );
			
			subPanel.addOption( new ig.DebugOption('Enabled', map, 'enabled') );
			subPanel.addOption( new ig.DebugOption('Pre Rendered', map, 'preRender') );
			subPanel.addOption( new ig.DebugOption('Show Chunks', map, 'debugChunks') );
			
			this.generateMiniMap( subPanel, map, m );
			this.addPanel( subPanel );
		}
	},
	
	
	generateMiniMap: function( panel, map, id ) {
		var s = ig.system.scale; // we'll need this a lot
		
		// resize the tileset, so that one tile is 's' pixels wide and high
		var ts = ig.$new('canvas');
		var tsctx = ts.getContext('2d');
		
		var w = map.tiles.width * s;
		var h = map.tiles.height * s;
		var ws = w / map.tilesize;
		var hs = h / map.tilesize;
		ts.width = ws;
		ts.height = hs;
		tsctx.drawImage( map.tiles.data, 0, 0, w, h, 0, 0, ws, hs );
		
		// create the minimap canvas
		var mapCanvas = ig.$new('canvas');
		mapCanvas.width = map.width * s;
		mapCanvas.height = map.height * s;
		var ctx = mapCanvas.getContext('2d');
		
		if( ig.game.clearColor ) {
			ctx.fillStyle = ig.game.clearColor; 
			ctx.fillRect(0, 0, w, h);
		}
		
		// draw the map
		var tile = 0;
		for( var x = 0; x < map.width; x++ ) {
			for( var y = 0; y < map.height; y++ ) {
				if( (tile = map.data[y][x]) ) {
					ctx.drawImage(
						ts, 
						Math.floor(((tile-1) * s) % ws),
						Math.floor((tile-1) * s / ws) * s,
						s, s,
						x * s, y * s,
						s, s
					);
				}
			}
		}
		
		var mapContainer = ig.$new('div');
		mapContainer.className = 'ig_debug_map_container';
		mapContainer.style.width = map.width * s + 'px';
		mapContainer.style.height = map.height * s + 'px';
		
		var mapScreen = ig.$new('div');
		mapScreen.className = 'ig_debug_map_screen';
		mapScreen.style.width = ((ig.system.width / map.tilesize) * s - 2) + 'px';
		mapScreen.style.height = ((ig.system.height / map.tilesize) * s - 2) + 'px';
		this.mapScreens[id] = mapScreen;
		
		mapContainer.appendChild( mapCanvas );
		mapContainer.appendChild( mapScreen );
		panel.container.appendChild( mapContainer );
	},
	
	
	afterRun: function() {
		// Update the screen position DIV for each mini-map
		var s = ig.system.scale;
		for( var m = 0; m < this.maps.length; m++ ) {
			var map = this.maps[m];
			var screen = this.mapScreens[m];
			
			if( !map || !screen ) { // Quick sanity check
				continue;
			}
			
			var x = map.scroll.x / map.tilesize;
			var y = map.scroll.y / map.tilesize;
			
			if( map.repeat ) {
				x %= map.width;
				y %= map.height;
			}
			
			screen.style.left = (x * s) + 'px';
			screen.style.top = (y * s) + 'px';
		}
	}
});


ig.debug.addPanel({
	type: ig.DebugMapsPanel,
	name: 'maps',
	label: 'Background Maps'
});


});
},{}],11:[function(require,module,exports){
ig.module(
	'impact.debug.menu'
)
.requires(
	'dom.ready',
	'impact.system'
)
.defines(function(){ "use strict";


ig.System.inject({	
	run: function() {
		ig.debug.beforeRun();
		this.parent();
		ig.debug.afterRun();
	},
	
	setGameNow: function( gameClass ) {
		this.parent( gameClass );
		ig.debug.ready();
	}
});


ig.Debug = ig.Class.extend({
	options: {},
	panels: {},
	numbers:{},
	container: null,
	panelMenu: null,
	activePanel: null,
	
	debugTime: 0,
	debugTickAvg: 0.016,
	debugRealTime: Date.now(),
	
	init: function() {
		// Inject the Stylesheet
		var style = ig.$new('link');
		style.rel = 'stylesheet';
		style.type = 'text/css';
		style.href = ig.prefix + 'lib/impact/debug/debug.css';
		ig.$('body')[0].appendChild( style );

		// Create the Debug Container
		this.container = ig.$new('div');
		this.container.className ='ig_debug';
		ig.$('body')[0].appendChild( this.container );
		
		// Create and add the Menu Container
		this.panelMenu = ig.$new('div');
		this.panelMenu.innerHTML = '<div class="ig_debug_head">Impact.Debug:</div>';
		this.panelMenu.className ='ig_debug_panel_menu';
		
		this.container.appendChild( this.panelMenu );
		
		// Create and add the Stats Container
		this.numberContainer = ig.$new('div');
		this.numberContainer.className ='ig_debug_stats';
		this.panelMenu.appendChild( this.numberContainer );
		
		// Set ig.log(), ig.assert() and ig.show()
		if( window.console && window.console.log && window.console.assert ) {
			// Can't use .bind() on native functions in IE9 :/
			ig.log = console.log.bind ? console.log.bind(console) : console.log;
			ig.assert = console.assert.bind ? console.assert.bind(console) : console.assert;
		}
		ig.show = this.showNumber.bind(this);
	},
	
	
	addNumber: function( name, width ) {
		var number = ig.$new('span');		
		this.numberContainer.appendChild( number );
		this.numberContainer.appendChild( document.createTextNode(name) );
		
		this.numbers[name] = number;
	},
	
	
	showNumber: function( name, number, width ) {
		if( !this.numbers[name] ) {
			this.addNumber( name, width );
		}
		this.numbers[name].textContent = number;
	},
	
	
	addPanel: function( panelDef ) {
		// Create the panel and options
		var panel = new (panelDef.type)( panelDef.name, panelDef.label );
		if( panelDef.options ) {
			for( var i = 0; i < panelDef.options.length; i++ ) {
				var opt = panelDef.options[i];
				panel.addOption( new ig.DebugOption(opt.name, opt.object, opt.property) );
			}
		}
		
		this.panels[ panel.name ] = panel;
		panel.container.style.display = 'none';
		this.container.appendChild( panel.container );
		
		
		// Create the menu item
		var menuItem = ig.$new('div');
		menuItem.className = 'ig_debug_menu_item';
		menuItem.textContent = panel.label;
		menuItem.addEventListener(
			'click',
			(function(ev){ this.togglePanel(panel); }).bind(this),
			false
		);
		panel.menuItem = menuItem;
		
		// Insert menu item in alphabetical order into the menu
		var inserted = false;
		for( var i = 1; i < this.panelMenu.childNodes.length; i++ ) {
			var cn = this.panelMenu.childNodes[i];
			if( cn.textContent > panel.label ) {
				this.panelMenu.insertBefore( menuItem, cn );
				inserted = true;
				break;
			}
		}
		if( !inserted ) {
			// Not inserted? Append at the end!
			this.panelMenu.appendChild( menuItem );
		}
	},
	
	
	showPanel: function( name ) {
		this.togglePanel( this.panels[name] );
	},
	
	
	togglePanel: function( panel ) {
		if( panel != this.activePanel && this.activePanel ) {
			this.activePanel.toggle( false );
			this.activePanel.menuItem.className = 'ig_debug_menu_item';
			this.activePanel = null;
		}
		
		var dsp = panel.container.style.display;
		var active = (dsp != 'block');
		panel.toggle( active );
		panel.menuItem.className = 'ig_debug_menu_item' + (active ? ' active' : '');
		
		if( active ) {
			this.activePanel = panel;
		}
	},
	
	
	ready: function() {
		for( var p in this.panels ) {
			this.panels[p].ready();
		}
	},
	
	
	beforeRun: function() {
		var timeBeforeRun = Date.now();
		this.debugTickAvg = this.debugTickAvg * 0.8 + (timeBeforeRun - this.debugRealTime) * 0.2;
		this.debugRealTime = timeBeforeRun;
		
		if( this.activePanel ) {
			this.activePanel.beforeRun();
		}
	},
	
	
	afterRun: function() {
		var frameTime = Date.now() - this.debugRealTime;
		var nextFrameDue = (1000/ig.system.fps) - frameTime;
		
		this.debugTime = this.debugTime * 0.8 + frameTime * 0.2;
		
		
		if( this.activePanel ) {
			this.activePanel.afterRun();
		}
		
		this.showNumber( 'ms',  this.debugTime.toFixed(2) );
		this.showNumber( 'fps',  Math.round(1000/this.debugTickAvg) );
		this.showNumber( 'draws', ig.Image.drawCount );
		if( ig.game && ig.game.entities ) {
			this.showNumber( 'entities', ig.game.entities.length );
		}
		ig.Image.drawCount = 0;
	}
});



ig.DebugPanel = ig.Class.extend({
	active: false,
	container: null,
	options: [],
	panels: [],
	label: '',
	name: '',
	
	
	init: function( name, label ) {
		this.name = name;
		this.label = label;
		this.container = ig.$new('div');
		this.container.className = 'ig_debug_panel ' + this.name;
	},
	
	
	toggle: function( active ) {
		this.active = active;
		this.container.style.display = active ? 'block' : 'none';
	},
	
	
	addPanel: function( panel ) {
		this.panels.push( panel );
		this.container.appendChild( panel.container );
	},
	
	
	addOption: function( option ) {
		this.options.push( option );
		this.container.appendChild( option.container );
	},
	
	
	ready: function(){},
	beforeRun: function(){},
	afterRun: function(){}
});



ig.DebugOption = ig.Class.extend({
	name: '',
	labelName: '',
	className: 'ig_debug_option',
	label: null,
	mark: null,
	container: null,
	active: false,
	
	colors: {
		enabled: '#fff',
		disabled: '#444'
	},
	
	
	init: function( name, object, property ) {
		this.name = name;
		this.object = object;
		this.property = property;
		
		this.active = this.object[this.property];
		
		this.container = ig.$new('div');
		this.container.className = 'ig_debug_option';
		
		this.label = ig.$new('span');
		this.label.className = 'ig_debug_label';
		this.label.textContent = this.name;
		
		this.mark = ig.$new('span');
		this.mark.className = 'ig_debug_label_mark';
		
		this.container.appendChild( this.mark );
		this.container.appendChild( this.label );
		this.container.addEventListener( 'click', this.click.bind(this), false );
		
		this.setLabel();
	},
	
	
	setLabel: function() {
		this.mark.style.backgroundColor = this.active ? this.colors.enabled : this.colors.disabled;
	},
	
	
	click: function( ev ) {
		this.active = !this.active;
		this.object[this.property] = this.active;
		this.setLabel();
		
		ev.stopPropagation();
		ev.preventDefault();
		return false;
	}
});



// Create the debug instance!
ig.debug = new ig.Debug();

});
},{}],12:[function(require,module,exports){
ig.module(
	'impact.entity-pool'
)
.requires(
	'impact.game'
)
.defines(function(){ "use strict";

ig.EntityPool = {
	pools: {},
		
	mixin: { 
		staticInstantiate: function( x, y, settings ) {
			return ig.EntityPool.getFromPool( this.classId, x, y, settings );
		},
		
		erase: function() {
			ig.EntityPool.putInPool( this );
		}
	},
	
	enableFor: function( Class ) {
		Class.inject(this.mixin);
	},
	
	getFromPool: function( classId, x, y, settings ) {
		var pool = this.pools[classId];
		if( !pool || !pool.length ) { return null; }
		
		var instance = pool.pop();
		instance.reset(x, y, settings);
		return instance;
	},
	
	putInPool: function( instance ) {
		if( !this.pools[instance.classId] ) {
			this.pools[instance.classId] = [instance];
		}
		else {
			this.pools[instance.classId].push(instance);
		}
	},
	
	drainPool: function( classId ) {
		delete this.pools[classId];
	},
	
	drainAllPools: function() {
		this.pools = {};
	}
};

ig.Game.inject({
	loadLevel: function( data ) {
		ig.EntityPool.drainAllPools();
		this.parent(data);
	}
});

});

},{}],13:[function(require,module,exports){
ig.module(
	'impact.entity'
)
.requires(
	'impact.animation',
	'impact.impact'
)
.defines(function(){ "use strict";

ig.Entity = ig.Class.extend({
	id: 0,
	settings: {},
	
	size: {x: 16, y:16},
	offset: {x: 0, y: 0},
	
	pos: {x: 0, y:0},
	last: {x: 0, y:0},
	vel: {x: 0, y: 0},
	accel: {x: 0, y: 0},
	friction: {x: 0, y: 0},
	maxVel: {x: 500, y: 500},
	zIndex: 0,
	gravityFactor: 1,
	standing: false,
	bounciness: 0,
	minBounceVelocity: 40,
	
	anims: {},
	animSheet: null,
	currentAnim: null,
	health: 10,
	
	type: 0, // TYPE.NONE
	checkAgainst: 0, // TYPE.NONE
	collides: 0, // COLLIDES.NEVER
	
	_killed: false,
	
	slopeStanding: {min: (44).toRad(), max: (136).toRad() },
	
	init: function( x, y, settings ) {
		this.id = ++ig.Entity._lastId;
		this.pos.x = this.last.x = x;
		this.pos.y = this.last.y = y;
		
		ig.merge( this, settings );
	},
	
	reset: function( x, y, settings ) {
		var proto = this.constructor.prototype;
		this.pos.x = x;
		this.pos.y = y;
		this.last.x = x;
		this.last.y = y;
		this.vel.x = proto.vel.x;
		this.vel.y = proto.vel.y;
		this.accel.x = proto.accel.x;
		this.accel.y = proto.accel.y;
		this.health = proto.health;
		this._killed = proto._killed;
		this.standing = proto.standing;
		
		this.type = proto.type;
		this.checkAgainst = proto.checkAgainst;
		this.collides = proto.collides;
		
		ig.merge( this, settings );
	},
	
	addAnim: function( name, frameTime, sequence, stop ) {
		if( !this.animSheet ) {
			throw( 'No animSheet to add the animation '+name+' to.' );
		}
		var a = new ig.Animation( this.animSheet, frameTime, sequence, stop );
		this.anims[name] = a;
		if( !this.currentAnim ) {
			this.currentAnim = a;
		}
		
		return a;
	},
	
	update: function() {
		this.last.x = this.pos.x;
		this.last.y = this.pos.y;
		this.vel.y += ig.game.gravity * ig.system.tick * this.gravityFactor;
		
		this.vel.x = this.getNewVelocity( this.vel.x, this.accel.x, this.friction.x, this.maxVel.x );
		this.vel.y = this.getNewVelocity( this.vel.y, this.accel.y, this.friction.y, this.maxVel.y );
		
		// movement & collision
		var mx = this.vel.x * ig.system.tick;
		var my = this.vel.y * ig.system.tick;
		var res = ig.game.collisionMap.trace( 
			this.pos.x, this.pos.y, mx, my, this.size.x, this.size.y
		);
		this.handleMovementTrace( res );
		
		if( this.currentAnim ) {
			this.currentAnim.update();
		}
	},
	
	
	getNewVelocity: function( vel, accel, friction, max ) {
		if( accel ) {
			return ( vel + accel * ig.system.tick ).limit( -max, max );
		}
		else if( friction ) {
			var delta = friction * ig.system.tick;
			
			if( vel - delta > 0) {
				return vel - delta;
			} 
			else if( vel + delta < 0 ) {
				return vel + delta;
			}
			else {
				return 0;
			}
		}
		return vel.limit( -max, max );
	},
	
	
	handleMovementTrace: function( res ) {
		this.standing = false;
		
		if( res.collision.y ) {
			if( this.bounciness > 0 && Math.abs(this.vel.y) > this.minBounceVelocity ) {
				this.vel.y *= -this.bounciness;				
			}
			else {
				if( this.vel.y > 0 ) {
					this.standing = true;
				}
				this.vel.y = 0;
			}
		}
		if( res.collision.x ) {
			if( this.bounciness > 0 && Math.abs(this.vel.x) > this.minBounceVelocity ) {
				this.vel.x *= -this.bounciness;				
			}
			else {
				this.vel.x = 0;
			}
		}
		if( res.collision.slope ) {
			var s = res.collision.slope;
			
			if( this.bounciness > 0 ) {
				var proj = this.vel.x * s.nx + this.vel.y * s.ny;
				
				this.vel.x = (this.vel.x - s.nx * proj * 2) * this.bounciness;
				this.vel.y = (this.vel.y - s.ny * proj * 2) * this.bounciness;
			}
			else {
				var lengthSquared = s.x * s.x + s.y * s.y;
				var dot = (this.vel.x * s.x + this.vel.y * s.y)/lengthSquared;
				
				this.vel.x = s.x * dot;
				this.vel.y = s.y * dot;
				
				var angle = Math.atan2( s.x, s.y );
				if( angle > this.slopeStanding.min && angle < this.slopeStanding.max ) {
					this.standing = true;
				}
			}
		}
		
		this.pos = res.pos;
	},
	
	
	draw: function() {
		if( this.currentAnim ) {
			this.currentAnim.draw(
				this.pos.x - this.offset.x - ig.game._rscreen.x,
				this.pos.y - this.offset.y - ig.game._rscreen.y
			);
		}
	},
	
	
	kill: function() {
		ig.game.removeEntity( this );
	},
	
	
	receiveDamage: function( amount, from ) {
		this.health -= amount;
		if( this.health <= 0 ) {
			this.kill();
		}
	},
	
	
	touches: function( other ) {		
		return !(
			this.pos.x >= other.pos.x + other.size.x ||
			this.pos.x + this.size.x <= other.pos.x ||
			this.pos.y >= other.pos.y + other.size.y ||
			this.pos.y + this.size.y <= other.pos.y
		);
	},
	
	
	distanceTo: function( other ) {
		var xd = (this.pos.x + this.size.x/2) - (other.pos.x + other.size.x/2); 
		var yd = (this.pos.y + this.size.y/2) - (other.pos.y + other.size.y/2);
		return Math.sqrt( xd*xd + yd*yd );
	},
	
	
	angleTo: function( other ) {
		return Math.atan2(
			(other.pos.y + other.size.y/2) - (this.pos.y + this.size.y/2),
			(other.pos.x + other.size.x/2) - (this.pos.x + this.size.x/2)
		);
	},
	
	
	check: function( other ) {},
	collideWith: function( other, axis ) {},
	ready: function() {},
	erase: function() {}
});


// Last used entity id; incremented with each spawned entity

ig.Entity._lastId = 0;


// Collision Types - Determine if and how entities collide with each other

// In ACTIVE vs. LITE or FIXED vs. ANY collisions, only the "weak" entity moves,
// while the other one stays fixed. In ACTIVE vs. ACTIVE and ACTIVE vs. PASSIVE
// collisions, both entities are moved. LITE or PASSIVE entities don't collide
// with other LITE or PASSIVE entities at all. The behaiviour for FIXED vs.
// FIXED collisions is undefined.

ig.Entity.COLLIDES = {
	NEVER: 0,
	LITE: 1,
	PASSIVE: 2,
	ACTIVE: 4,
	FIXED: 8
};


// Entity Types - used for checks

ig.Entity.TYPE = {
	NONE: 0,
	A: 1,
	B: 2,
	BOTH: 3
};



ig.Entity.checkPair = function( a, b ) {
	
	// Do these entities want checks?
	if( a.checkAgainst & b.type ) {
		a.check( b );
	}
	
	if( b.checkAgainst & a.type ) {
		b.check( a );
	}
	
	// If this pair allows collision, solve it! At least one entity must
	// collide ACTIVE or FIXED, while the other one must not collide NEVER.
	if(
		a.collides && b.collides &&
		a.collides + b.collides > ig.Entity.COLLIDES.ACTIVE
	) {
		ig.Entity.solveCollision( a, b );
	}
};


ig.Entity.solveCollision = function( a, b ) {
	
	// If one entity is FIXED, or the other entity is LITE, the weak
	// (FIXED/NON-LITE) entity won't move in collision response
	var weak = null;
	if(
		a.collides == ig.Entity.COLLIDES.LITE ||
		b.collides == ig.Entity.COLLIDES.FIXED
	) {
		weak = a;
	}
	else if(
		b.collides == ig.Entity.COLLIDES.LITE ||
		a.collides == ig.Entity.COLLIDES.FIXED
	) {
		weak = b;
	}
		
	
	// Did they already overlap on the X-axis in the last frame? If so,
	// this must be a vertical collision!
	if(
		a.last.x + a.size.x > b.last.x &&
		a.last.x < b.last.x + b.size.x
	) {
		// Which one is on top?
		if( a.last.y < b.last.y ) {
			ig.Entity.seperateOnYAxis( a, b, weak );
		}
		else {
			ig.Entity.seperateOnYAxis( b, a, weak );
		}
		a.collideWith( b, 'y' );
		b.collideWith( a, 'y' );
	}
	
	// Horizontal collision
	else if(
		a.last.y + a.size.y > b.last.y &&
		a.last.y < b.last.y + b.size.y
	){
		// Which one is on the left?
		if( a.last.x < b.last.x ) {
			ig.Entity.seperateOnXAxis( a, b, weak );
		}
		else {
			ig.Entity.seperateOnXAxis( b, a, weak );
		}
		a.collideWith( b, 'x' );
		b.collideWith( a, 'x' );
	}
};


// FIXME: This is a mess. Instead of doing all the movements here, the entities
// should get notified of the collision (with all details) and resolve it
// themselfs.

ig.Entity.seperateOnXAxis = function( left, right, weak ) {
	var nudge = (left.pos.x + left.size.x - right.pos.x);
	
	// We have a weak entity, so just move this one
	if( weak ) {
		var strong = left === weak ? right : left;
		weak.vel.x = -weak.vel.x * weak.bounciness + strong.vel.x;
		
		var resWeak = ig.game.collisionMap.trace( 
			weak.pos.x, weak.pos.y, weak == left ? -nudge : nudge, 0, weak.size.x, weak.size.y
		);
		weak.pos.x = resWeak.pos.x;
	}
	
	// Normal collision - both move
	else {
		var v2 = (left.vel.x - right.vel.x)/2;
		left.vel.x = -v2;
		right.vel.x = v2;
	
		var resLeft = ig.game.collisionMap.trace( 
			left.pos.x, left.pos.y, -nudge/2, 0, left.size.x, left.size.y
		);
		left.pos.x = Math.floor(resLeft.pos.x);
		
		var resRight = ig.game.collisionMap.trace( 
			right.pos.x, right.pos.y, nudge/2, 0, right.size.x, right.size.y
		);
		right.pos.x = Math.ceil(resRight.pos.x);
	}
};


ig.Entity.seperateOnYAxis = function( top, bottom, weak ) {
	var nudge = (top.pos.y + top.size.y - bottom.pos.y);
	
	// We have a weak entity, so just move this one
	if( weak ) {
		var strong = top === weak ? bottom : top;
		weak.vel.y = -weak.vel.y * weak.bounciness + strong.vel.y;
		
		// Riding on a platform?
		var nudgeX = 0;
		if( weak == top && Math.abs(weak.vel.y - strong.vel.y) < weak.minBounceVelocity ) {
			weak.standing = true;
			nudgeX = strong.vel.x * ig.system.tick;
		}
		
		var resWeak = ig.game.collisionMap.trace( 
			weak.pos.x, weak.pos.y, nudgeX, weak == top ? -nudge : nudge, weak.size.x, weak.size.y
		);
		weak.pos.y = resWeak.pos.y;
		weak.pos.x = resWeak.pos.x;
	}
	
	// Bottom entity is standing - just bounce the top one
	else if( ig.game.gravity && (bottom.standing || top.vel.y > 0) ) {	
		var resTop = ig.game.collisionMap.trace( 
			top.pos.x, top.pos.y, 0, -(top.pos.y + top.size.y - bottom.pos.y), top.size.x, top.size.y
		);
		top.pos.y = resTop.pos.y;
		
		if( top.bounciness > 0 && top.vel.y > top.minBounceVelocity ) {
			top.vel.y *= -top.bounciness;		
		}
		else {
			top.standing = true;
			top.vel.y = 0;
		}
	}
	
	// Normal collision - both move
	else {
		var v2 = (top.vel.y - bottom.vel.y)/2;
		top.vel.y = -v2;
		bottom.vel.y = v2;
		
		var nudgeX = bottom.vel.x * ig.system.tick;
		var resTop = ig.game.collisionMap.trace( 
			top.pos.x, top.pos.y, nudgeX, -nudge/2, top.size.x, top.size.y
		);
		top.pos.y = resTop.pos.y;
		
		var resBottom = ig.game.collisionMap.trace( 
			bottom.pos.x, bottom.pos.y, 0, nudge/2, bottom.size.x, bottom.size.y
		);
		bottom.pos.y = resBottom.pos.y;
	}
};

});

},{}],14:[function(require,module,exports){
ig.module(
	'impact.font'
)
.requires(
	'impact.image'
)
.defines(function(){ "use strict";


ig.Font = ig.Image.extend({
	widthMap: [],
	indices: [],
	firstChar: 32,
	alpha: 1,
	letterSpacing: 1,
	lineSpacing: 0,
	
	
	onload: function( ev ) {
		this._loadMetrics( this.data );
		this.parent( ev );
	},


	widthForString: function( text ) {
		// Multiline?
		if( text.indexOf('\n') !== -1 ) {
			var lines = text.split( '\n' );
			var width = 0;
			for( var i = 0; i < lines.length; i++ ) {
				width = Math.max( width, this._widthForLine(lines[i]) );
			}
			return width;
		}
		else {
			return this._widthForLine( text );
		}
	},

	
	_widthForLine: function( text ) {
		var width = 0;
		for( var i = 0; i < text.length; i++ ) {
			width += this.widthMap[text.charCodeAt(i) - this.firstChar] + this.letterSpacing;
		}
		return width;
	},


	heightForString: function( text ) {
		return text.split('\n').length * (this.height + this.lineSpacing);
	},
	
	
	draw: function( text, x, y, align ) {
		if( typeof(text) != 'string' ) {
			text = text.toString();
		}
		
		// Multiline?
		if( text.indexOf('\n') !== -1 ) {
			var lines = text.split( '\n' );
			var lineHeight = this.height + this.lineSpacing;
			for( var i = 0; i < lines.length; i++ ) {
				this.draw( lines[i], x, y + i * lineHeight, align );
			}
			return;
		}
		
		if( align == ig.Font.ALIGN.RIGHT || align == ig.Font.ALIGN.CENTER ) {
			var width = this._widthForLine( text );
			x -= align == ig.Font.ALIGN.CENTER ? width/2 : width;
		}
		

		if( this.alpha !== 1 ) {
			ig.system.context.globalAlpha = this.alpha;
		}

		for( var i = 0; i < text.length; i++ ) {
			var c = text.charCodeAt(i);
			x += this._drawChar( c - this.firstChar, x, y );
		}

		if( this.alpha !== 1 ) {
			ig.system.context.globalAlpha = 1;
		}
		ig.Image.drawCount += text.length;
	},
	
	
	_drawChar: function( c, targetX, targetY ) {
		if( !this.loaded || c < 0 || c >= this.indices.length ) { return 0; }
		
		var scale = ig.system.scale;
		
		
		var charX = this.indices[c] * scale;
		var charY = 0;
		var charWidth = this.widthMap[c] * scale;
		var charHeight = (this.height-2) * scale;		
		
		ig.system.context.drawImage( 
			this.data,
			charX, charY,
			charWidth, charHeight,
			ig.system.getDrawPos(targetX), ig.system.getDrawPos(targetY),
			charWidth, charHeight
		);
		
		return this.widthMap[c] + this.letterSpacing;
	},
	
	
	_loadMetrics: function( image ) {
		// Draw the bottommost line of this font image into an offscreen canvas
		// and analyze it pixel by pixel.
		// A run of non-transparent pixels represents a character and its width
		
		this.height = image.height-1;
		this.widthMap = [];
		this.indices = [];
		
		var px = ig.getImagePixels( image, 0, image.height-1, image.width, 1 );
		
		var currentChar = 0;
		var currentWidth = 0;
		for( var x = 0; x < image.width; x++ ) {
			var index = x * 4 + 3; // alpha component of this pixel
			if( px.data[index] > 127 ) {
				currentWidth++;
			}
			else if( px.data[index] < 128 && currentWidth ) {
				this.widthMap.push( currentWidth );
				this.indices.push( x-currentWidth );
				currentChar++;
				currentWidth = 0;
			}
		}
		this.widthMap.push( currentWidth );
		this.indices.push( x-currentWidth );
	}
});


ig.Font.ALIGN = {
	LEFT: 0,
	RIGHT: 1,
	CENTER: 2
};

});

},{}],15:[function(require,module,exports){
ig.module(
	'impact.game'
)
.requires(
	'impact.impact',
	'impact.entity',
	'impact.collision-map',
	'impact.background-map'
)
.defines(function(){ "use strict";

ig.Game = ig.Class.extend({
	
	clearColor: '#000000',
	gravity: 0,
	screen: {x: 0, y: 0},
	_rscreen: {x: 0, y: 0},
	
	entities: [],
	
	namedEntities: {},
	collisionMap: ig.CollisionMap.staticNoCollision,
	backgroundMaps: [],
	backgroundAnims: {},
	
	autoSort: false,
	sortBy: null,
	
	cellSize: 64,
	
	_deferredKill: [],
	_levelToLoad: null,
	_doSortEntities: false,
	
	
	staticInstantiate: function() {
		this.sortBy = this.sortBy || ig.Game.SORT.Z_INDEX;
		ig.game = this;
		return null;
	},
	
	
	loadLevel: function( data ) {
		this.screen = {x: 0, y: 0};

		// Entities
		this.entities = [];
		this.namedEntities = {};
		for( var i = 0; i < data.entities.length; i++ ) {
			var ent = data.entities[i];
			this.spawnEntity( ent.type, ent.x, ent.y, ent.settings );
		}
		this.sortEntities();
		
		// Map Layer
		this.collisionMap = ig.CollisionMap.staticNoCollision;
		this.backgroundMaps = [];
		for( var i = 0; i < data.layer.length; i++ ) {
			var ld = data.layer[i];
			if( ld.name == 'collision' ) {
				this.collisionMap = new ig.CollisionMap(ld.tilesize, ld.data );
			}
			else {
				var newMap = new ig.BackgroundMap(ld.tilesize, ld.data, ld.tilesetName);
				newMap.anims = this.backgroundAnims[ld.tilesetName] || {};
				newMap.repeat = ld.repeat;
				newMap.distance = ld.distance;
				newMap.foreground = !!ld.foreground;
				newMap.preRender = !!ld.preRender;
				newMap.name = ld.name;
				this.backgroundMaps.push( newMap );
			}
		}
		
		// Call post-init ready function on all entities
		for( var i = 0; i < this.entities.length; i++ ) {
			this.entities[i].ready();
		}
	},
	
	
	loadLevelDeferred: function( data ) {
		this._levelToLoad = data;
	},
	
	
	getMapByName: function( name ) {
		if( name == 'collision' ) {
			return this.collisionMap;
		}
		
		for( var i = 0; i < this.backgroundMaps.length; i++ ) {
			if( this.backgroundMaps[i].name == name ) {
				return this.backgroundMaps[i];
			}
		}
		
		return null;
	},
	
	
	getEntityByName: function( name ) {
		return this.namedEntities[name];
	},
	
	
	getEntitiesByType: function( type ) {
		var entityClass = typeof(type) === 'string'
			? ig.global[type]
			: type;
			
		var a = [];
		for( var i = 0; i < this.entities.length; i++ ) {
			var ent = this.entities[i];
			if( ent instanceof entityClass && !ent._killed ) {
				a.push( ent );
			}
		}
		return a;
	},
	
	
	spawnEntity: function( type, x, y, settings ) {
		var entityClass = typeof(type) === 'string'
			? ig.global[type]
			: type;
			
		if( !entityClass ) {
			throw("Can't spawn entity of type " + type);
		}
		var ent = new (entityClass)( x, y, settings || {} );
		this.entities.push( ent );
		if( ent.name ) {
			this.namedEntities[ent.name] = ent;
		}
		return ent;
	},
	
	
	sortEntities: function() {
		this.entities.sort( this.sortBy );
	},
	
	
	sortEntitiesDeferred: function() {
		this._doSortEntities = true;
	},
	
	
	removeEntity: function( ent ) {
		// Remove this entity from the named entities
		if( ent.name ) {
			delete this.namedEntities[ent.name];
		}
		
		// We can not remove the entity from the entities[] array in the midst
		// of an update cycle, so remember all killed entities and remove
		// them later.
		// Also make sure this entity doesn't collide anymore and won't get
		// updated or checked
		ent._killed = true;
		ent.type = ig.Entity.TYPE.NONE;
		ent.checkAgainst = ig.Entity.TYPE.NONE;
		ent.collides = ig.Entity.COLLIDES.NEVER;
		this._deferredKill.push( ent );
	},
	
	
	run: function() {
		this.update();
		this.draw();
	},
	
	
	update: function(){
		// load new level?
		if( this._levelToLoad ) {
			this.loadLevel( this._levelToLoad );
			this._levelToLoad = null;
		}
		
		// update entities
		this.updateEntities();
		this.checkEntities();
		
		// remove all killed entities
		for( var i = 0; i < this._deferredKill.length; i++ ) {
			this._deferredKill[i].erase();
			this.entities.erase( this._deferredKill[i] );
		}
		this._deferredKill = [];
		
		// sort entities?
		if( this._doSortEntities || this.autoSort ) {
			this.sortEntities();
			this._doSortEntities = false;
		}
		
		// update background animations
		for( var tileset in this.backgroundAnims ) {
			var anims = this.backgroundAnims[tileset];
			for( var a in anims ) {
				anims[a].update();
			}
		}
	},
	
	
	updateEntities: function() {
		for( var i = 0; i < this.entities.length; i++ ) {
			var ent = this.entities[i];
			if( !ent._killed ) {
				ent.update();
			}
		}
	},
	
	
	draw: function(){
		if( this.clearColor ) {
			ig.system.clear( this.clearColor );
		}
		
		// This is a bit of a circle jerk. Entities reference game._rscreen 
		// instead of game.screen when drawing themselfs in order to be 
		// "synchronized" to the rounded(?) screen position
		this._rscreen.x = ig.system.getDrawPos(this.screen.x)/ig.system.scale;
		this._rscreen.y = ig.system.getDrawPos(this.screen.y)/ig.system.scale;
		
		
		var mapIndex;
		for( mapIndex = 0; mapIndex < this.backgroundMaps.length; mapIndex++ ) {
			var map = this.backgroundMaps[mapIndex];
			if( map.foreground ) {
				// All foreground layers are drawn after the entities
				break;
			}
			map.setScreenPos( this.screen.x, this.screen.y );
			map.draw();
		}
		
		
		this.drawEntities();
		
		
		for( mapIndex; mapIndex < this.backgroundMaps.length; mapIndex++ ) {
			var map = this.backgroundMaps[mapIndex];
			map.setScreenPos( this.screen.x, this.screen.y );
			map.draw();
		}
	},
	
	
	drawEntities: function() {
		for( var i = 0; i < this.entities.length; i++ ) {
			this.entities[i].draw();
		}
	},

	
	checkEntities: function() {
		// Insert all entities into a spatial hash and check them against any
		// other entity that already resides in the same cell. Entities that are
		// bigger than a single cell, are inserted into each one they intersect
		// with.
		
		// A list of entities, which the current one was already checked with,
		// is maintained for each entity.
		
		var hash = {};
		for( var e = 0; e < this.entities.length; e++ ) {
			var entity = this.entities[e];
			
			// Skip entities that don't check, don't get checked and don't collide
			if(
				entity.type == ig.Entity.TYPE.NONE &&
				entity.checkAgainst == ig.Entity.TYPE.NONE &&
				entity.collides == ig.Entity.COLLIDES.NEVER
			) {
				continue;
			}
			
			var checked = {},
				xmin = Math.floor( entity.pos.x/this.cellSize ),
				ymin = Math.floor( entity.pos.y/this.cellSize ),
				xmax = Math.floor( (entity.pos.x+entity.size.x)/this.cellSize ) + 1,
				ymax = Math.floor( (entity.pos.y+entity.size.y)/this.cellSize ) + 1;
			
			for( var x = xmin; x < xmax; x++ ) {
				for( var y = ymin; y < ymax; y++ ) {
					
					// Current cell is empty - create it and insert!
					if( !hash[x] ) {
						hash[x] = {};
						hash[x][y] = [entity];
					}
					else if( !hash[x][y] ) {
						hash[x][y] = [entity];
					}
					
					// Check against each entity in this cell, then insert
					else {
						var cell = hash[x][y];
						for( var c = 0; c < cell.length; c++ ) {
							
							// Intersects and wasn't already checkd?
							if( entity.touches(cell[c]) && !checked[cell[c].id] ) {
								checked[cell[c].id] = true;
								ig.Entity.checkPair( entity, cell[c] );
							}
						}
						cell.push(entity);
					}
				} // end for y size
			} // end for x size
		} // end for entities
	}
});

ig.Game.SORT = {
	Z_INDEX: function( a, b ){ return a.zIndex - b.zIndex; },
	POS_X: function( a, b ){ return (a.pos.x+a.size.x) - (b.pos.x+b.size.x); },
	POS_Y: function( a, b ){ return (a.pos.y+a.size.y) - (b.pos.y+b.size.y); }
};

});
},{}],16:[function(require,module,exports){
ig.module(
	'impact.image'
)
.defines(function(){ "use strict";

ig.Image = ig.Class.extend({
	data: null,
	width: 0,
	height: 0,
	loaded: false,
	failed: false,
	loadCallback: null,
	path: '',
	
	
	staticInstantiate: function( path ) {
		return ig.Image.cache[path] || null;
	},
	
	
	init: function( path ) {
		this.path = path;
		this.load();
	},
	
	
	load: function( loadCallback ) {
		if( this.loaded ) {
			if( loadCallback ) {
				loadCallback( this.path, true );
			}
			return;
		}
		else if( !this.loaded && ig.ready ) {
			this.loadCallback = loadCallback || null;
			
			this.data = new Image();
			this.data.onload = this.onload.bind(this);
			this.data.onerror = this.onerror.bind(this);
			this.data.src = ig.prefix + this.path + ig.nocache;
		}
		else {
			ig.addResource( this );
		}
		
		ig.Image.cache[this.path] = this;
	},
	
	
	reload: function() { 
		this.loaded = false;
		this.data = new Image();
		this.data.onload = this.onload.bind(this);
		this.data.src = this.path + '?' + Date.now();
	},
	
	
	onload: function( event ) {
		this.width = this.data.width;
		this.height = this.data.height;
		this.loaded = true;
		
		if( ig.system.scale != 1 ) {
			this.resize( ig.system.scale );
		}
		
		if( this.loadCallback ) {
			this.loadCallback( this.path, true );
		}
	},
	
	
	onerror: function( event ) {
		this.failed = true;
		
		if( this.loadCallback ) {
			this.loadCallback( this.path, false );
		}
	},
	
	
	resize: function( scale ) {
		// Nearest-Neighbor scaling
		
		// The original image is drawn into an offscreen canvas of the same size
		// and copied into another offscreen canvas with the new size. 
		// The scaled offscreen canvas becomes the image (data) of this object.
		
		var origPixels = ig.getImagePixels( this.data, 0, 0, this.width, this.height );
		
		var widthScaled = this.width * scale;
		var heightScaled = this.height * scale;

		var scaled = ig.$new('canvas');
		scaled.width = widthScaled;
		scaled.height = heightScaled;
		var scaledCtx = scaled.getContext('2d');
		var scaledPixels = scaledCtx.getImageData( 0, 0, widthScaled, heightScaled );
			
		for( var y = 0; y < heightScaled; y++ ) {
			for( var x = 0; x < widthScaled; x++ ) {
				var index = (Math.floor(y / scale) * this.width + Math.floor(x / scale)) * 4;
				var indexScaled = (y * widthScaled + x) * 4;
				scaledPixels.data[ indexScaled ] = origPixels.data[ index ];
				scaledPixels.data[ indexScaled+1 ] = origPixels.data[ index+1 ];
				scaledPixels.data[ indexScaled+2 ] = origPixels.data[ index+2 ];
				scaledPixels.data[ indexScaled+3 ] = origPixels.data[ index+3 ];
			}
		}
		scaledCtx.putImageData( scaledPixels, 0, 0 );
		this.data = scaled;
	},
	
	
	draw: function( targetX, targetY, sourceX, sourceY, width, height ) {
		if( !this.loaded ) { return; }
		
		var scale = ig.system.scale;
		sourceX = sourceX ? sourceX * scale : 0;
		sourceY = sourceY ? sourceY * scale : 0;
		width = (width ? width : this.width) * scale;
		height = (height ? height : this.height) * scale;
		
		ig.system.context.drawImage( 
			this.data, sourceX, sourceY, width, height,
			ig.system.getDrawPos(targetX), 
			ig.system.getDrawPos(targetY),
			width, height
		);
		
		ig.Image.drawCount++;
	},
	
	
	drawTile: function( targetX, targetY, tile, tileWidth, tileHeight, flipX, flipY ) {
		tileHeight = tileHeight ? tileHeight : tileWidth;
		
		if( !this.loaded || tileWidth > this.width || tileHeight > this.height ) { return; }
		
		var scale = ig.system.scale;
		var tileWidthScaled = Math.floor(tileWidth * scale);
		var tileHeightScaled = Math.floor(tileHeight * scale);
		
		var scaleX = flipX ? -1 : 1;
		var scaleY = flipY ? -1 : 1;
		
		if( flipX || flipY ) {
			ig.system.context.save();
			ig.system.context.scale( scaleX, scaleY );
		}
		ig.system.context.drawImage( 
			this.data, 
			( Math.floor(tile * tileWidth) % this.width ) * scale,
			( Math.floor(tile * tileWidth / this.width) * tileHeight ) * scale,
			tileWidthScaled,
			tileHeightScaled,
			ig.system.getDrawPos(targetX) * scaleX - (flipX ? tileWidthScaled : 0), 
			ig.system.getDrawPos(targetY) * scaleY - (flipY ? tileHeightScaled : 0),
			tileWidthScaled,
			tileHeightScaled
		);
		if( flipX || flipY ) {
			ig.system.context.restore();
		}
		
		ig.Image.drawCount++;
	}
});

ig.Image.drawCount = 0;
ig.Image.cache = {};
ig.Image.reloadCache = function() {
	for( var path in ig.Image.cache ) {
		ig.Image.cache[path].reload();
	}
};

});
},{}],17:[function(require,module,exports){

// -----------------------------------------------------------------------------
// Impact Game Engine 1.23
// http://impactjs.com/
// -----------------------------------------------------------------------------


(function(window){ "use strict";

// -----------------------------------------------------------------------------
// Native Object extensions

Number.prototype.map = function(istart, istop, ostart, ostop) {
	return ostart + (ostop - ostart) * ((this - istart) / (istop - istart));
};

Number.prototype.limit = function(min, max) {
	return Math.min(max, Math.max(min, this));
};

Number.prototype.round = function(precision) {
	precision = Math.pow(10, precision || 0);
	return Math.round(this * precision) / precision;
};

Number.prototype.floor = function() {
	return Math.floor(this);
};

Number.prototype.ceil = function() {
	return Math.ceil(this);
};

Number.prototype.toInt = function() {
	return (this | 0);
};

Number.prototype.toRad = function() {
	return (this / 180) * Math.PI;
};

Number.prototype.toDeg = function() {
	return (this * 180) / Math.PI;
};

Array.prototype.erase = function(item) {
	for( var i = this.length; i--; ) {
		if( this[i] === item ) {
			this.splice(i, 1);
		}
	}
	return this;
};

Array.prototype.random = function() {
	return this[ Math.floor(Math.random() * this.length) ];
};

Function.prototype.bind = Function.prototype.bind || function (oThis) {
	if( typeof this !== "function" ) {
		throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
	}

	var aArgs = Array.prototype.slice.call(arguments, 1),
		fToBind = this,
		fNOP = function () {},
		fBound = function () {
			return fToBind.apply(
				(this instanceof fNOP && oThis ? this : oThis),
				aArgs.concat(Array.prototype.slice.call(arguments))
			);
		};

	fNOP.prototype = this.prototype;
	fBound.prototype = new fNOP();

	return fBound;
};


// -----------------------------------------------------------------------------
// ig Namespace

window.ig = {
	game: null,
	debug: null,
	version: '1.23',
	global: window,
	modules: {},
	resources: [],
	ready: false,
	baked: false,
	nocache: '',
	ua: {},
	prefix: (window.ImpactPrefix || ''),
	lib: 'lib/',
	
	_current: null,
	_loadQueue: [],
	_waitForOnload: 0,
	
	
	$: function( selector ) {
		return selector.charAt(0) == '#'
			? document.getElementById( selector.substr(1) )
			: document.getElementsByTagName( selector );
	},
	
	
	$new: function( name ) {
		return document.createElement( name );
	},
	
	
	copy: function( object ) {
		if(
		   !object || typeof(object) != 'object' ||
		   object instanceof HTMLElement ||
		   object instanceof ig.Class
		) {
			return object;
		}
		else if( object instanceof Array ) {
			var c = [];
			for( var i = 0, l = object.length; i < l; i++) {
				c[i] = ig.copy(object[i]);
			}
			return c;
		}
		else {
			var c = {};
			for( var i in object ) {
				c[i] = ig.copy(object[i]);
			}
			return c;
		}
	},
	
	
	merge: function( original, extended ) {
		for( var key in extended ) {
			var ext = extended[key];
			if(
				typeof(ext) != 'object' ||
				ext instanceof HTMLElement ||
				ext instanceof ig.Class ||
				ext === null
			) {
				original[key] = ext;
			}
			else {
				if( !original[key] || typeof(original[key]) != 'object' ) {
					original[key] = (ext instanceof Array) ? [] : {};
				}
				ig.merge( original[key], ext );
			}
		}
		return original;
	},
	
	
	ksort: function( obj ) {
		if( !obj || typeof(obj) != 'object' ) {
			return [];
		}
		
		var keys = [], values = [];
		for( var i in obj ) {
			keys.push(i);
		}
		
		keys.sort();
		for( var i = 0; i < keys.length; i++ ) {
			values.push( obj[keys[i]] );
		}
		
		return values;
	},

	// Ah, yes. I love vendor prefixes. So much fun!
	setVendorAttribute: function( el, attr, val ) {
		var uc = attr.charAt(0).toUpperCase() + attr.substr(1);
		el[attr] = el['ms'+uc] = el['moz'+uc] = el['webkit'+uc] = el['o'+uc] = val;
	},


	getVendorAttribute: function( el, attr ) {
		var uc = attr.charAt(0).toUpperCase() + attr.substr(1);
		return el[attr] || el['ms'+uc] || el['moz'+uc] || el['webkit'+uc] || el['o'+uc];
	},


	normalizeVendorAttribute: function( el, attr ) {
		var prefixedVal = ig.getVendorAttribute( el, attr );
		if( !el[attr] && prefixedVal ) {
			el[attr] = prefixedVal;
		}
	},


	// This function normalizes getImageData to extract the real, actual
	// pixels from an image. The naive method recently failed on retina
	// devices with a backgingStoreRatio != 1
	getImagePixels: function( image, x, y, width, height ) {
		var canvas = ig.$new('canvas');
		canvas.width = image.width;
		canvas.height = image.height;
		var ctx = canvas.getContext('2d');
		
		// Try to draw pixels as accurately as possible
		ig.System.SCALE.CRISP(canvas, ctx);

		var ratio = ig.getVendorAttribute( ctx, 'backingStorePixelRatio' ) || 1;
		ig.normalizeVendorAttribute( ctx, 'getImageDataHD' );

		var realWidth = image.width / ratio,
			realHeight = image.height / ratio;

		canvas.width = Math.ceil( realWidth );
		canvas.height = Math.ceil( realHeight );

		ctx.drawImage( image, 0, 0, realWidth, realHeight );
		
		return (ratio === 1)
			? ctx.getImageData( x, y, width, height )
			: ctx.getImageDataHD( x, y, width, height );
	},

	
	module: function( name ) {
		if( ig._current ) {
			throw( "Module '"+ig._current.name+"' defines nothing" );
		}
		if( ig.modules[name] && ig.modules[name].body ) {
			throw( "Module '"+name+"' is already defined" );
		}
		
		ig._current = {name: name, requires: [], loaded: false, body: null};
		ig.modules[name] = ig._current;
		ig._loadQueue.push(ig._current);
		return ig;
	},
	
	
	requires: function() {
		ig._current.requires = Array.prototype.slice.call(arguments);
		return ig;
	},
	
	
	defines: function( body ) {
		ig._current.body = body;
		ig._current = null;
		ig._initDOMReady();
	},
	
	
	addResource: function( resource ) {
		ig.resources.push( resource );
	},
	
	
	setNocache: function( set ) {
		ig.nocache = set
			? '?' + Date.now()
			: '';
	},
	
	
	// Stubs for ig.Debug
	log: function() {},
	assert: function( condition, msg ) {},
	show: function( name, number ) {},
	mark: function( msg, color ) {},
	
	
	_loadScript: function( name, requiredFrom ) {
		ig.modules[name] = {name: name, requires:[], loaded: false, body: null};
		ig._waitForOnload++;
		
		var path = ig.prefix + ig.lib + name.replace(/\./g, '/') + '.js' + ig.nocache;
		var script = ig.$new('script');
		script.type = 'text/javascript';
		script.src = path;
		script.onload = function() {
			ig._waitForOnload--;
			ig._execModules();
		};
		script.onerror = function() {
			throw(
				'Failed to load module '+name+' at ' + path + ' ' +
				'required from ' + requiredFrom
			);
		};
		ig.$('head')[0].appendChild(script);
	},

	
	_execModules: function() {
		var modulesLoaded = false;
		for( var i = 0; i < ig._loadQueue.length; i++ ) {
			var m = ig._loadQueue[i];
			var dependenciesLoaded = true;
			
			for( var j = 0; j < m.requires.length; j++ ) {
				var name = m.requires[j];
				if( !ig.modules[name] ) {
					dependenciesLoaded = false;
					ig._loadScript( name, m.name );
				}
				else if( !ig.modules[name].loaded ) {
					dependenciesLoaded = false;
				}
			}
			
			if( dependenciesLoaded && m.body ) {
				ig._loadQueue.splice(i, 1);
				m.loaded = true;
				m.body();
				modulesLoaded = true;
				i--;
			}
		}
		
		if( modulesLoaded ) {
			ig._execModules();
		}
		
		// No modules executed, no more files to load but loadQueue not empty?
		// Must be some unresolved dependencies!
		else if( !ig.baked && ig._waitForOnload == 0 && ig._loadQueue.length != 0 ) {
			var unresolved = [];
			for( var i = 0; i < ig._loadQueue.length; i++ ) {
				
				// Which dependencies aren't loaded?
				var unloaded = [];
				var requires = ig._loadQueue[i].requires;
				for( var j = 0; j < requires.length; j++ ) {
					var m = ig.modules[ requires[j] ];
					if( !m || !m.loaded ) {
						unloaded.push( requires[j] );
					}
				}
				unresolved.push( ig._loadQueue[i].name + ' (requires: ' + unloaded.join(', ') + ')');
			}
			
			throw( 
				"Unresolved (or circular?) dependencies. " +
				"Most likely there's a name/path mismatch for one of the listed modules " +
				"or a previous syntax error prevents a module from loading:\n" +
				unresolved.join('\n')				
			);
		}
	},
	
	
	_DOMReady: function() {
		if( !ig.modules['dom.ready'].loaded ) {
			if ( !document.body ) {
				return setTimeout( ig._DOMReady, 13 );
			}
			ig.modules['dom.ready'].loaded = true;
			ig._waitForOnload--;
			ig._execModules();
		}
		return 0;
	},
	
	
	_boot: function() {
		if( document.location.href.match(/\?nocache/) ) {
			ig.setNocache( true );
		}
		
		// Probe user agent string
		ig.ua.pixelRatio = window.devicePixelRatio || 1;
		ig.ua.viewport = {
			width: window.innerWidth,
			height: window.innerHeight
		};
		ig.ua.screen = {
			width: window.screen.availWidth * ig.ua.pixelRatio,
			height: window.screen.availHeight * ig.ua.pixelRatio
		};
		
		ig.ua.iPhone = /iPhone/i.test(navigator.userAgent);
		ig.ua.iPhone4 = (ig.ua.iPhone && ig.ua.pixelRatio == 2);
		ig.ua.iPad = /iPad/i.test(navigator.userAgent);
		ig.ua.android = /android/i.test(navigator.userAgent);
		ig.ua.winPhone = /Windows Phone/i.test(navigator.userAgent);
		ig.ua.iOS = ig.ua.iPhone || ig.ua.iPad;
		ig.ua.mobile = ig.ua.iOS || ig.ua.android || ig.ua.winPhone || /mobile/i.test(navigator.userAgent);
		ig.ua.touchDevice = (('ontouchstart' in window) || (window.navigator.msMaxTouchPoints));
	},
	
	
	_initDOMReady: function() {
		if( ig.modules['dom.ready'] ) {
			ig._execModules();
			return;
		}
		
		ig._boot();
		
		
		ig.modules['dom.ready'] = { requires: [], loaded: false, body: null };
		ig._waitForOnload++;
		if ( document.readyState === 'complete' ) {
			ig._DOMReady();
		}
		else {
			document.addEventListener( 'DOMContentLoaded', ig._DOMReady, false );
			window.addEventListener( 'load', ig._DOMReady, false );
		}
	}
};


// -----------------------------------------------------------------------------
// Provide ig.setAnimation and ig.clearAnimation as a compatible way to use
// requestAnimationFrame if available or setInterval otherwise

// Use requestAnimationFrame if available
ig.normalizeVendorAttribute( window, 'requestAnimationFrame' );
if( window.requestAnimationFrame ) {
	var next = 1,
		anims = {};

	window.ig.setAnimation = function( callback, element ) {
		var current = next++;
		anims[current] = true;

		var animate = function() {
			if( !anims[current] ) { return; } // deleted?
			window.requestAnimationFrame( animate, element );
			callback();
		};
		window.requestAnimationFrame( animate, element );
		return current;
	};

	window.ig.clearAnimation = function( id ) {
		delete anims[id];
	};
}

// [set/clear]Interval fallback
else {
	window.ig.setAnimation = function( callback, element ) {
		return window.setInterval( callback, 1000/60 );
	};
	window.ig.clearAnimation = function( id ) {
		window.clearInterval( id );
	};
}


// -----------------------------------------------------------------------------
// Class object based on John Resigs code; inspired by base2 and Prototype
// http://ejohn.org/blog/simple-javascript-inheritance/

var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\bparent\b/ : /.*/;
var lastClassId = 0;

window.ig.Class = function(){};
var inject = function(prop) {	
	var proto = this.prototype;
	var parent = {};
	for( var name in prop ) {		
		if( 
			typeof(prop[name]) == "function" &&
			typeof(proto[name]) == "function" && 
			fnTest.test(prop[name])
		) {
			parent[name] = proto[name]; // save original function
			proto[name] = (function(name, fn){
				return function() {
					var tmp = this.parent;
					this.parent = parent[name];
					var ret = fn.apply(this, arguments);			 
					this.parent = tmp;
					return ret;
				};
			})( name, prop[name] );
		}
		else {
			proto[name] = prop[name];
		}
	}
};

window.ig.Class.extend = function(prop) {
	var parent = this.prototype;
 
	initializing = true;
	var prototype = new this();
	initializing = false;
 
	for( var name in prop ) {
		if( 
			typeof(prop[name]) == "function" &&
			typeof(parent[name]) == "function" && 
			fnTest.test(prop[name])
		) {
			prototype[name] = (function(name, fn){
				return function() {
					var tmp = this.parent;
					this.parent = parent[name];
					var ret = fn.apply(this, arguments);			 
					this.parent = tmp;
					return ret;
				};
			})( name, prop[name] );
		}
		else {
			prototype[name] = prop[name];
		}
	}
 
	function Class() {
		if( !initializing ) {
			
			// If this class has a staticInstantiate method, invoke it
			// and check if we got something back. If not, the normal
			// constructor (init) is called.
			if( this.staticInstantiate ) {
				var obj = this.staticInstantiate.apply(this, arguments);
				if( obj ) {
					return obj;
				}
			}
			for( var p in this ) {
				if( typeof(this[p]) == 'object' ) {
					this[p] = ig.copy(this[p]); // deep copy!
				}
			}
			if( this.init ) {
				this.init.apply(this, arguments);
			}
		}
		return this;
	}
	
	Class.prototype = prototype;
	Class.prototype.constructor = Class;
	Class.extend = window.ig.Class.extend;
	Class.inject = inject;
	Class.classId = prototype.classId = ++lastClassId;
	
	return Class;
};

// Merge the ImpactMixin - if present - into the 'ig' namespace. This gives other
// code the chance to modify 'ig' before it's doing any work.
if( window.ImpactMixin ) {
	ig.merge(ig, window.ImpactMixin);
}

})(window);



// -----------------------------------------------------------------------------
// The main() function creates the system, input, sound and game objects,
// creates a preloader and starts the run loop

ig.module(
	'impact.impact'
)
.requires(
	'dom.ready',
	'impact.loader',
	'impact.system',
	'impact.input',
	'impact.sound'
)
.defines(function(){ "use strict";

ig.main = function( canvasId, gameClass, fps, width, height, scale, loaderClass ) {
	ig.system = new ig.System( canvasId, fps, width, height, scale || 1 );
	ig.input = new ig.Input();
	ig.soundManager = new ig.SoundManager();
	ig.music = new ig.Music();
	ig.ready = true;
	
	var loader = new (loaderClass || ig.Loader)( gameClass, ig.resources );
	loader.load();
};

});

},{}],18:[function(require,module,exports){
ig.module(
	'impact.input'
)
.defines(function(){ "use strict";
	
ig.KEY = {
	'MOUSE1': -1,
	'MOUSE2': -3,
	'MWHEEL_UP': -4,
	'MWHEEL_DOWN': -5,
	
	'BACKSPACE': 8,
	'TAB': 9,
	'ENTER': 13,
	'PAUSE': 19,
	'CAPS': 20,
	'ESC': 27,
	'SPACE': 32,
	'PAGE_UP': 33,
	'PAGE_DOWN': 34,
	'END': 35,
	'HOME': 36,
	'LEFT_ARROW': 37,
	'UP_ARROW': 38,
	'RIGHT_ARROW': 39,
	'DOWN_ARROW': 40,
	'INSERT': 45,
	'DELETE': 46,
	'_0': 48,
	'_1': 49,
	'_2': 50,
	'_3': 51,
	'_4': 52,
	'_5': 53,
	'_6': 54,
	'_7': 55,
	'_8': 56,
	'_9': 57,
	'A': 65,
	'B': 66,
	'C': 67,
	'D': 68,
	'E': 69,
	'F': 70,
	'G': 71,
	'H': 72,
	'I': 73,
	'J': 74,
	'K': 75,
	'L': 76,
	'M': 77,
	'N': 78,
	'O': 79,
	'P': 80,
	'Q': 81,
	'R': 82,
	'S': 83,
	'T': 84,
	'U': 85,
	'V': 86,
	'W': 87,
	'X': 88,
	'Y': 89,
	'Z': 90,
	'NUMPAD_0': 96,
	'NUMPAD_1': 97,
	'NUMPAD_2': 98,
	'NUMPAD_3': 99,
	'NUMPAD_4': 100,
	'NUMPAD_5': 101,
	'NUMPAD_6': 102,
	'NUMPAD_7': 103,
	'NUMPAD_8': 104,
	'NUMPAD_9': 105,
	'MULTIPLY': 106,
	'ADD': 107,
	'SUBSTRACT': 109,
	'DECIMAL': 110,
	'DIVIDE': 111,
	'F1': 112,
	'F2': 113,
	'F3': 114,
	'F4': 115,
	'F5': 116,
	'F6': 117,
	'F7': 118,
	'F8': 119,
	'F9': 120,
	'F10': 121,
	'F11': 122,
	'F12': 123,
	'SHIFT': 16,
	'CTRL': 17,
	'ALT': 18,
	'PLUS': 187,
	'COMMA': 188,
	'MINUS': 189,
	'PERIOD': 190
};


ig.Input = ig.Class.extend({
	bindings: {},
	actions: {},
	presses: {},
	locks: {},
	delayedKeyup: {},
	
	isUsingMouse: false,
	isUsingKeyboard: false,
	isUsingAccelerometer: false,
	mouse: {x: 0, y: 0},
	accel: {x: 0, y: 0, z: 0},
	
	
	initMouse: function() {
		if( this.isUsingMouse ) { return; }
		this.isUsingMouse = true;
		var mouseWheelBound = this.mousewheel.bind(this);
		ig.system.canvas.addEventListener('mousewheel', mouseWheelBound, false );
		ig.system.canvas.addEventListener('DOMMouseScroll', mouseWheelBound, false );
		
		ig.system.canvas.addEventListener('contextmenu', this.contextmenu.bind(this), false );
		ig.system.canvas.addEventListener('mousedown', this.keydown.bind(this), false );
		ig.system.canvas.addEventListener('mouseup', this.keyup.bind(this), false );
		ig.system.canvas.addEventListener('mousemove', this.mousemove.bind(this), false );
		
		if( ig.ua.touchDevice ) {
			// Standard
			ig.system.canvas.addEventListener('touchstart', this.keydown.bind(this), false );
			ig.system.canvas.addEventListener('touchend', this.keyup.bind(this), false );
			ig.system.canvas.addEventListener('touchmove', this.mousemove.bind(this), false );
			
			// MS
			ig.system.canvas.addEventListener('MSPointerDown', this.keydown.bind(this), false );
			ig.system.canvas.addEventListener('MSPointerUp', this.keyup.bind(this), false );
			ig.system.canvas.addEventListener('MSPointerMove', this.mousemove.bind(this), false );
			ig.system.canvas.style.msTouchAction = 'none';
		}
	},

	
	initKeyboard: function() {
		if( this.isUsingKeyboard ) { return; }
		this.isUsingKeyboard = true;
		window.addEventListener('keydown', this.keydown.bind(this), false );
		window.addEventListener('keyup', this.keyup.bind(this), false );
	},
	
	
	initAccelerometer: function() {
		if( this.isUsingAccelerometer ) { return; }
		window.addEventListener('devicemotion', this.devicemotion.bind(this), false );
	},

	
	mousewheel: function( event ) {
		var delta = event.wheelDelta ? event.wheelDelta : (event.detail * -1);
		var code = delta > 0 ? ig.KEY.MWHEEL_UP : ig.KEY.MWHEEL_DOWN;
		var action = this.bindings[code];
		if( action ) {
			this.actions[action] = true;
			this.presses[action] = true;
			this.delayedKeyup[action] = true;
			event.stopPropagation();
			event.preventDefault();
		}
	},
	
	
	mousemove: function( event ) {		
		var internalWidth = parseInt(ig.system.canvas.offsetWidth) || ig.system.realWidth;
		var scale = ig.system.scale * (internalWidth / ig.system.realWidth);
		
		var pos = {left: 0, top: 0};
		if( ig.system.canvas.getBoundingClientRect ) {
			pos = ig.system.canvas.getBoundingClientRect();
		}
		
		var ev = event.touches ? event.touches[0] : event;
		this.mouse.x = (ev.clientX - pos.left) / scale;
		this.mouse.y = (ev.clientY - pos.top) / scale;
	},
	
	
	contextmenu: function( event ) {
		if( this.bindings[ig.KEY.MOUSE2] ) {
			event.stopPropagation();
			event.preventDefault();
		}
	},
	
	
	keydown: function( event ) {
		var tag = event.target.tagName;
		if( tag == 'INPUT' || tag == 'TEXTAREA' ) { return; }
		
		var code = event.type == 'keydown' 
			? event.keyCode 
			: (event.button == 2 ? ig.KEY.MOUSE2 : ig.KEY.MOUSE1);
		
		if( event.type == 'touchstart' || event.type == 'mousedown' ) {
			this.mousemove( event );
		}
			
		var action = this.bindings[code];
		if( action ) {
			this.actions[action] = true;
			if( !this.locks[action] ) {
				this.presses[action] = true;
				this.locks[action] = true;
			}
			event.stopPropagation();
			event.preventDefault();
		}
	},
	
	
	keyup: function( event ) {
		var tag = event.target.tagName;
		if( tag == 'INPUT' || tag == 'TEXTAREA' ) { return; }
		
		var code = event.type == 'keyup' 
			? event.keyCode 
			: (event.button == 2 ? ig.KEY.MOUSE2 : ig.KEY.MOUSE1);
		
		var action = this.bindings[code];
		if( action ) {
			this.delayedKeyup[action] = true;
			event.stopPropagation();
			event.preventDefault();
		}
	},
	
	
	devicemotion: function( event ) {
		this.accel = event.accelerationIncludingGravity;
	},
	
	
	bind: function( key, action ) {
		if( key < 0 ) { this.initMouse(); }
		else if( key > 0 ) { this.initKeyboard(); }
		this.bindings[key] = action;
	},
	
	
	bindTouch: function( selector, action ) {
		var element = ig.$( selector );
		
		var that = this;
		element.addEventListener('touchstart', function(ev) {that.touchStart( ev, action );}, false);
		element.addEventListener('touchend', function(ev) {that.touchEnd( ev, action );}, false);
		element.addEventListener('MSPointerDown', function(ev) {that.touchStart( ev, action );}, false);
		element.addEventListener('MSPointerUp', function(ev) {that.touchEnd( ev, action );}, false);
	},
	
	
	unbind: function( key ) {
		var action = this.bindings[key];
		this.delayedKeyup[action] = true;
		
		this.bindings[key] = null;
	},
	
	
	unbindAll: function() {
		this.bindings = {};
		this.actions = {};
		this.presses = {};
		this.locks = {};
		this.delayedKeyup = {};
	},
	
	
	state: function( action ) {
		return this.actions[action];
	},
	
	
	pressed: function( action ) {
		return this.presses[action];
	},
	
	released: function( action ) {
		return !!this.delayedKeyup[action];
	},
		
	clearPressed: function() {
		for( var action in this.delayedKeyup ) {
			this.actions[action] = false;
			this.locks[action] = false;
		}
		this.delayedKeyup = {};
		this.presses = {};
	},
	
	touchStart: function( event, action ) {
		this.actions[action] = true;
		this.presses[action] = true;
		
		event.stopPropagation();
		event.preventDefault();
		return false;
	},
	
	
	touchEnd: function( event, action ) {
		this.delayedKeyup[action] = true;
		event.stopPropagation();
		event.preventDefault();
		return false;
	}
});

});
},{}],19:[function(require,module,exports){
ig.module(
	'impact.loader'
)
.requires(
	'impact.image',
	'impact.font',
	'impact.sound'
)
.defines(function(){ "use strict";

ig.Loader = ig.Class.extend({
	resources: [],
	
	gameClass: null,
	status: 0,
	done: false,
	
	_unloaded: [],
	_drawStatus: 0,
	_intervalId: 0,
	_loadCallbackBound: null,
	
	
	init: function( gameClass, resources ) {
		this.gameClass = gameClass;
		this.resources = resources;
		this._loadCallbackBound = this._loadCallback.bind(this);
		
		for( var i = 0; i < this.resources.length; i++ ) {
			this._unloaded.push( this.resources[i].path );
		}
	},
	
	
	load: function() {
		ig.system.clear( '#000' );
		
		if( !this.resources.length ) {
			this.end();
			return;
		}

		for( var i = 0; i < this.resources.length; i++ ) {
			this.loadResource( this.resources[i] );
		}
		this._intervalId = setInterval( this.draw.bind(this), 16 );
	},
	
	
	loadResource: function( res ) {
		res.load( this._loadCallbackBound );
	},
	
	
	end: function() {
		if( this.done ) { return; }
		
		this.done = true;
		clearInterval( this._intervalId );
		ig.system.setGame( this.gameClass );
	},
	
	
	draw: function() {
		this._drawStatus += (this.status - this._drawStatus)/5;
		var s = ig.system.scale;
		var w = ig.system.width * 0.6;
		var h = ig.system.height * 0.1;
		var x = ig.system.width * 0.5-w/2;
		var y = ig.system.height * 0.5-h/2;
		
		ig.system.context.fillStyle = '#000';
		ig.system.context.fillRect( 0, 0, 480, 320 );
		
		ig.system.context.fillStyle = '#fff';
		ig.system.context.fillRect( x*s, y*s, w*s, h*s );
		
		ig.system.context.fillStyle = '#000';
		ig.system.context.fillRect( x*s+s, y*s+s, w*s-s-s, h*s-s-s );
		
		ig.system.context.fillStyle = '#fff';
		ig.system.context.fillRect( x*s, y*s, w*s*this._drawStatus, h*s );
	},
	
	
	_loadCallback: function( path, status ) {
		if( status ) {
			this._unloaded.erase( path );
		}
		else {
			throw( 'Failed to load resource: ' + path );
		}
		
		this.status = 1 - (this._unloaded.length / this.resources.length);
		if( this._unloaded.length == 0 ) { // all done?
			setTimeout( this.end.bind(this), 250 );
		}
	}
});

});
},{}],20:[function(require,module,exports){
ig.module(
	'impact.map'
)
.defines(function(){ "use strict";

ig.Map = ig.Class.extend({
	tilesize: 8,
	width: 1,
	height: 1,
	data: [[]],
	name: null,
	
	
	init: function( tilesize, data ) {
		this.tilesize = tilesize;
		this.data = data;
		this.height = data.length;
		this.width = data[0].length;

		this.pxWidth = this.width * this.tilesize;
		this.pxHeight = this.height * this.tilesize;
	},
	
	
	getTile: function( x, y ) {
		var tx = Math.floor( x / this.tilesize );
		var ty = Math.floor( y / this.tilesize );
		if( 
			(tx >= 0 && tx <  this.width) &&
			(ty >= 0 && ty < this.height)
		) {
			return this.data[ty][tx];
		} 
		else {
			return 0;
		}
	},
	
	
	setTile: function( x, y, tile ) {
		var tx = Math.floor( x / this.tilesize );
		var ty = Math.floor( y / this.tilesize );
		if( 
			(tx >= 0 && tx < this.width) &&
			(ty >= 0 && ty < this.height)
		) {
			this.data[ty][tx] = tile;
		}
	}
});

});
},{}],21:[function(require,module,exports){
ig.module(
	'impact.sound'
)
.defines(function(){ "use strict";
	
ig.SoundManager = ig.Class.extend({
	clips: {},
	volume: 1,
	format: null,
	
	init: function() {
		// Quick sanity check if the Browser supports the Audio tag
		if( !ig.Sound.enabled || !window.Audio ) {
			ig.Sound.enabled = false;
			return;
		}
		
		// Probe sound formats and determine the file extension to load
		var probe = new Audio();
		for( var i = 0; i < ig.Sound.use.length; i++ ) {
			var format = ig.Sound.use[i];
			if( probe.canPlayType(format.mime) ) {
				this.format = format;
				break;
			}
		}
		
		// No compatible format found? -> Disable sound
		if( !this.format ) {
			ig.Sound.enabled = false;
		}
	},
	
	
	load: function( path, multiChannel, loadCallback ) {
		
		// Path to the soundfile with the right extension (.ogg or .mp3)
		var realPath = ig.prefix + path.replace(/[^\.]+$/, this.format.ext) + ig.nocache;
		
		// Sound file already loaded?
		if( this.clips[path] ) {
			
			// Only loaded as single channel and now requested as multichannel?
			if( multiChannel && this.clips[path].length < ig.Sound.channels ) {
				for( var i = this.clips[path].length; i < ig.Sound.channels; i++ ) {
					var a = new Audio( realPath );
					a.load();
					this.clips[path].push( a );
				}
			}
			return this.clips[path][0];
		}
		
		var clip = new Audio( realPath );
		if( loadCallback ) {
			
			// The canplaythrough event is dispatched when the browser determines
			// that the sound can be played without interuption, provided the
			// download rate doesn't change.
			// FIXME: Mobile Safari doesn't seem to dispatch this event at all?
			clip.addEventListener( 'canplaythrough', function cb(ev){
				clip.removeEventListener('canplaythrough', cb, false);
				loadCallback( path, true, ev );
			}, false );
			
			clip.addEventListener( 'error', function(ev){
				loadCallback( path, false, ev );
			}, false);
		}
		clip.preload = 'auto';
		clip.load();
		
		
		this.clips[path] = [clip];
		if( multiChannel ) {
			for( var i = 1; i < ig.Sound.channels; i++ ) {
				var a = new Audio(realPath);
				a.load();
				this.clips[path].push( a );
			}
		}
		
		return clip;
	},
	
	
	get: function( path ) {
		// Find and return a channel that is not currently playing	
		var channels = this.clips[path];
		for( var i = 0, clip; clip = channels[i++]; ) {
			if( clip.paused || clip.ended ) {
				if( clip.ended ) {
					clip.currentTime = 0;
				}
				return clip;
			}
		}
		
		// Still here? Pause and rewind the first channel
		channels[0].pause();
		channels[0].currentTime = 0;
		return channels[0];
	}
});



ig.Music = ig.Class.extend({
	tracks: [],
	namedTracks: {},
	currentTrack: null,
	currentIndex: 0,
	random: false,
	
	_volume: 1,
	_loop: false,
	_fadeInterval: 0,
	_fadeTimer: null,
	_endedCallbackBound: null,
	
	
	init: function() {
		this._endedCallbackBound = this._endedCallback.bind(this);
		
		if( Object.defineProperty ) { // Standard
			Object.defineProperty(this,"volume", { 
				get: this.getVolume.bind(this),
				set: this.setVolume.bind(this)
			});
			
			Object.defineProperty(this,"loop", { 
				get: this.getLooping.bind(this),
				set: this.setLooping.bind(this)
			});
		}
		else if( this.__defineGetter__ ) { // Non-standard
			this.__defineGetter__('volume', this.getVolume.bind(this));
			this.__defineSetter__('volume', this.setVolume.bind(this));
		
			this.__defineGetter__('loop', this.getLooping.bind(this));
			this.__defineSetter__('loop', this.setLooping.bind(this));
		}
	},
	
	
	add: function( music, name ) {
		if( !ig.Sound.enabled ) {
			return;
		}
		
		var path = music instanceof ig.Sound ? music.path : music;
		
		var track = ig.soundManager.load(path, false);
		track.loop = this._loop;
		track.volume = this._volume;
		track.addEventListener( 'ended', this._endedCallbackBound, false );
		this.tracks.push( track );
		
		if( name ) {
			this.namedTracks[name] = track;
		}
		
		if( !this.currentTrack ) {
			this.currentTrack = track;
		}
	},
	
	
	next: function() {
		if( !this.tracks.length ) { return; }
		
		this.stop();
		this.currentIndex = this.random
			? Math.floor(Math.random() * this.tracks.length)
			: (this.currentIndex + 1) % this.tracks.length;
		this.currentTrack = this.tracks[this.currentIndex];
		this.play();
	},
	
	
	pause: function() {
		if( !this.currentTrack ) { return; }
		this.currentTrack.pause();
	},
	
	
	stop: function() {
		if( !this.currentTrack ) { return; }
		this.currentTrack.pause();
		this.currentTrack.currentTime = 0;
	},
	
	
	play: function( name ) {
		// If a name was provided, stop playing the current track (if any)
		// and play the named track
		if( name && this.namedTracks[name] ) {
			var newTrack = this.namedTracks[name];
			if( newTrack != this.currentTrack ) {
				this.stop();
				this.currentTrack = newTrack;
			}
		}
		else if( !this.currentTrack ) { 
			return; 
		}
		this.currentTrack.play();
	},
	
		
	getLooping: function() {
		return this._loop;
	},
	
	
	setLooping: function( l ) {
		this._loop = l;
		for( var i in this.tracks ) {
			this.tracks[i].loop = l;
		}
	},	
		
	
	getVolume: function() {
		return this._volume;
	},
	
	
	setVolume: function( v ) {
		this._volume = v.limit(0,1);
		for( var i in this.tracks ) {
			this.tracks[i].volume = this._volume;
		}
	},
	
	
	fadeOut: function( time ) {
		if( !this.currentTrack ) { return; }
		
		clearInterval( this._fadeInterval );
		this.fadeTimer = new ig.Timer( time );
		this._fadeInterval = setInterval( this._fadeStep.bind(this), 50 );
	},
	
	
	_fadeStep: function() {
		var v = this.fadeTimer.delta()
			.map(-this.fadeTimer.target, 0, 1, 0)
			.limit( 0, 1 )
			* this._volume;
		
		if( v <= 0.01 ) {
			this.stop();
			this.currentTrack.volume = this._volume;
			clearInterval( this._fadeInterval );
		}
		else {
			this.currentTrack.volume = v;
		}
	},
	
	_endedCallback: function() {
		if( this._loop ) {
			this.play();
		}
		else {
			this.next();
		}
	}
});



ig.Sound = ig.Class.extend({
	path: '',
	volume: 1,
	currentClip: null,
	multiChannel: true,
	
	
	init: function( path, multiChannel ) {
		this.path = path;
		this.multiChannel = (multiChannel !== false);
		
		this.load();
	},
	
	
	load: function( loadCallback ) {
		if( !ig.Sound.enabled ) {
			if( loadCallback ) {
				loadCallback( this.path, true );
			}
			return;
		}
		
		if( ig.ready ) {
			ig.soundManager.load( this.path, this.multiChannel, loadCallback );
		}
		else {
			ig.addResource( this );
		}
	},
	
	
	play: function() {
		if( !ig.Sound.enabled ) {
			return;
		}
		
		this.currentClip = ig.soundManager.get( this.path );
		this.currentClip.volume = ig.soundManager.volume * this.volume;
		this.currentClip.play();
	},
	
	
	stop: function() {
		if( this.currentClip ) {
			this.currentClip.pause();
			this.currentClip.currentTime = 0;
		}
	}
});

ig.Sound.FORMAT = {
	MP3: {ext: 'mp3', mime: 'audio/mpeg'},
	M4A: {ext: 'm4a', mime: 'audio/mp4; codecs=mp4a'},
	OGG: {ext: 'ogg', mime: 'audio/ogg; codecs=vorbis'},
	WEBM: {ext: 'webm', mime: 'audio/webm; codecs=vorbis'},
	CAF: {ext: 'caf', mime: 'audio/x-caf'}
};
ig.Sound.use = [ig.Sound.FORMAT.OGG, ig.Sound.FORMAT.MP3];
ig.Sound.channels = 4;
ig.Sound.enabled = true;

});
},{}],22:[function(require,module,exports){
ig.module(
	'impact.system'
)
.requires(
	'impact.timer',
	'impact.image'
)
.defines(function(){ "use strict";

ig.System = ig.Class.extend({
	fps: 30,
	width: 320,
	height: 240,
	realWidth: 320,
	realHeight: 240,
	scale: 1,
	
	tick: 0,
	animationId: 0,
	newGameClass: null,
	running: false,
	
	delegate: null,
	clock: null,
	canvas: null,
	context: null,
	
	init: function( canvasId, fps, width, height, scale ) {
		this.fps = fps;
		
		this.clock = new ig.Timer();
		this.canvas = ig.$(canvasId);
		this.resize( width, height, scale );
		this.context = this.canvas.getContext('2d');
		
		this.getDrawPos = ig.System.drawMode;

		// Automatically switch to crisp scaling when using a scale
		// other than 1
		if( this.scale != 1 ) {
			ig.System.scaleMode = ig.System.SCALE.CRISP;
		}
		ig.System.scaleMode( this.canvas, this.context );
	},
	
	
	resize: function( width, height, scale ) {
		this.width = width;
		this.height = height;
		this.scale = scale || this.scale;
		
		this.realWidth = this.width * this.scale;
		this.realHeight = this.height * this.scale;
		this.canvas.width = this.realWidth;
		this.canvas.height = this.realHeight;
	},
	
	
	setGame: function( gameClass ) {
		if( this.running ) {
			this.newGameClass = gameClass;
		}
		else {
			this.setGameNow( gameClass );
		}
	},
	
	
	setGameNow: function( gameClass ) {
		ig.game = new (gameClass)();	
		ig.system.setDelegate( ig.game );
	},
	
	
	setDelegate: function( object ) {
		if( typeof(object.run) == 'function' ) {
			this.delegate = object;
			this.startRunLoop();
		} else {
			throw( 'System.setDelegate: No run() function in object' );
		}
	},
	
	
	stopRunLoop: function() {
		ig.clearAnimation( this.animationId );
		this.running = false;
	},
	
	
	startRunLoop: function() {
		this.stopRunLoop();
		this.animationId = ig.setAnimation( this.run.bind(this), this.canvas );
		this.running = true;
	},
	
	
	clear: function( color ) {
		this.context.fillStyle = color;
		this.context.fillRect( 0, 0, this.realWidth, this.realHeight );
	},
	
	
	run: function() {
		ig.Timer.step();
		this.tick = this.clock.tick();
		
		this.delegate.run();
		ig.input.clearPressed();
		
		if( this.newGameClass ) {
			this.setGameNow( this.newGameClass );
			this.newGameClass = null;
		}
	},
	
	
	getDrawPos: null // Set through constructor
});

ig.System.DRAW = {
	AUTHENTIC: function( p ) { return Math.round(p) * this.scale; },
	SMOOTH: function( p ) { return Math.round(p * this.scale); },
	SUBPIXEL: function( p ) { return p * this.scale; }
};
ig.System.drawMode = ig.System.DRAW.SMOOTH;

ig.System.SCALE = {
	CRISP: function( canvas, context ) {
		ig.setVendorAttribute( context, 'imageSmoothingEnabled', false );
		canvas.style.imageRendering = '-moz-crisp-edges';
		canvas.style.imageRendering = '-o-crisp-edges';
		canvas.style.imageRendering = '-webkit-optimize-contrast';
		canvas.style.imageRendering = 'crisp-edges';
		canvas.style.msInterpolationMode = 'nearest-neighbor'; // No effect on Canvas :/
	},
	SMOOTH: function( canvas, context ) {
		ig.setVendorAttribute( context, 'imageSmoothingEnabled', true );
		canvas.style.imageRendering = '';
		canvas.style.msInterpolationMode = '';
	}
};
ig.System.scaleMode = ig.System.SCALE.SMOOTH;

});

},{}],23:[function(require,module,exports){
ig.module(
	'impact.timer'
)
.defines(function(){ "use strict";

ig.Timer = ig.Class.extend({
	target: 0,
	base: 0,
	last: 0,
	pausedAt: 0,
	
	init: function( seconds ) {
		this.base = ig.Timer.time;
		this.last = ig.Timer.time;
		
		this.target = seconds || 0;
	},
	
	
	set: function( seconds ) {
		this.target = seconds || 0;
		this.base = ig.Timer.time;
		this.pausedAt = 0;
	},
	
	
	reset: function() {
		this.base = ig.Timer.time;
		this.pausedAt = 0;
	},
	
	
	tick: function() {
		var delta = ig.Timer.time - this.last;
		this.last = ig.Timer.time;
		return (this.pausedAt ? 0 : delta);
	},
	
	
	delta: function() {
		return (this.pausedAt || ig.Timer.time) - this.base - this.target;
	},


	pause: function() {
		if( !this.pausedAt ) {
			this.pausedAt = ig.Timer.time;
		}
	},


	unpause: function() {
		if( this.pausedAt ) {
			this.base += ig.Timer.time - this.pausedAt;
			this.pausedAt = 0;
		}
	}
});

ig.Timer._last = 0;
ig.Timer.time = Number.MIN_VALUE;
ig.Timer.timeScale = 1;
ig.Timer.maxStep = 0.05;

ig.Timer.step = function() {
	var current = Date.now();
	var delta = (current - ig.Timer._last) / 1000;
	ig.Timer.time += Math.min(delta, ig.Timer.maxStep) * ig.Timer.timeScale;
	ig.Timer._last = current;
};

});
},{}],24:[function(require,module,exports){
ig.module(
	'weltmeister.config'
)
.defines(function(){ "use strict";

wm.config = {
	
	project: {
		// The prefix path of your game's source code. You only have to change
		// this if you use the 'ImpactPrefix' in your dev environment.
		'modulePath': 'lib/',
		
		// This "glob" tells Weltmeister where to load the entity files
		// from. If you want to load entities from several directories,
		// you can specify an array here. E.g.:
		// 'entityFiles': ['lib/game/powerups/*.js', 'lib/game/entities/*.js']
		'entityFiles': 'lib/game/entities/*.js',
		
		// The default path for the level file selection box
		'levelPath': 'lib/game/levels/',
		
		// Whether to save levels as plain JSON or wrapped in a module. If
		// you want to load levels asynchronously via AJAX, saving as plain
		// JSON can be helpful.
		'outputFormat': 'module', // 'module' or 'json'
		
		// Whether to pretty print the JSON data in level files. If you have
		// any issues with your levels, it's usually a good idea to turn this
		// on and look at the saved level files with a text editor.
		'prettyPrint': false
	},
	
	
	// Default settings when creating new layers in Weltmeister. Change these
	// as you like
	'layerDefaults': {
		'width': 30,
		'height': 20,
		'tilesize': 8
	},
	
	// Whether to ask before closing Weltmeister when there are unsaved changes
	'askBeforeClose': true,
	
	// Whether to attempt to load the last opened level on startup
	'loadLastLevel': true,
	
	// Size of the "snap" grid when moving entities
	'entityGrid': 4,
	
	// Number of undo levels. You may want to increase this if you use 'undo'
	// frequently.
	'undoLevels': 50,
	
	// Mouse and Key bindings in Weltmeister. Some function are bound to
	// several keys. See the documentation of ig.Input for a list of available
	// key names.
	'binds': {
		'MOUSE1': 'draw',
		'MOUSE2': 'drag',
		'SHIFT': 'select',
		'CTRL': 'drag',
		'SPACE': 'menu',
		'DELETE': 'delete',
		'BACKSPACE': 'delete',
		'G': 'grid',
		'C': 'clone',
		'Z': 'undo',
		'Y': 'redo',
		'MWHEEL_UP': 'zoomin',
		'PLUS': 'zoomin',
		'MWHEEL_DOWN': 'zoomout',
		'MINUS': 'zoomout'
	},
	
	// View settings. You can change the default Zoom level and whether
	// to show the grid on startup here.
	'view': {
		'zoom': 1,
		'zoomMax': 4,
		'zoomMin': 0.125,
		'grid': false
	},
	
	// Font face and size for entity labels and the grid coordinates
	'labels': {
		'draw': true,
		'step': 32,
		'font': '10px Bitstream Vera Sans Mono, Monaco, sans-serif'
	},
	
	// Colors to use for the background, selection boxes, text and the grid
	'colors': {
		'clear': '#000000',		// Background Color
		'highlight': '#ceff36',	// Currently selected tile or entity
		'primary': '#ffffff', 	// Labels and layer bounds
		'secondary': '#555555', // Grid and tile selection bounds
		'selection': '#ff9933'	// Selection cursor box on tile maps
	},
	
	// Settings for the Collision tiles. You shouldn't need to change these.
	// The tilesize only specifies the size in the image - resizing to final
	// size for each layer happens in Weltmeister.
	'collisionTiles': {
		'path': 'lib/weltmeister/collisiontiles-64.png',
		'tilesize': 64
	},
	
	// API paths for saving levels and browsing directories. If you use a
	// different backend (i.e. not the official PHP backend), you may have
	// to change these.
	'api': {
		'save': 'lib/weltmeister/api/save.php',
		'browse': 'lib/weltmeister/api/browse.php',
		'glob': 'lib/weltmeister/api/glob.php'
	}
};

});
},{}],25:[function(require,module,exports){
ig.module(
	'weltmeister.edit-entities'
)
.requires(
	'impact.game',
	'impact.background-map',
	'weltmeister.config',
	'weltmeister.tile-select',
	'weltmeister.entities'
)
.defines(function(){ "use strict";
	
wm.EditEntities = ig.Class.extend({
	visible: true,
	active: true,
	
	div: null,
	hotkey: -1,
	ignoreLastClick: false,
	name: 'entities',
	
	entities: [],
	namedEntities: {},
	selectedEntity: null,
	entityClasses: {},
	menuDiv: null,
	selector: {size:{x:2, y:2}, pos:{x:0,y:0}, offset:{x:0,y:0}},
	wasSelectedOnScaleBorder: false,
	gridSize: wm.config.entityGrid,
	entityDefinitions: null,
	
	
	
	init: function( div ) {
		this.div = div;
		div.bind( 'mouseup', this.click.bind(this) );
		this.div.children('.visible').bind( 'mousedown', this.toggleVisibilityClick.bind(this) );
		
		this.menu = $('#entityMenu');
		this.importEntityClass( wm.entityModules );
		this.entityDefinitions = $('#entityDefinitions');
		
		$('#entityKey').bind( 'keydown', function(ev){ 
			if( ev.which == 13 ){ 
				$('#entityValue').focus(); 
				return false;
			}
			return true;
		});
		$('#entityValue').bind( 'keydown', this.setEntitySetting.bind(this) );
	},
	
	
	clear: function() {
		this.entities = [];
		this.selectEntity( null );
	},
	
	
	sort: function() {
		this.entities.sort( ig.Game.SORT.Z_INDEX );
	},
	
	
	
	
	// -------------------------------------------------------------------------
	// Loading, Saving
	
	
	fileNameToClassName: function( name ) {
		var typeName = '-' + name.replace(/^.*\/|\.js/g,'');
		typeName = typeName.replace(/-(\w)/g, function( m, a ) {
			return a.toUpperCase();
		});
		return 'Entity' + typeName;
	},
	
	
	importEntityClass: function( modules ) {
		var unloadedClasses = [];
		for( var m in modules ) {
			var className = this.fileNameToClassName(modules[m]);
			var entityName = className.replace(/^Entity/, '');
			
			// ig.global[className] should be the actual class object
			if( className && ig.global[className] ) {

				// Ignore entities that have the _wmIgnore flag
				if( !ig.global[className].prototype._wmIgnore  ) {
					var a = $( '<div/>', {
						'id': className,
						'href': '#',
						'html': entityName,
						'mouseup': this.newEntityClick.bind(this)
					});
					this.menu.append( a );
					this.entityClasses[className] = m;
				}
			}
			else {
				unloadedClasses.push( modules[m] + ' (expected name: ' + className + ')' );
			}
		}

		if( unloadedClasses.length > 0 ) {
			var warning = 'The following entity classes were not loaded due to\n'
				+ 'file and class name mismatches: \n\n'
				+ unloadedClasses.join( '\n' );
			alert( warning );
		}
	},
	
	
	getEntityByName: function( name ) {
		return this.namedEntities[name];
	},
	
	
	getSaveData: function() {
		var ents = [];
		for( var i = 0; i < this.entities.length; i++ ) {
			var ent = this.entities[i];
			var type = ent._wmClassName;
			var data = {type:type,x:ent.pos.x,y:ent.pos.y};
			
			var hasSettings = false;
			for( var p in ent._wmSettings ) {
				hasSettings = true;
			}
			if( hasSettings ) {
				data.settings = ent._wmSettings;
			}
			
			ents.push( data );
		}
		return ents;
	},		
	
	
	
	
	// -------------------------------------------------------------------------
	// Selecting
	
	
	selectEntityAt: function( x, y ) {
		this.selector.pos = { x: x, y: y };
		
		// Find all possible selections
		var possibleSelections = [];
		for( var i = 0; i < this.entities.length; i++ ) {
			if( this.entities[i].touches(this.selector) ) {
				possibleSelections.push( this.entities[i] );
			}
		}
		
		// Nothing found? Early out.
		if( !possibleSelections.length ) {
			this.selectEntity( null );
			return false;
		}
		
		// Find the 'next' selection
		var selectedIndex = possibleSelections.indexOf(this.selectedEntity);
		var nextSelection = (selectedIndex + 1) % possibleSelections.length;
		var ent = possibleSelections[nextSelection];
		
		// Select it!
		this.selector.offset = {
			x: (x - ent.pos.x + ent.offset.x),
			y: (y - ent.pos.y + ent.offset.y)
		};
		this.selectEntity( ent );
		this.wasSelectedOnScaleBorder = this.isOnScaleBorder( ent, this.selector );
		return ent;
	},
	
	
	selectEntity: function( entity ) {
		if( entity && entity != this.selectedEntity ) {
			this.selectedEntity = entity;
			$('#entitySettings').fadeOut(100,(function(){
				this.loadEntitySettings();
				$('#entitySettings').fadeIn(100);
			}).bind(this));
		} 
		else if( !entity ) {
			$('#entitySettings').fadeOut(100);
			$('#entityKey').blur();
			$('#entityValue').blur();
		}
		
		this.selectedEntity = entity;
		$('#entityKey').val('');
		$('#entityValue').val('');
	},
	
	

	
	// -------------------------------------------------------------------------
	// Creating, Deleting, Moving
	
	
	deleteSelectedEntity: function() {
		if( !this.selectedEntity ) {
			return false;
		}
		
		ig.game.undo.commitEntityDelete( this.selectedEntity );
		
		this.removeEntity( this.selectedEntity );
		this.selectEntity( null );
		return true;
	},
	
	
	removeEntity: function( ent ) {
		if( ent.name ) {
			delete this.namedEntities[ent.name];
		}
		this.entities.erase( ent );
	},
	
	
	cloneSelectedEntity: function() {
		if( !this.selectedEntity ) {
			return false;
		}
		
		var className = this.selectedEntity._wmClassName;
		var settings = ig.copy(this.selectedEntity._wmSettings);
		if( settings.name ) {
			settings.name = settings.name + '_clone';
		}
		var x = this.selectedEntity.pos.x + this.gridSize;
		var y = this.selectedEntity.pos.y;
		var newEntity = this.spawnEntity( className, x, y, settings );
		newEntity._wmSettings = settings;
		this.selectEntity( newEntity );
		
		ig.game.undo.commitEntityCreate( newEntity );
		
		return true;
	},
	
	
	dragOnSelectedEntity: function( x, y ) {
		if( !this.selectedEntity ) {
			return false;
		}
		
		
		// scale or move?
		if( this.selectedEntity._wmScalable && this.wasSelectedOnScaleBorder ) {
			this.scaleSelectedEntity( x, y );	
		}
		else {
			this.moveSelectedEntity( x, y )
		}
		
		ig.game.undo.pushEntityEdit( this.selectedEntity );
		return true;
	},
	
	
	moveSelectedEntity: function( x, y ) {
		x = 
			Math.round( (x - this.selector.offset.x ) / this.gridSize )
			* this.gridSize + this.selectedEntity.offset.x;
		y = 
			Math.round( (y - this.selector.offset.y ) / this.gridSize )
			* this.gridSize + this.selectedEntity.offset.y;
		
		// new position?
		if( this.selectedEntity.pos.x != x || this.selectedEntity.pos.y != y ) {
			$('#entityDefinitionPosX').text( x );
			$('#entityDefinitionPosY').text( y );
			
			this.selectedEntity.pos.x = x;
			this.selectedEntity.pos.y = y;
		}
	},
	
	
	scaleSelectedEntity: function( x, y ) {
		var scale = this.wasSelectedOnScaleBorder;
			
		var w = Math.round( x / this.gridSize ) * this.gridSize - this.selectedEntity.pos.x;
		
		if( !this.selectedEntity._wmSettings.size ) {
			this.selectedEntity._wmSettings.size = {};
		}
		
		if( scale == 'n' ) {
			var h = this.selectedEntity.pos.y - Math.round( y / this.gridSize ) * this.gridSize;
			if( this.selectedEntity.size.y + h <= this.gridSize ) {
				h = (this.selectedEntity.size.y - this.gridSize) * -1;
			}
			this.selectedEntity.size.y += h;
			this.selectedEntity.pos.y -= h;
		}
		else if( scale == 's' ) {
			var h = Math.round( y / this.gridSize ) * this.gridSize - this.selectedEntity.pos.y;
			this.selectedEntity.size.y = Math.max( this.gridSize, h );
		}
		else if( scale == 'e' ) {
			var w = Math.round( x / this.gridSize ) * this.gridSize - this.selectedEntity.pos.x;
			this.selectedEntity.size.x = Math.max( this.gridSize, w );
		}
		else if( scale == 'w' ) {
			var w = this.selectedEntity.pos.x - Math.round( x / this.gridSize ) * this.gridSize;
			if( this.selectedEntity.size.x + w <= this.gridSize ) {
				w = (this.selectedEntity.size.x - this.gridSize) * -1;
			}
			this.selectedEntity.size.x += w;
			this.selectedEntity.pos.x -= w;
		}
		this.selectedEntity._wmSettings.size.x = this.selectedEntity.size.x;
		this.selectedEntity._wmSettings.size.y = this.selectedEntity.size.y;
		
		this.loadEntitySettings();
	},
	
	
	newEntityClick: function( ev ) {
		this.hideMenu();
		var newEntity = this.spawnEntity( ev.target.id, 0, 0, {} );
		this.selectEntity( newEntity );
		this.moveSelectedEntity( this.selector.pos.x, this.selector.pos.y );
		ig.editor.setModified();
		
		ig.game.undo.commitEntityCreate( newEntity );
	},
	
	
	spawnEntity: function( className, x, y, settings ) {
		settings = settings || {};
		var entityClass = ig.global[ className ];
		if( entityClass ) {
			var newEntity = new (entityClass)( x, y, settings );
			newEntity._wmInEditor = true;
			newEntity._wmClassName = className;
			newEntity._wmSettings = {};
			for( var s in settings ) {
				newEntity._wmSettings[s] = settings[s];
			}
			this.entities.push( newEntity );
			if( settings.name ) {
				this.namedEntities[settings.name] = newEntity;
			}
			this.sort();
			return newEntity;
		}
		return null;
	},
	
	
	isOnScaleBorder: function( entity, selector ) {	
		var border = 2;
		var w = selector.pos.x - entity.pos.x;
		var h = selector.pos.y - entity.pos.y;
		
		if( w < border ) return 'w';
		if( w > entity.size.x - border ) return 'e';
		
		if( h < border ) return 'n';
		if( h > entity.size.y - border ) return 's';
		
		return false;
	},
	
	
	
	
	// -------------------------------------------------------------------------
	// Settings
	
	
	loadEntitySettings: function(ent) {
		
		if( !this.selectedEntity ) {
			return;
		}
		var html = 
			'<div class="entityDefinition"><span class="key">x</span>:<span class="value" id="entityDefinitionPosX">'+this.selectedEntity.pos.x+'</span></div>'
			+ '<div class="entityDefinition"><span class="key">y</span>:<span class="value" id="entityDefinitionPosY">'+this.selectedEntity.pos.y+'</span></div>';
		
		html += this.loadEntitySettingsRecursive( this.selectedEntity._wmSettings );
		this.entityDefinitions.html( html );
		
		var className = this.selectedEntity._wmClassName.replace(/^Entity/, '');
		$('#entityClass').text( className );
		
		$('.entityDefinition').bind( 'mouseup', this.selectEntitySetting );
	},
	
	
	loadEntitySettingsRecursive: function( settings, path ) {
		path = path || "";
		var html = "";
		for( var key in settings ) {
			var value = settings[key];
			if( typeof(value) == 'object' ) {
				html += this.loadEntitySettingsRecursive( value, path + key + "." );
			}
			else {
				html += '<div class="entityDefinition"><span class="key">'+path+key+'</span>:<span class="value">'+value+'</span></div>';
			}
		}
		
		return html;
	},
	
	
	setEntitySetting: function( ev ) {
		if( ev.which != 13 ) {
			return true;
		}
		var key = $('#entityKey').val();
		var value = $('#entityValue').val();
		var floatVal = parseFloat(value);
		if( value == floatVal ) {
			value = floatVal;
		}
		
		if( key == 'name' ) {
			if( this.selectedEntity.name ) {
				delete this.namedEntities[this.selectedEntity.name];
			}
			this.namedEntities[ value ] = this.selectedEntity;
		}
		
		if( key == 'x' ) {
			this.selectedEntity.pos.x = Math.round(value);
		}
		else if( key == 'y' ) {
			this.selectedEntity.pos.y = Math.round(value);
		}
		else {
			this.writeSettingAtPath( this.selectedEntity._wmSettings, key, value );
			ig.merge( this.selectedEntity, this.selectedEntity._wmSettings );
		}
		
		this.sort();
		
		ig.game.setModified();
		ig.game.draw();
		
		$('#entityKey').val('');
		$('#entityValue').val('');
		$('#entityValue').blur();
		this.loadEntitySettings();
		
		$('#entityKey').focus(); 
		return false;
	},
	
	
	writeSettingAtPath: function( root, path, value ) {
		path = path.split('.');
		var cur = root;
		for( var i = 0; i < path.length; i++ ) {
			var n = path[i];
			if( i < path.length-1 && typeof(cur[n]) != 'object' ) {
				cur[n] = {};
			}
			
			if( i == path.length-1 ) {
				cur[n] = value;
			}
			cur = cur[n];		
		}
		
		this.trimObject( root );
	},
	
	
	trimObject: function( obj ) {
		var isEmpty = true;
		for( var i in obj ) {
			if(
			   (obj[i] === "") ||
			   (typeof(obj[i]) == 'object' && this.trimObject(obj[i]))
			) {
				delete obj[i];
			}
			
			if( typeof(obj[i]) != 'undefined' ) {
				isEmpty = false;
			}
		}
		
		return isEmpty;
	},
	
	
	selectEntitySetting: function( ev ) {
		$('#entityKey').val( $(this).children('.key').text() );
		$('#entityValue').val( $(this).children('.value').text() );
		$('#entityValue').select();
	},
	
	
	
	
	
	
	// -------------------------------------------------------------------------
	// UI
	
	setHotkey: function( hotkey ) {
		this.hotkey = hotkey;
		this.div.attr('title', 'Select Layer ('+this.hotkey+')' );
	},
	
	
	showMenu: function( x, y ) {
		this.selector.pos = { 
			x: Math.round( (x + ig.editor.screen.x) / this.gridSize ) * this.gridSize, 
			y: Math.round( (y + ig.editor.screen.y) / this.gridSize ) * this.gridSize
		};
		this.menu.css({top: (y * ig.system.scale + 2), left: (x * ig.system.scale + 2) });
		this.menu.show();
	},
	
	
	hideMenu: function( x, y ) {
		ig.editor.mode = ig.editor.MODE.DEFAULT;
		this.menu.hide();
	},
	
	
	setActive: function( active ) {
		this.active = active;
		if( active ) {
			this.div.addClass( 'layerActive' );
		} else {
			this.div.removeClass( 'layerActive' );
		}
	},
	
	
	toggleVisibility: function() {
		this.visible ^= 1;
		if( this.visible ) {
			this.div.children('.visible').addClass('checkedVis');
		} else {
			this.div.children('.visible').removeClass('checkedVis');
		}
		ig.game.draw();
	},
	
	
	toggleVisibilityClick: function( ev ) {
		if( !this.active ) {
			this.ignoreLastClick = true;
		}
		this.toggleVisibility()
	},
	
	
	click: function() {
		if( this.ignoreLastClick ) {
			this.ignoreLastClick = false;
			return;
		}
		ig.editor.setActiveLayer( 'entities' );
	},
	
	
	mousemove: function( x, y ) {
		this.selector.pos = { x: x, y: y };
		
		if( this.selectedEntity ) {
			if( this.selectedEntity._wmScalable && this.selectedEntity.touches(this.selector) ) {
				var scale = this.isOnScaleBorder( this.selectedEntity, this.selector );
				if( scale == 'n' || scale == 's' ) {
					$('body').css('cursor', 'n-resize');
					return;
				}
				else if( scale == 'e' || scale == 'w' ) {
					$('body').css('cursor', 'e-resize');
					return;
				}
			}
		}
		
		$('body').css('cursor', 'default');
	},
	
	
	
	
	
	
	// -------------------------------------------------------------------------
	// Drawing
	
	
	draw: function() {
		if( this.visible ) {
			for( var i = 0; i < this.entities.length; i++ ) {
				this.drawEntity( this.entities[i] );
			}
		}
	},
	
	
	drawEntity: function( ent ) {
		
		// entity itself
		ent.draw();
		
		// box
		if( ent._wmDrawBox ) {
			ig.system.context.fillStyle = ent._wmBoxColor || 'rgba(128, 128, 128, 0.9)';
			ig.system.context.fillRect(
				ig.system.getDrawPos(ent.pos.x - ig.game.screen.x),
				ig.system.getDrawPos(ent.pos.y - ig.game.screen.y), 
				ent.size.x * ig.system.scale, 
				ent.size.y * ig.system.scale
			);
		}
		
		
		if( wm.config.labels.draw ) {
			// description
			var className = ent._wmClassName.replace(/^Entity/, '');
			var description = className + (ent.name ? ': ' + ent.name : '' );
			
			// text-shadow
			ig.system.context.fillStyle = 'rgba(0,0,0,0.4)';
			ig.system.context.fillText(
				description,
				ig.system.getDrawPos(ent.pos.x - ig.game.screen.x), 
				ig.system.getDrawPos(ent.pos.y - ig.game.screen.y + 0.5)
			);
			
			// text
			ig.system.context.fillStyle = wm.config.colors.primary;
			ig.system.context.fillText(
				description,
				ig.system.getDrawPos(ent.pos.x - ig.game.screen.x), 
				ig.system.getDrawPos(ent.pos.y - ig.game.screen.y)
			);
		}

		
		// line to targets
		if( typeof(ent.target) == 'object' ) {
			for( var t in ent.target ) {
				this.drawLineToTarget( ent, ent.target[t] );
			}
		}
	},

	
	drawLineToTarget: function( ent, target ) {
		target = ig.game.getEntityByName( target );
		if( !target ) {
			return;
		}
		
		ig.system.context.strokeStyle = '#fff';
		ig.system.context.lineWidth = 1;
		
		ig.system.context.beginPath();
		ig.system.context.moveTo(
			ig.system.getDrawPos(ent.pos.x + ent.size.x/2 - ig.game.screen.x),
			ig.system.getDrawPos(ent.pos.y + ent.size.y/2 - ig.game.screen.y)
		);
		ig.system.context.lineTo(
			ig.system.getDrawPos(target.pos.x + target.size.x/2 - ig.game.screen.x),
			ig.system.getDrawPos(target.pos.y + target.size.y/2 - ig.game.screen.y)
		);
		ig.system.context.stroke();
		ig.system.context.closePath();
	},
	
	
	drawCursor: function( x, y ) {
		if( this.selectedEntity ) {
			ig.system.context.lineWidth = 1;
			ig.system.context.strokeStyle = wm.config.colors.highlight;
			ig.system.context.strokeRect( 
				ig.system.getDrawPos(this.selectedEntity.pos.x - ig.editor.screen.x) - 0.5, 
				ig.system.getDrawPos(this.selectedEntity.pos.y - ig.editor.screen.y) - 0.5, 
				this.selectedEntity.size.x * ig.system.scale + 1, 
				this.selectedEntity.size.y * ig.system.scale + 1
			);
		}
	}
});

});
},{}],26:[function(require,module,exports){
ig.module(
	'weltmeister.edit-map'
)
.requires(
	'impact.background-map',
	'weltmeister.tile-select'
)
.defines(function(){ "use strict";

wm.EditMap = ig.BackgroundMap.extend({
	name: '',
	visible: true,
	active: true,
	linkWithCollision: false,
	
	div: null,
	brush: [[0]],
	oldData: null,
	hotkey: -1,
	ignoreLastClick: false,
	tileSelect: null,
	
	isSelecting: false,
	selectionBegin: null,
	
	init: function( name, tilesize, tileset, foreground ) {
		this.name = name;
		this.parent( tilesize, [[0]], tileset || '' );
		this.foreground = foreground;
		
		this.div = $( '<div/>', {
			'class': 'layer layerActive', 
			'id': ('layer_' + name),
			'mouseup': this.click.bind(this)
		});
		this.setName( name );
		if( this.foreground ) {
			$('#layers').prepend( this.div );
		}
		else {
			$('#layerEntities').after( this.div );
		}
		
		this.tileSelect = new wm.TileSelect( this );
	},
	
	
	getSaveData: function() {
		return {
			name: this.name,
			width: this.width,
			height: this.height,
			linkWithCollision: this.linkWithCollision,
			visible: this.visible,
			tilesetName: this.tilesetName,
			repeat: this.repeat,
			preRender: this.preRender,
			distance: this.distance,
			tilesize: this.tilesize,
			foreground: this.foreground,
			data: this.data
		};
	},
	
	
	resize: function( newWidth, newHeight ) {
		var newData = new Array( newHeight );
		for( var y = 0; y < newHeight; y++ ) {
			newData[y] = new Array( newWidth );
			for( var x = 0; x < newWidth; x++ ) {
				newData[y][x] = (x < this.width && y < this.height) ? this.data[y][x] : 0;
			}
		}
		this.data = newData;
		this.width = newWidth;
		this.height = newHeight;
		
		this.resetDiv();
	},
	
	beginEditing: function() {
		this.oldData = ig.copy(this.data);
	},
	
	getOldTile: function( x, y ) {
		var tx = Math.floor( x / this.tilesize );
		var ty = Math.floor( y / this.tilesize );
		if( 
			(tx >= 0 && tx < this.width) &&
			(ty >= 0 && ty < this.height)
		) {
			return this.oldData[ty][tx];
		} 
		else {
			return 0;
		}
	},
	
	setTileset: function( tileset ) {
		if( this.name == 'collision' ) {
			this.setCollisionTileset();
		}
		else {
			this.parent( tileset );
		}
	},
	
	
	setCollisionTileset: function() {
		var path = wm.config.collisionTiles.path;
		var scale = this.tilesize / wm.config.collisionTiles.tilesize;
		this.tiles = new ig.AutoResizedImage( path, scale );
	},
	
	
	
	
	
	// -------------------------------------------------------------------------
	// UI
	
	setHotkey: function( hotkey ) {
		this.hotkey = hotkey;
		this.setName( this.name );
	},
	
	
	setName: function( name ) {
		this.name = name.replace(/[^0-9a-zA-Z]/g, '_');
		this.resetDiv();
	},
	
	
	resetDiv: function() {
		var visClass = this.visible ? ' checkedVis' : '';
		this.div.html(
			'<span class="visible'+visClass+'" title="Toggle Visibility (Shift+'+this.hotkey+')"></span>' +
			'<span class="name">' + this.name + '</span>' +
			'<span class="size"> (' + this.width + 'x' + this.height + ')</span>'
		);
		this.div.attr('title', 'Select Layer ('+this.hotkey+')' );
		this.div.children('.visible').bind('mousedown', this.toggleVisibilityClick.bind(this) );
	},
	
	
	setActive: function( active ) {
		this.active = active;
		if( active ) {
			this.div.addClass( 'layerActive' );
		} else {
			this.div.removeClass( 'layerActive' );
		}
	},
	
	
	toggleVisibility: function() {
		this.visible ^= 1;
		this.resetDiv();
		if( this.visible ) {
			this.div.children('.visible').addClass('checkedVis');
		} else {
			this.div.children('.visible').removeClass('checkedVis');
		}
		ig.game.draw();
	},
	
	
	toggleVisibilityClick: function( event ) {
		if( !this.active ) {
			this.ignoreLastClick = true;
		}
		this.toggleVisibility()
	},
	
	
	click: function() {
		if( this.ignoreLastClick ) {
			this.ignoreLastClick = false;
			return;
		}
		ig.editor.setActiveLayer( this.name );
	},
	
	
	destroy: function() {
		this.div.remove();
	},
	
	
	
	// -------------------------------------------------------------------------
	// Selecting
	
	beginSelecting: function( x, y ) {
		this.isSelecting = true;
		this.selectionBegin = {x:x, y:y};
	},
	
		
	endSelecting: function( x, y ) {
		var r = this.getSelectionRect( x, y);
		
		var brush = [];
		for( var ty = r.y; ty < r.y+r.h; ty++ ) {
			var row = [];
			for( var tx = r.x; tx < r.x+r.w; tx++ ) {
				if( tx < 0 || ty < 0 || tx >= this.width || ty >= this.height ) {
					row.push( 0 );
				}
				else {
					row.push( this.data[ty][tx] );
				}
			}
			brush.push( row );
		}
		this.isSelecting = false;
		this.selectionBegin = null;
		return brush;
	},
	
	
	getSelectionRect: function( x, y ) {
		var sx = this.selectionBegin ? this.selectionBegin.x : x,
			sy = this.selectionBegin ? this.selectionBegin.y : y;
			
		var
			txb = Math.floor( (sx + this.scroll.x) / this.tilesize ),
			tyb = Math.floor( (sy + this.scroll.y) / this.tilesize ),
			txe = Math.floor( (x + this.scroll.x) / this.tilesize ),
			tye = Math.floor( (y + this.scroll.y) / this.tilesize );
		
		return {
			x: Math.min( txb, txe ),
			y: Math.min( tyb, tye ),
			w: Math.abs( txb - txe) + 1,
			h: Math.abs( tyb - tye) + 1
		}
	},	
	
	
	

	// -------------------------------------------------------------------------
	// Drawing
	
	draw: function() {
		// For performance reasons, repeated background maps are not drawn
		// when zoomed out
		if( this.visible && !(wm.config.view.zoom < 1 && this.repeat) ) {
			this.drawTiled();
		}
		
		// Grid
		if( this.active && wm.config.view.grid ) {
			
			var x = -ig.system.getDrawPos(this.scroll.x % this.tilesize) - 0.5;
			var y = -ig.system.getDrawPos(this.scroll.y % this.tilesize) - 0.5;
			var step = this.tilesize * ig.system.scale;
			
			ig.system.context.beginPath();
			for( x; x < ig.system.realWidth; x += step ) {
				ig.system.context.moveTo( x, 0 );
				ig.system.context.lineTo( x, ig.system.realHeight );
			}
			for( y; y < ig.system.realHeight; y += step ) {
				ig.system.context.moveTo( 0, y );
				ig.system.context.lineTo( ig.system.realWidth, y );
			}
			ig.system.context.strokeStyle = wm.config.colors.secondary;
			ig.system.context.stroke();
			ig.system.context.closePath();
			
			// Not calling beginPath() again has some weird performance issues
			// in Firefox 5. closePath has no effect. So to make it happy:
			ig.system.context.beginPath(); 
		}
		
		// Bounds
		if( this.active ) {
			ig.system.context.lineWidth = 1;
			ig.system.context.strokeStyle = wm.config.colors.primary;
			ig.system.context.strokeRect( 
				-ig.system.getDrawPos(this.scroll.x) - 0.5, 
				-ig.system.getDrawPos(this.scroll.y) - 0.5, 
				this.width * this.tilesize * ig.system.scale + 1, 
				this.height * this.tilesize * ig.system.scale + 1
			);			
		}
	},
	
	getCursorOffset: function() {
		var w = this.brush[0].length;
		var h = this.brush.length;
		
		//return {x:0, y:0};
		return {
			x: (w/2-0.5).toInt() * this.tilesize,
			y: (h/2-0.5).toInt() * this.tilesize
		}
	},
	
	drawCursor: function( x, y ) {
		if( this.isSelecting ) {
			var r = this.getSelectionRect( x, y);
		
			ig.system.context.lineWidth = 1;
			ig.system.context.strokeStyle = wm.config.colors.selection;
			ig.system.context.strokeRect( 
				(r.x * this.tilesize - this.scroll.x) * ig.system.scale - 0.5, 
				(r.y * this.tilesize - this.scroll.y) * ig.system.scale - 0.5, 
				r.w * this.tilesize * ig.system.scale + 1, 
				r.h * this.tilesize * ig.system.scale + 1
			);
		}
		else {
			var w = this.brush[0].length;
			var h = this.brush.length;
			
			var co = this.getCursorOffset();
			
			var cx = Math.floor( (x+this.scroll.x) / this.tilesize ) * this.tilesize - this.scroll.x - co.x;
			var cy = Math.floor( (y+this.scroll.y) / this.tilesize ) * this.tilesize - this.scroll.y - co.y;
			
			ig.system.context.lineWidth = 1;
			ig.system.context.strokeStyle = wm.config.colors.primary;
			ig.system.context.strokeRect( 
				ig.system.getDrawPos(cx)-0.5, 
				ig.system.getDrawPos(cy)-0.5, 
				w * this.tilesize * ig.system.scale + 1, 
				h * this.tilesize * ig.system.scale + 1
			);
			
			ig.system.context.globalAlpha = 0.5;
			for( var ty = 0; ty < h; ty++ ) {
				for( var tx = 0; tx < w; tx++ ) {
					var t = this.brush[ty][tx];
					if( t ) {
						var px = cx + tx * this.tilesize;
						var py = cy + ty * this.tilesize;
						this.tiles.drawTile( px, py, t-1, this.tilesize );
					}
				}
			}
			ig.system.context.globalAlpha = 1;
		}
	}
});


ig.AutoResizedImage = ig.Image.extend({
	internalScale: 1,
	
	staticInstantiate: function() {
		return null; // Never cache!
	},
	
	init: function( path, internalScale ) {
		this.internalScale = internalScale;
		this.parent( path );
	},
	
	onload: function( event ) {
		this.width = Math.ceil(this.data.width * this.internalScale);
		this.height = Math.ceil(this.data.height * this.internalScale);
		
		if( this.internalScale != 1 ) {
			var scaled = ig.$new('canvas');
			scaled.width = this.width;
			scaled.height = this.height;
			var scaledCtx = scaled.getContext('2d');
			
			scaledCtx.drawImage( this.data, 0, 0, this.data.width, this.data.height, 0, 0, this.width , this.height );
			this.data = scaled;
		}
		
		this.loaded = true;
		if( ig.system.scale != 1 ) {
			this.resize( ig.system.scale );
		}
		
		if( this.loadCallback ) {
			this.loadCallback( this.path, true );
		}
	}
});


});
},{}],27:[function(require,module,exports){
ig.module(
	'weltmeister.entityLoader'
)
.requires(
	'weltmeister.config'
)
.defines(function(){ "use strict";

// Load the list of entity files via AJAX PHP glob
var path = wm.config.api.glob + '?',
    globs = typeof wm.config.project.entityFiles == 'string' ? 
        [wm.config.project.entityFiles] : 
        wm.config.project.entityFiles;
    
for (var i = 0; i < globs.length; i++) {
    path += 'glob[]=' + encodeURIComponent(globs[i]) + '&';
}

path += 'nocache=' + Math.random();
	
var req = $.ajax({
	url: path, 
	method: 'get',
	dataType: 'json',
	
	// MUST load synchronous, as the engine would otherwise determine that it
	// can't resolve dependencies to weltmeister.entities when there are
	// no more files to load and weltmeister.entities is still not defined
	// because the ajax request hasn't finished yet.
	// FIXME FFS!
	async: false, 
	success: function(files) {
		
		// File names to Module names
		var moduleNames = [];
		var modules = {};
		for( var i = 0; i < files.length; i++ ) {
			var name = files[i]
				.replace(new RegExp("^"+ig.lib+"|\\.js$", "g"), '')
				.replace(/\//g, '.');
			moduleNames.push( name );
			modules[name] = files[i];
		}
		
		// Define a Module that requires all entity Modules
		ig.module('weltmeister.entities')
			.requires.apply(ig, moduleNames)
			.defines(function(){ wm.entityModules = modules; });
	},
	error: function( xhr, status, error ){
		throw( 
			"Failed to load entity list via glob.php: " + error + "\n" +
			xhr.responseText
		);
	}
});

});
},{}],28:[function(require,module,exports){
ig.module(
	'weltmeister.evented-input'
)
.requires(
	'impact.input'
)
.defines(function(){ "use strict";

wm.EventedInput = ig.Input.extend({
	mousemoveCallback: null,
	keyupCallback: null,
	keydownCallback: null,
	
	delayedKeyup: {push:function(){},length: 0},
	
	
	keydown: function( event ) {
		var tag = event.target.tagName;
		if( tag == 'INPUT' || tag == 'TEXTAREA' ) { return; }
		
		var code = event.type == 'keydown' 
			? event.keyCode 
			: (event.button == 2 ? ig.KEY.MOUSE2 : ig.KEY.MOUSE1);
		var action = this.bindings[code];
		if( action ) {
			if( !this.actions[action] ) {
				this.actions[action] = true;
				if( this.keydownCallback ) {
					this.keydownCallback( action );
				}
			}
			event.stopPropagation();
			event.preventDefault();
		}
	},
	
	
	keyup: function( event ) {
		var tag = event.target.tagName;
		if( tag == 'INPUT' || tag == 'TEXTAREA' ) { return; }
		
		var code = event.type == 'keyup' 
			? event.keyCode 
			: (event.button == 2 ? ig.KEY.MOUSE2 : ig.KEY.MOUSE1);
		var action = this.bindings[code];
		if( action ) {
			this.actions[action] = false;
			if( this.keyupCallback ) {
				this.keyupCallback( action );
			}
			event.stopPropagation();
			event.preventDefault();
		}
	},
	
	
	mousewheel: function( event ) {
		var delta = event.wheelDelta ? event.wheelDelta : (event.detail * -1);
		var code = delta > 0 ? ig.KEY.MWHEEL_UP : ig.KEY.MWHEEL_DOWN;
		var action = this.bindings[code];
		if( action ) {
			if( this.keyupCallback ) {
				this.keyupCallback( action );
			}
			event.stopPropagation();
			event.preventDefault();
		}
	},
	
	
	mousemove: function( event ) {
		this.parent( event );
		if( this.mousemoveCallback ) {
			this.mousemoveCallback();
		}
	}
});

});
},{}],29:[function(require,module,exports){
/*! jQuery v1.7.1 jquery.com | jquery.org/license */
(function(a,b){function cy(a){return f.isWindow(a)?a:a.nodeType===9?a.defaultView||a.parentWindow:!1}function cv(a){if(!ck[a]){var b=c.body,d=f("<"+a+">").appendTo(b),e=d.css("display");d.remove();if(e==="none"||e===""){cl||(cl=c.createElement("iframe"),cl.frameBorder=cl.width=cl.height=0),b.appendChild(cl);if(!cm||!cl.createElement)cm=(cl.contentWindow||cl.contentDocument).document,cm.write((c.compatMode==="CSS1Compat"?"<!doctype html>":"")+"<html><body>"),cm.close();d=cm.createElement(a),cm.body.appendChild(d),e=f.css(d,"display"),b.removeChild(cl)}ck[a]=e}return ck[a]}function cu(a,b){var c={};f.each(cq.concat.apply([],cq.slice(0,b)),function(){c[this]=a});return c}function ct(){cr=b}function cs(){setTimeout(ct,0);return cr=f.now()}function cj(){try{return new a.ActiveXObject("Microsoft.XMLHTTP")}catch(b){}}function ci(){try{return new a.XMLHttpRequest}catch(b){}}function cc(a,c){a.dataFilter&&(c=a.dataFilter(c,a.dataType));var d=a.dataTypes,e={},g,h,i=d.length,j,k=d[0],l,m,n,o,p;for(g=1;g<i;g++){if(g===1)for(h in a.converters)typeof h=="string"&&(e[h.toLowerCase()]=a.converters[h]);l=k,k=d[g];if(k==="*")k=l;else if(l!=="*"&&l!==k){m=l+" "+k,n=e[m]||e["* "+k];if(!n){p=b;for(o in e){j=o.split(" ");if(j[0]===l||j[0]==="*"){p=e[j[1]+" "+k];if(p){o=e[o],o===!0?n=p:p===!0&&(n=o);break}}}}!n&&!p&&f.error("No conversion from "+m.replace(" "," to ")),n!==!0&&(c=n?n(c):p(o(c)))}}return c}function cb(a,c,d){var e=a.contents,f=a.dataTypes,g=a.responseFields,h,i,j,k;for(i in g)i in d&&(c[g[i]]=d[i]);while(f[0]==="*")f.shift(),h===b&&(h=a.mimeType||c.getResponseHeader("content-type"));if(h)for(i in e)if(e[i]&&e[i].test(h)){f.unshift(i);break}if(f[0]in d)j=f[0];else{for(i in d){if(!f[0]||a.converters[i+" "+f[0]]){j=i;break}k||(k=i)}j=j||k}if(j){j!==f[0]&&f.unshift(j);return d[j]}}function ca(a,b,c,d){if(f.isArray(b))f.each(b,function(b,e){c||bE.test(a)?d(a,e):ca(a+"["+(typeof e=="object"||f.isArray(e)?b:"")+"]",e,c,d)});else if(!c&&b!=null&&typeof b=="object")for(var e in b)ca(a+"["+e+"]",b[e],c,d);else d(a,b)}function b_(a,c){var d,e,g=f.ajaxSettings.flatOptions||{};for(d in c)c[d]!==b&&((g[d]?a:e||(e={}))[d]=c[d]);e&&f.extend(!0,a,e)}function b$(a,c,d,e,f,g){f=f||c.dataTypes[0],g=g||{},g[f]=!0;var h=a[f],i=0,j=h?h.length:0,k=a===bT,l;for(;i<j&&(k||!l);i++)l=h[i](c,d,e),typeof l=="string"&&(!k||g[l]?l=b:(c.dataTypes.unshift(l),l=b$(a,c,d,e,l,g)));(k||!l)&&!g["*"]&&(l=b$(a,c,d,e,"*",g));return l}function bZ(a){return function(b,c){typeof b!="string"&&(c=b,b="*");if(f.isFunction(c)){var d=b.toLowerCase().split(bP),e=0,g=d.length,h,i,j;for(;e<g;e++)h=d[e],j=/^\+/.test(h),j&&(h=h.substr(1)||"*"),i=a[h]=a[h]||[],i[j?"unshift":"push"](c)}}}function bC(a,b,c){var d=b==="width"?a.offsetWidth:a.offsetHeight,e=b==="width"?bx:by,g=0,h=e.length;if(d>0){if(c!=="border")for(;g<h;g++)c||(d-=parseFloat(f.css(a,"padding"+e[g]))||0),c==="margin"?d+=parseFloat(f.css(a,c+e[g]))||0:d-=parseFloat(f.css(a,"border"+e[g]+"Width"))||0;return d+"px"}d=bz(a,b,b);if(d<0||d==null)d=a.style[b]||0;d=parseFloat(d)||0;if(c)for(;g<h;g++)d+=parseFloat(f.css(a,"padding"+e[g]))||0,c!=="padding"&&(d+=parseFloat(f.css(a,"border"+e[g]+"Width"))||0),c==="margin"&&(d+=parseFloat(f.css(a,c+e[g]))||0);return d+"px"}function bp(a,b){b.src?f.ajax({url:b.src,async:!1,dataType:"script"}):f.globalEval((b.text||b.textContent||b.innerHTML||"").replace(bf,"/*$0*/")),b.parentNode&&b.parentNode.removeChild(b)}function bo(a){var b=c.createElement("div");bh.appendChild(b),b.innerHTML=a.outerHTML;return b.firstChild}function bn(a){var b=(a.nodeName||"").toLowerCase();b==="input"?bm(a):b!=="script"&&typeof a.getElementsByTagName!="undefined"&&f.grep(a.getElementsByTagName("input"),bm)}function bm(a){if(a.type==="checkbox"||a.type==="radio")a.defaultChecked=a.checked}function bl(a){return typeof a.getElementsByTagName!="undefined"?a.getElementsByTagName("*"):typeof a.querySelectorAll!="undefined"?a.querySelectorAll("*"):[]}function bk(a,b){var c;if(b.nodeType===1){b.clearAttributes&&b.clearAttributes(),b.mergeAttributes&&b.mergeAttributes(a),c=b.nodeName.toLowerCase();if(c==="object")b.outerHTML=a.outerHTML;else if(c!=="input"||a.type!=="checkbox"&&a.type!=="radio"){if(c==="option")b.selected=a.defaultSelected;else if(c==="input"||c==="textarea")b.defaultValue=a.defaultValue}else a.checked&&(b.defaultChecked=b.checked=a.checked),b.value!==a.value&&(b.value=a.value);b.removeAttribute(f.expando)}}function bj(a,b){if(b.nodeType===1&&!!f.hasData(a)){var c,d,e,g=f._data(a),h=f._data(b,g),i=g.events;if(i){delete h.handle,h.events={};for(c in i)for(d=0,e=i[c].length;d<e;d++)f.event.add(b,c+(i[c][d].namespace?".":"")+i[c][d].namespace,i[c][d],i[c][d].data)}h.data&&(h.data=f.extend({},h.data))}}function bi(a,b){return f.nodeName(a,"table")?a.getElementsByTagName("tbody")[0]||a.appendChild(a.ownerDocument.createElement("tbody")):a}function U(a){var b=V.split("|"),c=a.createDocumentFragment();if(c.createElement)while(b.length)c.createElement(b.pop());return c}function T(a,b,c){b=b||0;if(f.isFunction(b))return f.grep(a,function(a,d){var e=!!b.call(a,d,a);return e===c});if(b.nodeType)return f.grep(a,function(a,d){return a===b===c});if(typeof b=="string"){var d=f.grep(a,function(a){return a.nodeType===1});if(O.test(b))return f.filter(b,d,!c);b=f.filter(b,d)}return f.grep(a,function(a,d){return f.inArray(a,b)>=0===c})}function S(a){return!a||!a.parentNode||a.parentNode.nodeType===11}function K(){return!0}function J(){return!1}function n(a,b,c){var d=b+"defer",e=b+"queue",g=b+"mark",h=f._data(a,d);h&&(c==="queue"||!f._data(a,e))&&(c==="mark"||!f._data(a,g))&&setTimeout(function(){!f._data(a,e)&&!f._data(a,g)&&(f.removeData(a,d,!0),h.fire())},0)}function m(a){for(var b in a){if(b==="data"&&f.isEmptyObject(a[b]))continue;if(b!=="toJSON")return!1}return!0}function l(a,c,d){if(d===b&&a.nodeType===1){var e="data-"+c.replace(k,"-$1").toLowerCase();d=a.getAttribute(e);if(typeof d=="string"){try{d=d==="true"?!0:d==="false"?!1:d==="null"?null:f.isNumeric(d)?parseFloat(d):j.test(d)?f.parseJSON(d):d}catch(g){}f.data(a,c,d)}else d=b}return d}function h(a){var b=g[a]={},c,d;a=a.split(/\s+/);for(c=0,d=a.length;c<d;c++)b[a[c]]=!0;return b}var c=a.document,d=a.navigator,e=a.location,f=function(){function J(){if(!e.isReady){try{c.documentElement.doScroll("left")}catch(a){setTimeout(J,1);return}e.ready()}}var e=function(a,b){return new e.fn.init(a,b,h)},f=a.jQuery,g=a.$,h,i=/^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,j=/\S/,k=/^\s+/,l=/\s+$/,m=/^<(\w+)\s*\/?>(?:<\/\1>)?$/,n=/^[\],:{}\s]*$/,o=/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,p=/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,q=/(?:^|:|,)(?:\s*\[)+/g,r=/(webkit)[ \/]([\w.]+)/,s=/(opera)(?:.*version)?[ \/]([\w.]+)/,t=/(msie) ([\w.]+)/,u=/(mozilla)(?:.*? rv:([\w.]+))?/,v=/-([a-z]|[0-9])/ig,w=/^-ms-/,x=function(a,b){return(b+"").toUpperCase()},y=d.userAgent,z,A,B,C=Object.prototype.toString,D=Object.prototype.hasOwnProperty,E=Array.prototype.push,F=Array.prototype.slice,G=String.prototype.trim,H=Array.prototype.indexOf,I={};e.fn=e.prototype={constructor:e,init:function(a,d,f){var g,h,j,k;if(!a)return this;if(a.nodeType){this.context=this[0]=a,this.length=1;return this}if(a==="body"&&!d&&c.body){this.context=c,this[0]=c.body,this.selector=a,this.length=1;return this}if(typeof a=="string"){a.charAt(0)!=="<"||a.charAt(a.length-1)!==">"||a.length<3?g=i.exec(a):g=[null,a,null];if(g&&(g[1]||!d)){if(g[1]){d=d instanceof e?d[0]:d,k=d?d.ownerDocument||d:c,j=m.exec(a),j?e.isPlainObject(d)?(a=[c.createElement(j[1])],e.fn.attr.call(a,d,!0)):a=[k.createElement(j[1])]:(j=e.buildFragment([g[1]],[k]),a=(j.cacheable?e.clone(j.fragment):j.fragment).childNodes);return e.merge(this,a)}h=c.getElementById(g[2]);if(h&&h.parentNode){if(h.id!==g[2])return f.find(a);this.length=1,this[0]=h}this.context=c,this.selector=a;return this}return!d||d.jquery?(d||f).find(a):this.constructor(d).find(a)}if(e.isFunction(a))return f.ready(a);a.selector!==b&&(this.selector=a.selector,this.context=a.context);return e.makeArray(a,this)},selector:"",jquery:"1.7.1",length:0,size:function(){return this.length},toArray:function(){return F.call(this,0)},get:function(a){return a==null?this.toArray():a<0?this[this.length+a]:this[a]},pushStack:function(a,b,c){var d=this.constructor();e.isArray(a)?E.apply(d,a):e.merge(d,a),d.prevObject=this,d.context=this.context,b==="find"?d.selector=this.selector+(this.selector?" ":"")+c:b&&(d.selector=this.selector+"."+b+"("+c+")");return d},each:function(a,b){return e.each(this,a,b)},ready:function(a){e.bindReady(),A.add(a);return this},eq:function(a){a=+a;return a===-1?this.slice(a):this.slice(a,a+1)},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},slice:function(){return this.pushStack(F.apply(this,arguments),"slice",F.call(arguments).join(","))},map:function(a){return this.pushStack(e.map(this,function(b,c){return a.call(b,c,b)}))},end:function(){return this.prevObject||this.constructor(null)},push:E,sort:[].sort,splice:[].splice},e.fn.init.prototype=e.fn,e.extend=e.fn.extend=function(){var a,c,d,f,g,h,i=arguments[0]||{},j=1,k=arguments.length,l=!1;typeof i=="boolean"&&(l=i,i=arguments[1]||{},j=2),typeof i!="object"&&!e.isFunction(i)&&(i={}),k===j&&(i=this,--j);for(;j<k;j++)if((a=arguments[j])!=null)for(c in a){d=i[c],f=a[c];if(i===f)continue;l&&f&&(e.isPlainObject(f)||(g=e.isArray(f)))?(g?(g=!1,h=d&&e.isArray(d)?d:[]):h=d&&e.isPlainObject(d)?d:{},i[c]=e.extend(l,h,f)):f!==b&&(i[c]=f)}return i},e.extend({noConflict:function(b){a.$===e&&(a.$=g),b&&a.jQuery===e&&(a.jQuery=f);return e},isReady:!1,readyWait:1,holdReady:function(a){a?e.readyWait++:e.ready(!0)},ready:function(a){if(a===!0&&!--e.readyWait||a!==!0&&!e.isReady){if(!c.body)return setTimeout(e.ready,1);e.isReady=!0;if(a!==!0&&--e.readyWait>0)return;A.fireWith(c,[e]),e.fn.trigger&&e(c).trigger("ready").off("ready")}},bindReady:function(){if(!A){A=e.Callbacks("once memory");if(c.readyState==="complete")return setTimeout(e.ready,1);if(c.addEventListener)c.addEventListener("DOMContentLoaded",B,!1),a.addEventListener("load",e.ready,!1);else if(c.attachEvent){c.attachEvent("onreadystatechange",B),a.attachEvent("onload",e.ready);var b=!1;try{b=a.frameElement==null}catch(d){}c.documentElement.doScroll&&b&&J()}}},isFunction:function(a){return e.type(a)==="function"},isArray:Array.isArray||function(a){return e.type(a)==="array"},isWindow:function(a){return a&&typeof a=="object"&&"setInterval"in a},isNumeric:function(a){return!isNaN(parseFloat(a))&&isFinite(a)},type:function(a){return a==null?String(a):I[C.call(a)]||"object"},isPlainObject:function(a){if(!a||e.type(a)!=="object"||a.nodeType||e.isWindow(a))return!1;try{if(a.constructor&&!D.call(a,"constructor")&&!D.call(a.constructor.prototype,"isPrototypeOf"))return!1}catch(c){return!1}var d;for(d in a);return d===b||D.call(a,d)},isEmptyObject:function(a){for(var b in a)return!1;return!0},error:function(a){throw new Error(a)},parseJSON:function(b){if(typeof b!="string"||!b)return null;b=e.trim(b);if(a.JSON&&a.JSON.parse)return a.JSON.parse(b);if(n.test(b.replace(o,"@").replace(p,"]").replace(q,"")))return(new Function("return "+b))();e.error("Invalid JSON: "+b)},parseXML:function(c){var d,f;try{a.DOMParser?(f=new DOMParser,d=f.parseFromString(c,"text/xml")):(d=new ActiveXObject("Microsoft.XMLDOM"),d.async="false",d.loadXML(c))}catch(g){d=b}(!d||!d.documentElement||d.getElementsByTagName("parsererror").length)&&e.error("Invalid XML: "+c);return d},noop:function(){},globalEval:function(b){b&&j.test(b)&&(a.execScript||function(b){a.eval.call(a,b)})(b)},camelCase:function(a){return a.replace(w,"ms-").replace(v,x)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toUpperCase()===b.toUpperCase()},each:function(a,c,d){var f,g=0,h=a.length,i=h===b||e.isFunction(a);if(d){if(i){for(f in a)if(c.apply(a[f],d)===!1)break}else for(;g<h;)if(c.apply(a[g++],d)===!1)break}else if(i){for(f in a)if(c.call(a[f],f,a[f])===!1)break}else for(;g<h;)if(c.call(a[g],g,a[g++])===!1)break;return a},trim:G?function(a){return a==null?"":G.call(a)}:function(a){return a==null?"":(a+"").replace(k,"").replace(l,"")},makeArray:function(a,b){var c=b||[];if(a!=null){var d=e.type(a);a.length==null||d==="string"||d==="function"||d==="regexp"||e.isWindow(a)?E.call(c,a):e.merge(c,a)}return c},inArray:function(a,b,c){var d;if(b){if(H)return H.call(b,a,c);d=b.length,c=c?c<0?Math.max(0,d+c):c:0;for(;c<d;c++)if(c in b&&b[c]===a)return c}return-1},merge:function(a,c){var d=a.length,e=0;if(typeof c.length=="number")for(var f=c.length;e<f;e++)a[d++]=c[e];else while(c[e]!==b)a[d++]=c[e++];a.length=d;return a},grep:function(a,b,c){var d=[],e;c=!!c;for(var f=0,g=a.length;f<g;f++)e=!!b(a[f],f),c!==e&&d.push(a[f]);return d},map:function(a,c,d){var f,g,h=[],i=0,j=a.length,k=a instanceof e||j!==b&&typeof j=="number"&&(j>0&&a[0]&&a[j-1]||j===0||e.isArray(a));if(k)for(;i<j;i++)f=c(a[i],i,d),f!=null&&(h[h.length]=f);else for(g in a)f=c(a[g],g,d),f!=null&&(h[h.length]=f);return h.concat.apply([],h)},guid:1,proxy:function(a,c){if(typeof c=="string"){var d=a[c];c=a,a=d}if(!e.isFunction(a))return b;var f=F.call(arguments,2),g=function(){return a.apply(c,f.concat(F.call(arguments)))};g.guid=a.guid=a.guid||g.guid||e.guid++;return g},access:function(a,c,d,f,g,h){var i=a.length;if(typeof c=="object"){for(var j in c)e.access(a,j,c[j],f,g,d);return a}if(d!==b){f=!h&&f&&e.isFunction(d);for(var k=0;k<i;k++)g(a[k],c,f?d.call(a[k],k,g(a[k],c)):d,h);return a}return i?g(a[0],c):b},now:function(){return(new Date).getTime()},uaMatch:function(a){a=a.toLowerCase();var b=r.exec(a)||s.exec(a)||t.exec(a)||a.indexOf("compatible")<0&&u.exec(a)||[];return{browser:b[1]||"",version:b[2]||"0"}},sub:function(){function a(b,c){return new a.fn.init(b,c)}e.extend(!0,a,this),a.superclass=this,a.fn=a.prototype=this(),a.fn.constructor=a,a.sub=this.sub,a.fn.init=function(d,f){f&&f instanceof e&&!(f instanceof a)&&(f=a(f));return e.fn.init.call(this,d,f,b)},a.fn.init.prototype=a.fn;var b=a(c);return a},browser:{}}),e.each("Boolean Number String Function Array Date RegExp Object".split(" "),function(a,b){I["[object "+b+"]"]=b.toLowerCase()}),z=e.uaMatch(y),z.browser&&(e.browser[z.browser]=!0,e.browser.version=z.version),e.browser.webkit&&(e.browser.safari=!0),j.test(" ")&&(k=/^[\s\xA0]+/,l=/[\s\xA0]+$/),h=e(c),c.addEventListener?B=function(){c.removeEventListener("DOMContentLoaded",B,!1),e.ready()}:c.attachEvent&&(B=function(){c.readyState==="complete"&&(c.detachEvent("onreadystatechange",B),e.ready())});return e}(),g={};f.Callbacks=function(a){a=a?g[a]||h(a):{};var c=[],d=[],e,i,j,k,l,m=function(b){var d,e,g,h,i;for(d=0,e=b.length;d<e;d++)g=b[d],h=f.type(g),h==="array"?m(g):h==="function"&&(!a.unique||!o.has(g))&&c.push(g)},n=function(b,f){f=f||[],e=!a.memory||[b,f],i=!0,l=j||0,j=0,k=c.length;for(;c&&l<k;l++)if(c[l].apply(b,f)===!1&&a.stopOnFalse){e=!0;break}i=!1,c&&(a.once?e===!0?o.disable():c=[]:d&&d.length&&(e=d.shift(),o.fireWith(e[0],e[1])))},o={add:function(){if(c){var a=c.length;m(arguments),i?k=c.length:e&&e!==!0&&(j=a,n(e[0],e[1]))}return this},remove:function(){if(c){var b=arguments,d=0,e=b.length;for(;d<e;d++)for(var f=0;f<c.length;f++)if(b[d]===c[f]){i&&f<=k&&(k--,f<=l&&l--),c.splice(f--,1);if(a.unique)break}}return this},has:function(a){if(c){var b=0,d=c.length;for(;b<d;b++)if(a===c[b])return!0}return!1},empty:function(){c=[];return this},disable:function(){c=d=e=b;return this},disabled:function(){return!c},lock:function(){d=b,(!e||e===!0)&&o.disable();return this},locked:function(){return!d},fireWith:function(b,c){d&&(i?a.once||d.push([b,c]):(!a.once||!e)&&n(b,c));return this},fire:function(){o.fireWith(this,arguments);return this},fired:function(){return!!e}};return o};var i=[].slice;f.extend({Deferred:function(a){var b=f.Callbacks("once memory"),c=f.Callbacks("once memory"),d=f.Callbacks("memory"),e="pending",g={resolve:b,reject:c,notify:d},h={done:b.add,fail:c.add,progress:d.add,state:function(){return e},isResolved:b.fired,isRejected:c.fired,then:function(a,b,c){i.done(a).fail(b).progress(c);return this},always:function(){i.done.apply(i,arguments).fail.apply(i,arguments);return this},pipe:function(a,b,c){return f.Deferred(function(d){f.each({done:[a,"resolve"],fail:[b,"reject"],progress:[c,"notify"]},function(a,b){var c=b[0],e=b[1],g;f.isFunction(c)?i[a](function(){g=c.apply(this,arguments),g&&f.isFunction(g.promise)?g.promise().then(d.resolve,d.reject,d.notify):d[e+"With"](this===i?d:this,[g])}):i[a](d[e])})}).promise()},promise:function(a){if(a==null)a=h;else for(var b in h)a[b]=h[b];return a}},i=h.promise({}),j;for(j in g)i[j]=g[j].fire,i[j+"With"]=g[j].fireWith;i.done(function(){e="resolved"},c.disable,d.lock).fail(function(){e="rejected"},b.disable,d.lock),a&&a.call(i,i);return i},when:function(a){function m(a){return function(b){e[a]=arguments.length>1?i.call(arguments,0):b,j.notifyWith(k,e)}}function l(a){return function(c){b[a]=arguments.length>1?i.call(arguments,0):c,--g||j.resolveWith(j,b)}}var b=i.call(arguments,0),c=0,d=b.length,e=Array(d),g=d,h=d,j=d<=1&&a&&f.isFunction(a.promise)?a:f.Deferred(),k=j.promise();if(d>1){for(;c<d;c++)b[c]&&b[c].promise&&f.isFunction(b[c].promise)?b[c].promise().then(l(c),j.reject,m(c)):--g;g||j.resolveWith(j,b)}else j!==a&&j.resolveWith(j,d?[a]:[]);return k}}),f.support=function(){var b,d,e,g,h,i,j,k,l,m,n,o,p,q=c.createElement("div"),r=c.documentElement;q.setAttribute("className","t"),q.innerHTML="   <link/><table></table><a href='/a' style='top:1px;float:left;opacity:.55;'>a</a><input type='checkbox'/>",d=q.getElementsByTagName("*"),e=q.getElementsByTagName("a")[0];if(!d||!d.length||!e)return{};g=c.createElement("select"),h=g.appendChild(c.createElement("option")),i=q.getElementsByTagName("input")[0],b={leadingWhitespace:q.firstChild.nodeType===3,tbody:!q.getElementsByTagName("tbody").length,htmlSerialize:!!q.getElementsByTagName("link").length,style:/top/.test(e.getAttribute("style")),hrefNormalized:e.getAttribute("href")==="/a",opacity:/^0.55/.test(e.style.opacity),cssFloat:!!e.style.cssFloat,checkOn:i.value==="on",optSelected:h.selected,getSetAttribute:q.className!=="t",enctype:!!c.createElement("form").enctype,html5Clone:c.createElement("nav").cloneNode(!0).outerHTML!=="<:nav></:nav>",submitBubbles:!0,changeBubbles:!0,focusinBubbles:!1,deleteExpando:!0,noCloneEvent:!0,inlineBlockNeedsLayout:!1,shrinkWrapBlocks:!1,reliableMarginRight:!0},i.checked=!0,b.noCloneChecked=i.cloneNode(!0).checked,g.disabled=!0,b.optDisabled=!h.disabled;try{delete q.test}catch(s){b.deleteExpando=!1}!q.addEventListener&&q.attachEvent&&q.fireEvent&&(q.attachEvent("onclick",function(){b.noCloneEvent=!1}),q.cloneNode(!0).fireEvent("onclick")),i=c.createElement("input"),i.value="t",i.setAttribute("type","radio"),b.radioValue=i.value==="t",i.setAttribute("checked","checked"),q.appendChild(i),k=c.createDocumentFragment(),k.appendChild(q.lastChild),b.checkClone=k.cloneNode(!0).cloneNode(!0).lastChild.checked,b.appendChecked=i.checked,k.removeChild(i),k.appendChild(q),q.innerHTML="",a.getComputedStyle&&(j=c.createElement("div"),j.style.width="0",j.style.marginRight="0",q.style.width="2px",q.appendChild(j),b.reliableMarginRight=(parseInt((a.getComputedStyle(j,null)||{marginRight:0}).marginRight,10)||0)===0);if(q.attachEvent)for(o in{submit:1,change:1,focusin:1})n="on"+o,p=n in q,p||(q.setAttribute(n,"return;"),p=typeof q[n]=="function"),b[o+"Bubbles"]=p;k.removeChild(q),k=g=h=j=q=i=null,f(function(){var a,d,e,g,h,i,j,k,m,n,o,r=c.getElementsByTagName("body")[0];!r||(j=1,k="position:absolute;top:0;left:0;width:1px;height:1px;margin:0;",m="visibility:hidden;border:0;",n="style='"+k+"border:5px solid #000;padding:0;'",o="<div "+n+"><div></div></div>"+"<table "+n+" cellpadding='0' cellspacing='0'>"+"<tr><td></td></tr></table>",a=c.createElement("div"),a.style.cssText=m+"width:0;height:0;position:static;top:0;margin-top:"+j+"px",r.insertBefore(a,r.firstChild),q=c.createElement("div"),a.appendChild(q),q.innerHTML="<table><tr><td style='padding:0;border:0;display:none'></td><td>t</td></tr></table>",l=q.getElementsByTagName("td"),p=l[0].offsetHeight===0,l[0].style.display="",l[1].style.display="none",b.reliableHiddenOffsets=p&&l[0].offsetHeight===0,q.innerHTML="",q.style.width=q.style.paddingLeft="1px",f.boxModel=b.boxModel=q.offsetWidth===2,typeof q.style.zoom!="undefined"&&(q.style.display="inline",q.style.zoom=1,b.inlineBlockNeedsLayout=q.offsetWidth===2,q.style.display="",q.innerHTML="<div style='width:4px;'></div>",b.shrinkWrapBlocks=q.offsetWidth!==2),q.style.cssText=k+m,q.innerHTML=o,d=q.firstChild,e=d.firstChild,h=d.nextSibling.firstChild.firstChild,i={doesNotAddBorder:e.offsetTop!==5,doesAddBorderForTableAndCells:h.offsetTop===5},e.style.position="fixed",e.style.top="20px",i.fixedPosition=e.offsetTop===20||e.offsetTop===15,e.style.position=e.style.top="",d.style.overflow="hidden",d.style.position="relative",i.subtractsBorderForOverflowNotVisible=e.offsetTop===-5,i.doesNotIncludeMarginInBodyOffset=r.offsetTop!==j,r.removeChild(a),q=a=null,f.extend(b,i))});return b}();var j=/^(?:\{.*\}|\[.*\])$/,k=/([A-Z])/g;f.extend({cache:{},uuid:0,expando:"jQuery"+(f.fn.jquery+Math.random()).replace(/\D/g,""),noData:{embed:!0,object:"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",applet:!0},hasData:function(a){a=a.nodeType?f.cache[a[f.expando]]:a[f.expando];return!!a&&!m(a)},data:function(a,c,d,e){if(!!f.acceptData(a)){var g,h,i,j=f.expando,k=typeof c=="string",l=a.nodeType,m=l?f.cache:a,n=l?a[j]:a[j]&&j,o=c==="events";if((!n||!m[n]||!o&&!e&&!m[n].data)&&k&&d===b)return;n||(l?a[j]=n=++f.uuid:n=j),m[n]||(m[n]={},l||(m[n].toJSON=f.noop));if(typeof c=="object"||typeof c=="function")e?m[n]=f.extend(m[n],c):m[n].data=f.extend(m[n].data,c);g=h=m[n],e||(h.data||(h.data={}),h=h.data),d!==b&&(h[f.camelCase(c)]=d);if(o&&!h[c])return g.events;k?(i=h[c],i==null&&(i=h[f.camelCase(c)])):i=h;return i}},removeData:function(a,b,c){if(!!f.acceptData(a)){var d,e,g,h=f.expando,i=a.nodeType,j=i?f.cache:a,k=i?a[h]:h;if(!j[k])return;if(b){d=c?j[k]:j[k].data;if(d){f.isArray(b)||(b in d?b=[b]:(b=f.camelCase(b),b in d?b=[b]:b=b.split(" ")));for(e=0,g=b.length;e<g;e++)delete d[b[e]];if(!(c?m:f.isEmptyObject)(d))return}}if(!c){delete j[k].data;if(!m(j[k]))return}f.support.deleteExpando||!j.setInterval?delete j[k]:j[k]=null,i&&(f.support.deleteExpando?delete a[h]:a.removeAttribute?a.removeAttribute(h):a[h]=null)}},_data:function(a,b,c){return f.data(a,b,c,!0)},acceptData:function(a){if(a.nodeName){var b=f.noData[a.nodeName.toLowerCase()];if(b)return b!==!0&&a.getAttribute("classid")===b}return!0}}),f.fn.extend({data:function(a,c){var d,e,g,h=null;if(typeof a=="undefined"){if(this.length){h=f.data(this[0]);if(this[0].nodeType===1&&!f._data(this[0],"parsedAttrs")){e=this[0].attributes;for(var i=0,j=e.length;i<j;i++)g=e[i].name,g.indexOf("data-")===0&&(g=f.camelCase(g.substring(5)),l(this[0],g,h[g]));f._data(this[0],"parsedAttrs",!0)}}return h}if(typeof a=="object")return this.each(function(){f.data(this,a)});d=a.split("."),d[1]=d[1]?"."+d[1]:"";if(c===b){h=this.triggerHandler("getData"+d[1]+"!",[d[0]]),h===b&&this.length&&(h=f.data(this[0],a),h=l(this[0],a,h));return h===b&&d[1]?this.data(d[0]):h}return this.each(function(){var b=f(this),e=[d[0],c];b.triggerHandler("setData"+d[1]+"!",e),f.data(this,a,c),b.triggerHandler("changeData"+d[1]+"!",e)})},removeData:function(a){return this.each(function(){f.removeData(this,a)})}}),f.extend({_mark:function(a,b){a&&(b=(b||"fx")+"mark",f._data(a,b,(f._data(a,b)||0)+1))},_unmark:function(a,b,c){a!==!0&&(c=b,b=a,a=!1);if(b){c=c||"fx";var d=c+"mark",e=a?0:(f._data(b,d)||1)-1;e?f._data(b,d,e):(f.removeData(b,d,!0),n(b,c,"mark"))}},queue:function(a,b,c){var d;if(a){b=(b||"fx")+"queue",d=f._data(a,b),c&&(!d||f.isArray(c)?d=f._data(a,b,f.makeArray(c)):d.push(c));return d||[]}},dequeue:function(a,b){b=b||"fx";var c=f.queue(a,b),d=c.shift(),e={};d==="inprogress"&&(d=c.shift()),d&&(b==="fx"&&c.unshift("inprogress"),f._data(a,b+".run",e),d.call(a,function(){f.dequeue(a,b)},e)),c.length||(f.removeData(a,b+"queue "+b+".run",!0),n(a,b,"queue"))}}),f.fn.extend({queue:function(a,c){typeof a!="string"&&(c=a,a="fx");if(c===b)return f.queue(this[0],a);return this.each(function(){var b=f.queue(this,a,c);a==="fx"&&b[0]!=="inprogress"&&f.dequeue(this,a)})},dequeue:function(a){return this.each(function(){f.dequeue(this,a)})},delay:function(a,b){a=f.fx?f.fx.speeds[a]||a:a,b=b||"fx";return this.queue(b,function(b,c){var d=setTimeout(b,a);c.stop=function(){clearTimeout(d)}})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,c){function m(){--h||d.resolveWith(e,[e])}typeof a!="string"&&(c=a,a=b),a=a||"fx";var d=f.Deferred(),e=this,g=e.length,h=1,i=a+"defer",j=a+"queue",k=a+"mark",l;while(g--)if(l=f.data(e[g],i,b,!0)||(f.data(e[g],j,b,!0)||f.data(e[g],k,b,!0))&&f.data(e[g],i,f.Callbacks("once memory"),!0))h++,l.add(m);m();return d.promise()}});var o=/[\n\t\r]/g,p=/\s+/,q=/\r/g,r=/^(?:button|input)$/i,s=/^(?:button|input|object|select|textarea)$/i,t=/^a(?:rea)?$/i,u=/^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,v=f.support.getSetAttribute,w,x,y;f.fn.extend({attr:function(a,b){return f.access(this,a,b,!0,f.attr)},removeAttr:function(a){return this.each(function(){f.removeAttr(this,a)})},prop:function(a,b){return f.access(this,a,b,!0,f.prop)},removeProp:function(a){a=f.propFix[a]||a;return this.each(function(){try{this[a]=b,delete this[a]}catch(c){}})},addClass:function(a){var b,c,d,e,g,h,i;if(f.isFunction(a))return this.each(function(b){f(this).addClass(a.call(this,b,this.className))});if(a&&typeof a=="string"){b=a.split(p);for(c=0,d=this.length;c<d;c++){e=this[c];if(e.nodeType===1)if(!e.className&&b.length===1)e.className=a;else{g=" "+e.className+" ";for(h=0,i=b.length;h<i;h++)~g.indexOf(" "+b[h]+" ")||(g+=b[h]+" ");e.className=f.trim(g)}}}return this},removeClass:function(a){var c,d,e,g,h,i,j;if(f.isFunction(a))return this.each(function(b){f(this).removeClass(a.call(this,b,this.className))});if(a&&typeof a=="string"||a===b){c=(a||"").split(p);for(d=0,e=this.length;d<e;d++){g=this[d];if(g.nodeType===1&&g.className)if(a){h=(" "+g.className+" ").replace(o," ");for(i=0,j=c.length;i<j;i++)h=h.replace(" "+c[i]+" "," ");g.className=f.trim(h)}else g.className=""}}return this},toggleClass:function(a,b){var c=typeof a,d=typeof b=="boolean";if(f.isFunction(a))return this.each(function(c){f(this).toggleClass(a.call(this,c,this.className,b),b)});return this.each(function(){if(c==="string"){var e,g=0,h=f(this),i=b,j=a.split(p);while(e=j[g++])i=d?i:!h.hasClass(e),h[i?"addClass":"removeClass"](e)}else if(c==="undefined"||c==="boolean")this.className&&f._data(this,"__className__",this.className),this.className=this.className||a===!1?"":f._data(this,"__className__")||""})},hasClass:function(a){var b=" "+a+" ",c=0,d=this.length;for(;c<d;c++)if(this[c].nodeType===1&&(" "+this[c].className+" ").replace(o," ").indexOf(b)>-1)return!0;return!1},val:function(a){var c,d,e,g=this[0];{if(!!arguments.length){e=f.isFunction(a);return this.each(function(d){var g=f(this),h;if(this.nodeType===1){e?h=a.call(this,d,g.val()):h=a,h==null?h="":typeof h=="number"?h+="":f.isArray(h)&&(h=f.map(h,function(a){return a==null?"":a+""})),c=f.valHooks[this.nodeName.toLowerCase()]||f.valHooks[this.type];if(!c||!("set"in c)||c.set(this,h,"value")===b)this.value=h}})}if(g){c=f.valHooks[g.nodeName.toLowerCase()]||f.valHooks[g.type];if(c&&"get"in c&&(d=c.get(g,"value"))!==b)return d;d=g.value;return typeof d=="string"?d.replace(q,""):d==null?"":d}}}}),f.extend({valHooks:{option:{get:function(a){var b=a.attributes.value;return!b||b.specified?a.value:a.text}},select:{get:function(a){var b,c,d,e,g=a.selectedIndex,h=[],i=a.options,j=a.type==="select-one";if(g<0)return null;c=j?g:0,d=j?g+1:i.length;for(;c<d;c++){e=i[c];if(e.selected&&(f.support.optDisabled?!e.disabled:e.getAttribute("disabled")===null)&&(!e.parentNode.disabled||!f.nodeName(e.parentNode,"optgroup"))){b=f(e).val();if(j)return b;h.push(b)}}if(j&&!h.length&&i.length)return f(i[g]).val();return h},set:function(a,b){var c=f.makeArray(b);f(a).find("option").each(function(){this.selected=f.inArray(f(this).val(),c)>=0}),c.length||(a.selectedIndex=-1);return c}}},attrFn:{val:!0,css:!0,html:!0,text:!0,data:!0,width:!0,height:!0,offset:!0},attr:function(a,c,d,e){var g,h,i,j=a.nodeType;if(!!a&&j!==3&&j!==8&&j!==2){if(e&&c in f.attrFn)return f(a)[c](d);if(typeof a.getAttribute=="undefined")return f.prop(a,c,d);i=j!==1||!f.isXMLDoc(a),i&&(c=c.toLowerCase(),h=f.attrHooks[c]||(u.test(c)?x:w));if(d!==b){if(d===null){f.removeAttr(a,c);return}if(h&&"set"in h&&i&&(g=h.set(a,d,c))!==b)return g;a.setAttribute(c,""+d);return d}if(h&&"get"in h&&i&&(g=h.get(a,c))!==null)return g;g=a.getAttribute(c);return g===null?b:g}},removeAttr:function(a,b){var c,d,e,g,h=0;if(b&&a.nodeType===1){d=b.toLowerCase().split(p),g=d.length;for(;h<g;h++)e=d[h],e&&(c=f.propFix[e]||e,f.attr(a,e,""),a.removeAttribute(v?e:c),u.test(e)&&c in a&&(a[c]=!1))}},attrHooks:{type:{set:function(a,b){if(r.test(a.nodeName)&&a.parentNode)f.error("type property can't be changed");else if(!f.support.radioValue&&b==="radio"&&f.nodeName(a,"input")){var c=a.value;a.setAttribute("type",b),c&&(a.value=c);return b}}},value:{get:function(a,b){if(w&&f.nodeName(a,"button"))return w.get(a,b);return b in a?a.value:null},set:function(a,b,c){if(w&&f.nodeName(a,"button"))return w.set(a,b,c);a.value=b}}},propFix:{tabindex:"tabIndex",readonly:"readOnly","for":"htmlFor","class":"className",maxlength:"maxLength",cellspacing:"cellSpacing",cellpadding:"cellPadding",rowspan:"rowSpan",colspan:"colSpan",usemap:"useMap",frameborder:"frameBorder",contenteditable:"contentEditable"},prop:function(a,c,d){var e,g,h,i=a.nodeType;if(!!a&&i!==3&&i!==8&&i!==2){h=i!==1||!f.isXMLDoc(a),h&&(c=f.propFix[c]||c,g=f.propHooks[c]);return d!==b?g&&"set"in g&&(e=g.set(a,d,c))!==b?e:a[c]=d:g&&"get"in g&&(e=g.get(a,c))!==null?e:a[c]}},propHooks:{tabIndex:{get:function(a){var c=a.getAttributeNode("tabindex");return c&&c.specified?parseInt(c.value,10):s.test(a.nodeName)||t.test(a.nodeName)&&a.href?0:b}}}}),f.attrHooks.tabindex=f.propHooks.tabIndex,x={get:function(a,c){var d,e=f.prop(a,c);return e===!0||typeof e!="boolean"&&(d=a.getAttributeNode(c))&&d.nodeValue!==!1?c.toLowerCase():b},set:function(a,b,c){var d;b===!1?f.removeAttr(a,c):(d=f.propFix[c]||c,d in a&&(a[d]=!0),a.setAttribute(c,c.toLowerCase()));return c}},v||(y={name:!0,id:!0},w=f.valHooks.button={get:function(a,c){var d;d=a.getAttributeNode(c);return d&&(y[c]?d.nodeValue!=="":d.specified)?d.nodeValue:b},set:function(a,b,d){var e=a.getAttributeNode(d);e||(e=c.createAttribute(d),a.setAttributeNode(e));return e.nodeValue=b+""}},f.attrHooks.tabindex.set=w.set,f.each(["width","height"],function(a,b){f.attrHooks[b]=f.extend(f.attrHooks[b],{set:function(a,c){if(c===""){a.setAttribute(b,"auto");return c}}})}),f.attrHooks.contenteditable={get:w.get,set:function(a,b,c){b===""&&(b="false"),w.set(a,b,c)}}),f.support.hrefNormalized||f.each(["href","src","width","height"],function(a,c){f.attrHooks[c]=f.extend(f.attrHooks[c],{get:function(a){var d=a.getAttribute(c,2);return d===null?b:d}})}),f.support.style||(f.attrHooks.style={get:function(a){return a.style.cssText.toLowerCase()||b},set:function(a,b){return a.style.cssText=""+b}}),f.support.optSelected||(f.propHooks.selected=f.extend(f.propHooks.selected,{get:function(a){var b=a.parentNode;b&&(b.selectedIndex,b.parentNode&&b.parentNode.selectedIndex);return null}})),f.support.enctype||(f.propFix.enctype="encoding"),f.support.checkOn||f.each(["radio","checkbox"],function(){f.valHooks[this]={get:function(a){return a.getAttribute("value")===null?"on":a.value}}}),f.each(["radio","checkbox"],function(){f.valHooks[this]=f.extend(f.valHooks[this],{set:function(a,b){if(f.isArray(b))return a.checked=f.inArray(f(a).val(),b)>=0}})});var z=/^(?:textarea|input|select)$/i,A=/^([^\.]*)?(?:\.(.+))?$/,B=/\bhover(\.\S+)?\b/,C=/^key/,D=/^(?:mouse|contextmenu)|click/,E=/^(?:focusinfocus|focusoutblur)$/,F=/^(\w*)(?:#([\w\-]+))?(?:\.([\w\-]+))?$/,G=function(a){var b=F.exec(a);b&&(b[1]=(b[1]||"").toLowerCase(),b[3]=b[3]&&new RegExp("(?:^|\\s)"+b[3]+"(?:\\s|$)"));return b},H=function(a,b){var c=a.attributes||{};return(!b[1]||a.nodeName.toLowerCase()===b[1])&&(!b[2]||(c.id||{}).value===b[2])&&(!b[3]||b[3].test((c["class"]||{}).value))},I=function(a){return f.event.special.hover?a:a.replace(B,"mouseenter$1 mouseleave$1")};
f.event={add:function(a,c,d,e,g){var h,i,j,k,l,m,n,o,p,q,r,s;if(!(a.nodeType===3||a.nodeType===8||!c||!d||!(h=f._data(a)))){d.handler&&(p=d,d=p.handler),d.guid||(d.guid=f.guid++),j=h.events,j||(h.events=j={}),i=h.handle,i||(h.handle=i=function(a){return typeof f!="undefined"&&(!a||f.event.triggered!==a.type)?f.event.dispatch.apply(i.elem,arguments):b},i.elem=a),c=f.trim(I(c)).split(" ");for(k=0;k<c.length;k++){l=A.exec(c[k])||[],m=l[1],n=(l[2]||"").split(".").sort(),s=f.event.special[m]||{},m=(g?s.delegateType:s.bindType)||m,s=f.event.special[m]||{},o=f.extend({type:m,origType:l[1],data:e,handler:d,guid:d.guid,selector:g,quick:G(g),namespace:n.join(".")},p),r=j[m];if(!r){r=j[m]=[],r.delegateCount=0;if(!s.setup||s.setup.call(a,e,n,i)===!1)a.addEventListener?a.addEventListener(m,i,!1):a.attachEvent&&a.attachEvent("on"+m,i)}s.add&&(s.add.call(a,o),o.handler.guid||(o.handler.guid=d.guid)),g?r.splice(r.delegateCount++,0,o):r.push(o),f.event.global[m]=!0}a=null}},global:{},remove:function(a,b,c,d,e){var g=f.hasData(a)&&f._data(a),h,i,j,k,l,m,n,o,p,q,r,s;if(!!g&&!!(o=g.events)){b=f.trim(I(b||"")).split(" ");for(h=0;h<b.length;h++){i=A.exec(b[h])||[],j=k=i[1],l=i[2];if(!j){for(j in o)f.event.remove(a,j+b[h],c,d,!0);continue}p=f.event.special[j]||{},j=(d?p.delegateType:p.bindType)||j,r=o[j]||[],m=r.length,l=l?new RegExp("(^|\\.)"+l.split(".").sort().join("\\.(?:.*\\.)?")+"(\\.|$)"):null;for(n=0;n<r.length;n++)s=r[n],(e||k===s.origType)&&(!c||c.guid===s.guid)&&(!l||l.test(s.namespace))&&(!d||d===s.selector||d==="**"&&s.selector)&&(r.splice(n--,1),s.selector&&r.delegateCount--,p.remove&&p.remove.call(a,s));r.length===0&&m!==r.length&&((!p.teardown||p.teardown.call(a,l)===!1)&&f.removeEvent(a,j,g.handle),delete o[j])}f.isEmptyObject(o)&&(q=g.handle,q&&(q.elem=null),f.removeData(a,["events","handle"],!0))}},customEvent:{getData:!0,setData:!0,changeData:!0},trigger:function(c,d,e,g){if(!e||e.nodeType!==3&&e.nodeType!==8){var h=c.type||c,i=[],j,k,l,m,n,o,p,q,r,s;if(E.test(h+f.event.triggered))return;h.indexOf("!")>=0&&(h=h.slice(0,-1),k=!0),h.indexOf(".")>=0&&(i=h.split("."),h=i.shift(),i.sort());if((!e||f.event.customEvent[h])&&!f.event.global[h])return;c=typeof c=="object"?c[f.expando]?c:new f.Event(h,c):new f.Event(h),c.type=h,c.isTrigger=!0,c.exclusive=k,c.namespace=i.join("."),c.namespace_re=c.namespace?new RegExp("(^|\\.)"+i.join("\\.(?:.*\\.)?")+"(\\.|$)"):null,o=h.indexOf(":")<0?"on"+h:"";if(!e){j=f.cache;for(l in j)j[l].events&&j[l].events[h]&&f.event.trigger(c,d,j[l].handle.elem,!0);return}c.result=b,c.target||(c.target=e),d=d!=null?f.makeArray(d):[],d.unshift(c),p=f.event.special[h]||{};if(p.trigger&&p.trigger.apply(e,d)===!1)return;r=[[e,p.bindType||h]];if(!g&&!p.noBubble&&!f.isWindow(e)){s=p.delegateType||h,m=E.test(s+h)?e:e.parentNode,n=null;for(;m;m=m.parentNode)r.push([m,s]),n=m;n&&n===e.ownerDocument&&r.push([n.defaultView||n.parentWindow||a,s])}for(l=0;l<r.length&&!c.isPropagationStopped();l++)m=r[l][0],c.type=r[l][1],q=(f._data(m,"events")||{})[c.type]&&f._data(m,"handle"),q&&q.apply(m,d),q=o&&m[o],q&&f.acceptData(m)&&q.apply(m,d)===!1&&c.preventDefault();c.type=h,!g&&!c.isDefaultPrevented()&&(!p._default||p._default.apply(e.ownerDocument,d)===!1)&&(h!=="click"||!f.nodeName(e,"a"))&&f.acceptData(e)&&o&&e[h]&&(h!=="focus"&&h!=="blur"||c.target.offsetWidth!==0)&&!f.isWindow(e)&&(n=e[o],n&&(e[o]=null),f.event.triggered=h,e[h](),f.event.triggered=b,n&&(e[o]=n));return c.result}},dispatch:function(c){c=f.event.fix(c||a.event);var d=(f._data(this,"events")||{})[c.type]||[],e=d.delegateCount,g=[].slice.call(arguments,0),h=!c.exclusive&&!c.namespace,i=[],j,k,l,m,n,o,p,q,r,s,t;g[0]=c,c.delegateTarget=this;if(e&&!c.target.disabled&&(!c.button||c.type!=="click")){m=f(this),m.context=this.ownerDocument||this;for(l=c.target;l!=this;l=l.parentNode||this){o={},q=[],m[0]=l;for(j=0;j<e;j++)r=d[j],s=r.selector,o[s]===b&&(o[s]=r.quick?H(l,r.quick):m.is(s)),o[s]&&q.push(r);q.length&&i.push({elem:l,matches:q})}}d.length>e&&i.push({elem:this,matches:d.slice(e)});for(j=0;j<i.length&&!c.isPropagationStopped();j++){p=i[j],c.currentTarget=p.elem;for(k=0;k<p.matches.length&&!c.isImmediatePropagationStopped();k++){r=p.matches[k];if(h||!c.namespace&&!r.namespace||c.namespace_re&&c.namespace_re.test(r.namespace))c.data=r.data,c.handleObj=r,n=((f.event.special[r.origType]||{}).handle||r.handler).apply(p.elem,g),n!==b&&(c.result=n,n===!1&&(c.preventDefault(),c.stopPropagation()))}}return c.result},props:"attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(a,b){a.which==null&&(a.which=b.charCode!=null?b.charCode:b.keyCode);return a}},mouseHooks:{props:"button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(a,d){var e,f,g,h=d.button,i=d.fromElement;a.pageX==null&&d.clientX!=null&&(e=a.target.ownerDocument||c,f=e.documentElement,g=e.body,a.pageX=d.clientX+(f&&f.scrollLeft||g&&g.scrollLeft||0)-(f&&f.clientLeft||g&&g.clientLeft||0),a.pageY=d.clientY+(f&&f.scrollTop||g&&g.scrollTop||0)-(f&&f.clientTop||g&&g.clientTop||0)),!a.relatedTarget&&i&&(a.relatedTarget=i===a.target?d.toElement:i),!a.which&&h!==b&&(a.which=h&1?1:h&2?3:h&4?2:0);return a}},fix:function(a){if(a[f.expando])return a;var d,e,g=a,h=f.event.fixHooks[a.type]||{},i=h.props?this.props.concat(h.props):this.props;a=f.Event(g);for(d=i.length;d;)e=i[--d],a[e]=g[e];a.target||(a.target=g.srcElement||c),a.target.nodeType===3&&(a.target=a.target.parentNode),a.metaKey===b&&(a.metaKey=a.ctrlKey);return h.filter?h.filter(a,g):a},special:{ready:{setup:f.bindReady},load:{noBubble:!0},focus:{delegateType:"focusin"},blur:{delegateType:"focusout"},beforeunload:{setup:function(a,b,c){f.isWindow(this)&&(this.onbeforeunload=c)},teardown:function(a,b){this.onbeforeunload===b&&(this.onbeforeunload=null)}}},simulate:function(a,b,c,d){var e=f.extend(new f.Event,c,{type:a,isSimulated:!0,originalEvent:{}});d?f.event.trigger(e,null,b):f.event.dispatch.call(b,e),e.isDefaultPrevented()&&c.preventDefault()}},f.event.handle=f.event.dispatch,f.removeEvent=c.removeEventListener?function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c,!1)}:function(a,b,c){a.detachEvent&&a.detachEvent("on"+b,c)},f.Event=function(a,b){if(!(this instanceof f.Event))return new f.Event(a,b);a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||a.returnValue===!1||a.getPreventDefault&&a.getPreventDefault()?K:J):this.type=a,b&&f.extend(this,b),this.timeStamp=a&&a.timeStamp||f.now(),this[f.expando]=!0},f.Event.prototype={preventDefault:function(){this.isDefaultPrevented=K;var a=this.originalEvent;!a||(a.preventDefault?a.preventDefault():a.returnValue=!1)},stopPropagation:function(){this.isPropagationStopped=K;var a=this.originalEvent;!a||(a.stopPropagation&&a.stopPropagation(),a.cancelBubble=!0)},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=K,this.stopPropagation()},isDefaultPrevented:J,isPropagationStopped:J,isImmediatePropagationStopped:J},f.each({mouseenter:"mouseover",mouseleave:"mouseout"},function(a,b){f.event.special[a]={delegateType:b,bindType:b,handle:function(a){var c=this,d=a.relatedTarget,e=a.handleObj,g=e.selector,h;if(!d||d!==c&&!f.contains(c,d))a.type=e.origType,h=e.handler.apply(this,arguments),a.type=b;return h}}}),f.support.submitBubbles||(f.event.special.submit={setup:function(){if(f.nodeName(this,"form"))return!1;f.event.add(this,"click._submit keypress._submit",function(a){var c=a.target,d=f.nodeName(c,"input")||f.nodeName(c,"button")?c.form:b;d&&!d._submit_attached&&(f.event.add(d,"submit._submit",function(a){this.parentNode&&!a.isTrigger&&f.event.simulate("submit",this.parentNode,a,!0)}),d._submit_attached=!0)})},teardown:function(){if(f.nodeName(this,"form"))return!1;f.event.remove(this,"._submit")}}),f.support.changeBubbles||(f.event.special.change={setup:function(){if(z.test(this.nodeName)){if(this.type==="checkbox"||this.type==="radio")f.event.add(this,"propertychange._change",function(a){a.originalEvent.propertyName==="checked"&&(this._just_changed=!0)}),f.event.add(this,"click._change",function(a){this._just_changed&&!a.isTrigger&&(this._just_changed=!1,f.event.simulate("change",this,a,!0))});return!1}f.event.add(this,"beforeactivate._change",function(a){var b=a.target;z.test(b.nodeName)&&!b._change_attached&&(f.event.add(b,"change._change",function(a){this.parentNode&&!a.isSimulated&&!a.isTrigger&&f.event.simulate("change",this.parentNode,a,!0)}),b._change_attached=!0)})},handle:function(a){var b=a.target;if(this!==b||a.isSimulated||a.isTrigger||b.type!=="radio"&&b.type!=="checkbox")return a.handleObj.handler.apply(this,arguments)},teardown:function(){f.event.remove(this,"._change");return z.test(this.nodeName)}}),f.support.focusinBubbles||f.each({focus:"focusin",blur:"focusout"},function(a,b){var d=0,e=function(a){f.event.simulate(b,a.target,f.event.fix(a),!0)};f.event.special[b]={setup:function(){d++===0&&c.addEventListener(a,e,!0)},teardown:function(){--d===0&&c.removeEventListener(a,e,!0)}}}),f.fn.extend({on:function(a,c,d,e,g){var h,i;if(typeof a=="object"){typeof c!="string"&&(d=c,c=b);for(i in a)this.on(i,c,d,a[i],g);return this}d==null&&e==null?(e=c,d=c=b):e==null&&(typeof c=="string"?(e=d,d=b):(e=d,d=c,c=b));if(e===!1)e=J;else if(!e)return this;g===1&&(h=e,e=function(a){f().off(a);return h.apply(this,arguments)},e.guid=h.guid||(h.guid=f.guid++));return this.each(function(){f.event.add(this,a,e,d,c)})},one:function(a,b,c,d){return this.on.call(this,a,b,c,d,1)},off:function(a,c,d){if(a&&a.preventDefault&&a.handleObj){var e=a.handleObj;f(a.delegateTarget).off(e.namespace?e.type+"."+e.namespace:e.type,e.selector,e.handler);return this}if(typeof a=="object"){for(var g in a)this.off(g,c,a[g]);return this}if(c===!1||typeof c=="function")d=c,c=b;d===!1&&(d=J);return this.each(function(){f.event.remove(this,a,d,c)})},bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},live:function(a,b,c){f(this.context).on(a,this.selector,b,c);return this},die:function(a,b){f(this.context).off(a,this.selector||"**",b);return this},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return arguments.length==1?this.off(a,"**"):this.off(b,a,c)},trigger:function(a,b){return this.each(function(){f.event.trigger(a,b,this)})},triggerHandler:function(a,b){if(this[0])return f.event.trigger(a,b,this[0],!0)},toggle:function(a){var b=arguments,c=a.guid||f.guid++,d=0,e=function(c){var e=(f._data(this,"lastToggle"+a.guid)||0)%d;f._data(this,"lastToggle"+a.guid,e+1),c.preventDefault();return b[e].apply(this,arguments)||!1};e.guid=c;while(d<b.length)b[d++].guid=c;return this.click(e)},hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)}}),f.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(a,b){f.fn[b]=function(a,c){c==null&&(c=a,a=null);return arguments.length>0?this.on(b,null,a,c):this.trigger(b)},f.attrFn&&(f.attrFn[b]=!0),C.test(b)&&(f.event.fixHooks[b]=f.event.keyHooks),D.test(b)&&(f.event.fixHooks[b]=f.event.mouseHooks)}),function(){function x(a,b,c,e,f,g){for(var h=0,i=e.length;h<i;h++){var j=e[h];if(j){var k=!1;j=j[a];while(j){if(j[d]===c){k=e[j.sizset];break}if(j.nodeType===1){g||(j[d]=c,j.sizset=h);if(typeof b!="string"){if(j===b){k=!0;break}}else if(m.filter(b,[j]).length>0){k=j;break}}j=j[a]}e[h]=k}}}function w(a,b,c,e,f,g){for(var h=0,i=e.length;h<i;h++){var j=e[h];if(j){var k=!1;j=j[a];while(j){if(j[d]===c){k=e[j.sizset];break}j.nodeType===1&&!g&&(j[d]=c,j.sizset=h);if(j.nodeName.toLowerCase()===b){k=j;break}j=j[a]}e[h]=k}}}var a=/((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,d="sizcache"+(Math.random()+"").replace(".",""),e=0,g=Object.prototype.toString,h=!1,i=!0,j=/\\/g,k=/\r\n/g,l=/\W/;[0,0].sort(function(){i=!1;return 0});var m=function(b,d,e,f){e=e||[],d=d||c;var h=d;if(d.nodeType!==1&&d.nodeType!==9)return[];if(!b||typeof b!="string")return e;var i,j,k,l,n,q,r,t,u=!0,v=m.isXML(d),w=[],x=b;do{a.exec(""),i=a.exec(x);if(i){x=i[3],w.push(i[1]);if(i[2]){l=i[3];break}}}while(i);if(w.length>1&&p.exec(b))if(w.length===2&&o.relative[w[0]])j=y(w[0]+w[1],d,f);else{j=o.relative[w[0]]?[d]:m(w.shift(),d);while(w.length)b=w.shift(),o.relative[b]&&(b+=w.shift()),j=y(b,j,f)}else{!f&&w.length>1&&d.nodeType===9&&!v&&o.match.ID.test(w[0])&&!o.match.ID.test(w[w.length-1])&&(n=m.find(w.shift(),d,v),d=n.expr?m.filter(n.expr,n.set)[0]:n.set[0]);if(d){n=f?{expr:w.pop(),set:s(f)}:m.find(w.pop(),w.length===1&&(w[0]==="~"||w[0]==="+")&&d.parentNode?d.parentNode:d,v),j=n.expr?m.filter(n.expr,n.set):n.set,w.length>0?k=s(j):u=!1;while(w.length)q=w.pop(),r=q,o.relative[q]?r=w.pop():q="",r==null&&(r=d),o.relative[q](k,r,v)}else k=w=[]}k||(k=j),k||m.error(q||b);if(g.call(k)==="[object Array]")if(!u)e.push.apply(e,k);else if(d&&d.nodeType===1)for(t=0;k[t]!=null;t++)k[t]&&(k[t]===!0||k[t].nodeType===1&&m.contains(d,k[t]))&&e.push(j[t]);else for(t=0;k[t]!=null;t++)k[t]&&k[t].nodeType===1&&e.push(j[t]);else s(k,e);l&&(m(l,h,e,f),m.uniqueSort(e));return e};m.uniqueSort=function(a){if(u){h=i,a.sort(u);if(h)for(var b=1;b<a.length;b++)a[b]===a[b-1]&&a.splice(b--,1)}return a},m.matches=function(a,b){return m(a,null,null,b)},m.matchesSelector=function(a,b){return m(b,null,null,[a]).length>0},m.find=function(a,b,c){var d,e,f,g,h,i;if(!a)return[];for(e=0,f=o.order.length;e<f;e++){h=o.order[e];if(g=o.leftMatch[h].exec(a)){i=g[1],g.splice(1,1);if(i.substr(i.length-1)!=="\\"){g[1]=(g[1]||"").replace(j,""),d=o.find[h](g,b,c);if(d!=null){a=a.replace(o.match[h],"");break}}}}d||(d=typeof b.getElementsByTagName!="undefined"?b.getElementsByTagName("*"):[]);return{set:d,expr:a}},m.filter=function(a,c,d,e){var f,g,h,i,j,k,l,n,p,q=a,r=[],s=c,t=c&&c[0]&&m.isXML(c[0]);while(a&&c.length){for(h in o.filter)if((f=o.leftMatch[h].exec(a))!=null&&f[2]){k=o.filter[h],l=f[1],g=!1,f.splice(1,1);if(l.substr(l.length-1)==="\\")continue;s===r&&(r=[]);if(o.preFilter[h]){f=o.preFilter[h](f,s,d,r,e,t);if(!f)g=i=!0;else if(f===!0)continue}if(f)for(n=0;(j=s[n])!=null;n++)j&&(i=k(j,f,n,s),p=e^i,d&&i!=null?p?g=!0:s[n]=!1:p&&(r.push(j),g=!0));if(i!==b){d||(s=r),a=a.replace(o.match[h],"");if(!g)return[];break}}if(a===q)if(g==null)m.error(a);else break;q=a}return s},m.error=function(a){throw new Error("Syntax error, unrecognized expression: "+a)};var n=m.getText=function(a){var b,c,d=a.nodeType,e="";if(d){if(d===1||d===9){if(typeof a.textContent=="string")return a.textContent;if(typeof a.innerText=="string")return a.innerText.replace(k,"");for(a=a.firstChild;a;a=a.nextSibling)e+=n(a)}else if(d===3||d===4)return a.nodeValue}else for(b=0;c=a[b];b++)c.nodeType!==8&&(e+=n(c));return e},o=m.selectors={order:["ID","NAME","TAG"],match:{ID:/#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,CLASS:/\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,NAME:/\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,ATTR:/\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,TAG:/^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,CHILD:/:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,POS:/:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,PSEUDO:/:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/},leftMatch:{},attrMap:{"class":"className","for":"htmlFor"},attrHandle:{href:function(a){return a.getAttribute("href")},type:function(a){return a.getAttribute("type")}},relative:{"+":function(a,b){var c=typeof b=="string",d=c&&!l.test(b),e=c&&!d;d&&(b=b.toLowerCase());for(var f=0,g=a.length,h;f<g;f++)if(h=a[f]){while((h=h.previousSibling)&&h.nodeType!==1);a[f]=e||h&&h.nodeName.toLowerCase()===b?h||!1:h===b}e&&m.filter(b,a,!0)},">":function(a,b){var c,d=typeof b=="string",e=0,f=a.length;if(d&&!l.test(b)){b=b.toLowerCase();for(;e<f;e++){c=a[e];if(c){var g=c.parentNode;a[e]=g.nodeName.toLowerCase()===b?g:!1}}}else{for(;e<f;e++)c=a[e],c&&(a[e]=d?c.parentNode:c.parentNode===b);d&&m.filter(b,a,!0)}},"":function(a,b,c){var d,f=e++,g=x;typeof b=="string"&&!l.test(b)&&(b=b.toLowerCase(),d=b,g=w),g("parentNode",b,f,a,d,c)},"~":function(a,b,c){var d,f=e++,g=x;typeof b=="string"&&!l.test(b)&&(b=b.toLowerCase(),d=b,g=w),g("previousSibling",b,f,a,d,c)}},find:{ID:function(a,b,c){if(typeof b.getElementById!="undefined"&&!c){var d=b.getElementById(a[1]);return d&&d.parentNode?[d]:[]}},NAME:function(a,b){if(typeof b.getElementsByName!="undefined"){var c=[],d=b.getElementsByName(a[1]);for(var e=0,f=d.length;e<f;e++)d[e].getAttribute("name")===a[1]&&c.push(d[e]);return c.length===0?null:c}},TAG:function(a,b){if(typeof b.getElementsByTagName!="undefined")return b.getElementsByTagName(a[1])}},preFilter:{CLASS:function(a,b,c,d,e,f){a=" "+a[1].replace(j,"")+" ";if(f)return a;for(var g=0,h;(h=b[g])!=null;g++)h&&(e^(h.className&&(" "+h.className+" ").replace(/[\t\n\r]/g," ").indexOf(a)>=0)?c||d.push(h):c&&(b[g]=!1));return!1},ID:function(a){return a[1].replace(j,"")},TAG:function(a,b){return a[1].replace(j,"").toLowerCase()},CHILD:function(a){if(a[1]==="nth"){a[2]||m.error(a[0]),a[2]=a[2].replace(/^\+|\s*/g,"");var b=/(-?)(\d*)(?:n([+\-]?\d*))?/.exec(a[2]==="even"&&"2n"||a[2]==="odd"&&"2n+1"||!/\D/.test(a[2])&&"0n+"+a[2]||a[2]);a[2]=b[1]+(b[2]||1)-0,a[3]=b[3]-0}else a[2]&&m.error(a[0]);a[0]=e++;return a},ATTR:function(a,b,c,d,e,f){var g=a[1]=a[1].replace(j,"");!f&&o.attrMap[g]&&(a[1]=o.attrMap[g]),a[4]=(a[4]||a[5]||"").replace(j,""),a[2]==="~="&&(a[4]=" "+a[4]+" ");return a},PSEUDO:function(b,c,d,e,f){if(b[1]==="not")if((a.exec(b[3])||"").length>1||/^\w/.test(b[3]))b[3]=m(b[3],null,null,c);else{var g=m.filter(b[3],c,d,!0^f);d||e.push.apply(e,g);return!1}else if(o.match.POS.test(b[0])||o.match.CHILD.test(b[0]))return!0;return b},POS:function(a){a.unshift(!0);return a}},filters:{enabled:function(a){return a.disabled===!1&&a.type!=="hidden"},disabled:function(a){return a.disabled===!0},checked:function(a){return a.checked===!0},selected:function(a){a.parentNode&&a.parentNode.selectedIndex;return a.selected===!0},parent:function(a){return!!a.firstChild},empty:function(a){return!a.firstChild},has:function(a,b,c){return!!m(c[3],a).length},header:function(a){return/h\d/i.test(a.nodeName)},text:function(a){var b=a.getAttribute("type"),c=a.type;return a.nodeName.toLowerCase()==="input"&&"text"===c&&(b===c||b===null)},radio:function(a){return a.nodeName.toLowerCase()==="input"&&"radio"===a.type},checkbox:function(a){return a.nodeName.toLowerCase()==="input"&&"checkbox"===a.type},file:function(a){return a.nodeName.toLowerCase()==="input"&&"file"===a.type},password:function(a){return a.nodeName.toLowerCase()==="input"&&"password"===a.type},submit:function(a){var b=a.nodeName.toLowerCase();return(b==="input"||b==="button")&&"submit"===a.type},image:function(a){return a.nodeName.toLowerCase()==="input"&&"image"===a.type},reset:function(a){var b=a.nodeName.toLowerCase();return(b==="input"||b==="button")&&"reset"===a.type},button:function(a){var b=a.nodeName.toLowerCase();return b==="input"&&"button"===a.type||b==="button"},input:function(a){return/input|select|textarea|button/i.test(a.nodeName)},focus:function(a){return a===a.ownerDocument.activeElement}},setFilters:{first:function(a,b){return b===0},last:function(a,b,c,d){return b===d.length-1},even:function(a,b){return b%2===0},odd:function(a,b){return b%2===1},lt:function(a,b,c){return b<c[3]-0},gt:function(a,b,c){return b>c[3]-0},nth:function(a,b,c){return c[3]-0===b},eq:function(a,b,c){return c[3]-0===b}},filter:{PSEUDO:function(a,b,c,d){var e=b[1],f=o.filters[e];if(f)return f(a,c,b,d);if(e==="contains")return(a.textContent||a.innerText||n([a])||"").indexOf(b[3])>=0;if(e==="not"){var g=b[3];for(var h=0,i=g.length;h<i;h++)if(g[h]===a)return!1;return!0}m.error(e)},CHILD:function(a,b){var c,e,f,g,h,i,j,k=b[1],l=a;switch(k){case"only":case"first":while(l=l.previousSibling)if(l.nodeType===1)return!1;if(k==="first")return!0;l=a;case"last":while(l=l.nextSibling)if(l.nodeType===1)return!1;return!0;case"nth":c=b[2],e=b[3];if(c===1&&e===0)return!0;f=b[0],g=a.parentNode;if(g&&(g[d]!==f||!a.nodeIndex)){i=0;for(l=g.firstChild;l;l=l.nextSibling)l.nodeType===1&&(l.nodeIndex=++i);g[d]=f}j=a.nodeIndex-e;return c===0?j===0:j%c===0&&j/c>=0}},ID:function(a,b){return a.nodeType===1&&a.getAttribute("id")===b},TAG:function(a,b){return b==="*"&&a.nodeType===1||!!a.nodeName&&a.nodeName.toLowerCase()===b},CLASS:function(a,b){return(" "+(a.className||a.getAttribute("class"))+" ").indexOf(b)>-1},ATTR:function(a,b){var c=b[1],d=m.attr?m.attr(a,c):o.attrHandle[c]?o.attrHandle[c](a):a[c]!=null?a[c]:a.getAttribute(c),e=d+"",f=b[2],g=b[4];return d==null?f==="!=":!f&&m.attr?d!=null:f==="="?e===g:f==="*="?e.indexOf(g)>=0:f==="~="?(" "+e+" ").indexOf(g)>=0:g?f==="!="?e!==g:f==="^="?e.indexOf(g)===0:f==="$="?e.substr(e.length-g.length)===g:f==="|="?e===g||e.substr(0,g.length+1)===g+"-":!1:e&&d!==!1},POS:function(a,b,c,d){var e=b[2],f=o.setFilters[e];if(f)return f(a,c,b,d)}}},p=o.match.POS,q=function(a,b){return"\\"+(b-0+1)};for(var r in o.match)o.match[r]=new RegExp(o.match[r].source+/(?![^\[]*\])(?![^\(]*\))/.source),o.leftMatch[r]=new RegExp(/(^(?:.|\r|\n)*?)/.source+o.match[r].source.replace(/\\(\d+)/g,q));var s=function(a,b){a=Array.prototype.slice.call(a,0);if(b){b.push.apply(b,a);return b}return a};try{Array.prototype.slice.call(c.documentElement.childNodes,0)[0].nodeType}catch(t){s=function(a,b){var c=0,d=b||[];if(g.call(a)==="[object Array]")Array.prototype.push.apply(d,a);else if(typeof a.length=="number")for(var e=a.length;c<e;c++)d.push(a[c]);else for(;a[c];c++)d.push(a[c]);return d}}var u,v;c.documentElement.compareDocumentPosition?u=function(a,b){if(a===b){h=!0;return 0}if(!a.compareDocumentPosition||!b.compareDocumentPosition)return a.compareDocumentPosition?-1:1;return a.compareDocumentPosition(b)&4?-1:1}:(u=function(a,b){if(a===b){h=!0;return 0}if(a.sourceIndex&&b.sourceIndex)return a.sourceIndex-b.sourceIndex;var c,d,e=[],f=[],g=a.parentNode,i=b.parentNode,j=g;if(g===i)return v(a,b);if(!g)return-1;if(!i)return 1;while(j)e.unshift(j),j=j.parentNode;j=i;while(j)f.unshift(j),j=j.parentNode;c=e.length,d=f.length;for(var k=0;k<c&&k<d;k++)if(e[k]!==f[k])return v(e[k],f[k]);return k===c?v(a,f[k],-1):v(e[k],b,1)},v=function(a,b,c){if(a===b)return c;var d=a.nextSibling;while(d){if(d===b)return-1;d=d.nextSibling}return 1}),function(){var a=c.createElement("div"),d="script"+(new Date).getTime(),e=c.documentElement;a.innerHTML="<a name='"+d+"'/>",e.insertBefore(a,e.firstChild),c.getElementById(d)&&(o.find.ID=function(a,c,d){if(typeof c.getElementById!="undefined"&&!d){var e=c.getElementById(a[1]);return e?e.id===a[1]||typeof e.getAttributeNode!="undefined"&&e.getAttributeNode("id").nodeValue===a[1]?[e]:b:[]}},o.filter.ID=function(a,b){var c=typeof a.getAttributeNode!="undefined"&&a.getAttributeNode("id");return a.nodeType===1&&c&&c.nodeValue===b}),e.removeChild(a),e=a=null}(),function(){var a=c.createElement("div");a.appendChild(c.createComment("")),a.getElementsByTagName("*").length>0&&(o.find.TAG=function(a,b){var c=b.getElementsByTagName(a[1]);if(a[1]==="*"){var d=[];for(var e=0;c[e];e++)c[e].nodeType===1&&d.push(c[e]);c=d}return c}),a.innerHTML="<a href='#'></a>",a.firstChild&&typeof a.firstChild.getAttribute!="undefined"&&a.firstChild.getAttribute("href")!=="#"&&(o.attrHandle.href=function(a){return a.getAttribute("href",2)}),a=null}(),c.querySelectorAll&&function(){var a=m,b=c.createElement("div"),d="__sizzle__";b.innerHTML="<p class='TEST'></p>";if(!b.querySelectorAll||b.querySelectorAll(".TEST").length!==0){m=function(b,e,f,g){e=e||c;if(!g&&!m.isXML(e)){var h=/^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec(b);if(h&&(e.nodeType===1||e.nodeType===9)){if(h[1])return s(e.getElementsByTagName(b),f);if(h[2]&&o.find.CLASS&&e.getElementsByClassName)return s(e.getElementsByClassName(h[2]),f)}if(e.nodeType===9){if(b==="body"&&e.body)return s([e.body],f);if(h&&h[3]){var i=e.getElementById(h[3]);if(!i||!i.parentNode)return s([],f);if(i.id===h[3])return s([i],f)}try{return s(e.querySelectorAll(b),f)}catch(j){}}else if(e.nodeType===1&&e.nodeName.toLowerCase()!=="object"){var k=e,l=e.getAttribute("id"),n=l||d,p=e.parentNode,q=/^\s*[+~]/.test(b);l?n=n.replace(/'/g,"\\$&"):e.setAttribute("id",n),q&&p&&(e=e.parentNode);try{if(!q||p)return s(e.querySelectorAll("[id='"+n+"'] "+b),f)}catch(r){}finally{l||k.removeAttribute("id")}}}return a(b,e,f,g)};for(var e in a)m[e]=a[e];b=null}}(),function(){var a=c.documentElement,b=a.matchesSelector||a.mozMatchesSelector||a.webkitMatchesSelector||a.msMatchesSelector;if(b){var d=!b.call(c.createElement("div"),"div"),e=!1;try{b.call(c.documentElement,"[test!='']:sizzle")}catch(f){e=!0}m.matchesSelector=function(a,c){c=c.replace(/\=\s*([^'"\]]*)\s*\]/g,"='$1']");if(!m.isXML(a))try{if(e||!o.match.PSEUDO.test(c)&&!/!=/.test(c)){var f=b.call(a,c);if(f||!d||a.document&&a.document.nodeType!==11)return f}}catch(g){}return m(c,null,null,[a]).length>0}}}(),function(){var a=c.createElement("div");a.innerHTML="<div class='test e'></div><div class='test'></div>";if(!!a.getElementsByClassName&&a.getElementsByClassName("e").length!==0){a.lastChild.className="e";if(a.getElementsByClassName("e").length===1)return;o.order.splice(1,0,"CLASS"),o.find.CLASS=function(a,b,c){if(typeof b.getElementsByClassName!="undefined"&&!c)return b.getElementsByClassName(a[1])},a=null}}(),c.documentElement.contains?m.contains=function(a,b){return a!==b&&(a.contains?a.contains(b):!0)}:c.documentElement.compareDocumentPosition?m.contains=function(a,b){return!!(a.compareDocumentPosition(b)&16)}:m.contains=function(){return!1},m.isXML=function(a){var b=(a?a.ownerDocument||a:0).documentElement;return b?b.nodeName!=="HTML":!1};var y=function(a,b,c){var d,e=[],f="",g=b.nodeType?[b]:b;while(d=o.match.PSEUDO.exec(a))f+=d[0],a=a.replace(o.match.PSEUDO,"");a=o.relative[a]?a+"*":a;for(var h=0,i=g.length;h<i;h++)m(a,g[h],e,c);return m.filter(f,e)};m.attr=f.attr,m.selectors.attrMap={},f.find=m,f.expr=m.selectors,f.expr[":"]=f.expr.filters,f.unique=m.uniqueSort,f.text=m.getText,f.isXMLDoc=m.isXML,f.contains=m.contains}();var L=/Until$/,M=/^(?:parents|prevUntil|prevAll)/,N=/,/,O=/^.[^:#\[\.,]*$/,P=Array.prototype.slice,Q=f.expr.match.POS,R={children:!0,contents:!0,next:!0,prev:!0};f.fn.extend({find:function(a){var b=this,c,d;if(typeof a!="string")return f(a).filter(function(){for(c=0,d=b.length;c<d;c++)if(f.contains(b[c],this))return!0});var e=this.pushStack("","find",a),g,h,i;for(c=0,d=this.length;c<d;c++){g=e.length,f.find(a,this[c],e);if(c>0)for(h=g;h<e.length;h++)for(i=0;i<g;i++)if(e[i]===e[h]){e.splice(h--,1);break}}return e},has:function(a){var b=f(a);return this.filter(function(){for(var a=0,c=b.length;a<c;a++)if(f.contains(this,b[a]))return!0})},not:function(a){return this.pushStack(T(this,a,!1),"not",a)},filter:function(a){return this.pushStack(T(this,a,!0),"filter",a)},is:function(a){return!!a&&(typeof a=="string"?Q.test(a)?f(a,this.context).index(this[0])>=0:f.filter(a,this).length>0:this.filter(a).length>0)},closest:function(a,b){var c=[],d,e,g=this[0];if(f.isArray(a)){var h=1;while(g&&g.ownerDocument&&g!==b){for(d=0;d<a.length;d++)f(g).is(a[d])&&c.push({selector:a[d],elem:g,level:h});g=g.parentNode,h++}return c}var i=Q.test(a)||typeof a!="string"?f(a,b||this.context):0;for(d=0,e=this.length;d<e;d++){g=this[d];while(g){if(i?i.index(g)>-1:f.find.matchesSelector(g,a)){c.push(g);break}g=g.parentNode;if(!g||!g.ownerDocument||g===b||g.nodeType===11)break}}c=c.length>1?f.unique(c):c;return this.pushStack(c,"closest",a)},index:function(a){if(!a)return this[0]&&this[0].parentNode?this.prevAll().length:-1;if(typeof a=="string")return f.inArray(this[0],f(a));return f.inArray(a.jquery?a[0]:a,this)},add:function(a,b){var c=typeof a=="string"?f(a,b):f.makeArray(a&&a.nodeType?[a]:a),d=f.merge(this.get(),c);return this.pushStack(S(c[0])||S(d[0])?d:f.unique(d))},andSelf:function(){return this.add(this.prevObject)}}),f.each({parent:function(a){var b=a.parentNode;return b&&b.nodeType!==11?b:null},parents:function(a){return f.dir(a,"parentNode")},parentsUntil:function(a,b,c){return f.dir(a,"parentNode",c)},next:function(a){return f.nth(a,2,"nextSibling")},prev:function(a){return f.nth(a,2,"previousSibling")},nextAll:function(a){return f.dir(a,"nextSibling")},prevAll:function(a){return f.dir(a,"previousSibling")},nextUntil:function(a,b,c){return f.dir(a,"nextSibling",c)},prevUntil:function(a,b,c){return f.dir(a,"previousSibling",c)},siblings:function(a){return f.sibling(a.parentNode.firstChild,a)},children:function(a){return f.sibling(a.firstChild)},contents:function(a){return f.nodeName(a,"iframe")?a.contentDocument||a.contentWindow.document:f.makeArray(a.childNodes)}},function(a,b){f.fn[a]=function(c,d){var e=f.map(this,b,c);L.test(a)||(d=c),d&&typeof d=="string"&&(e=f.filter(d,e)),e=this.length>1&&!R[a]?f.unique(e):e,(this.length>1||N.test(d))&&M.test(a)&&(e=e.reverse());return this.pushStack(e,a,P.call(arguments).join(","))}}),f.extend({filter:function(a,b,c){c&&(a=":not("+a+")");return b.length===1?f.find.matchesSelector(b[0],a)?[b[0]]:[]:f.find.matches(a,b)},dir:function(a,c,d){var e=[],g=a[c];while(g&&g.nodeType!==9&&(d===b||g.nodeType!==1||!f(g).is(d)))g.nodeType===1&&e.push(g),g=g[c];return e},nth:function(a,b,c,d){b=b||1;var e=0;for(;a;a=a[c])if(a.nodeType===1&&++e===b)break;return a},sibling:function(a,b){var c=[];for(;a;a=a.nextSibling)a.nodeType===1&&a!==b&&c.push(a);return c}});var V="abbr|article|aside|audio|canvas|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",W=/ jQuery\d+="(?:\d+|null)"/g,X=/^\s+/,Y=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,Z=/<([\w:]+)/,$=/<tbody/i,_=/<|&#?\w+;/,ba=/<(?:script|style)/i,bb=/<(?:script|object|embed|option|style)/i,bc=new RegExp("<(?:"+V+")","i"),bd=/checked\s*(?:[^=]|=\s*.checked.)/i,be=/\/(java|ecma)script/i,bf=/^\s*<!(?:\[CDATA\[|\-\-)/,bg={option:[1,"<select multiple='multiple'>","</select>"],legend:[1,"<fieldset>","</fieldset>"],thead:[1,"<table>","</table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],area:[1,"<map>","</map>"],_default:[0,"",""]},bh=U(c);bg.optgroup=bg.option,bg.tbody=bg.tfoot=bg.colgroup=bg.caption=bg.thead,bg.th=bg.td,f.support.htmlSerialize||(bg._default=[1,"div<div>","</div>"]),f.fn.extend({text:function(a){if(f.isFunction(a))return this.each(function(b){var c=f(this);c.text(a.call(this,b,c.text()))});if(typeof a!="object"&&a!==b)return this.empty().append((this[0]&&this[0].ownerDocument||c).createTextNode(a));return f.text(this)},wrapAll:function(a){if(f.isFunction(a))return this.each(function(b){f(this).wrapAll(a.call(this,b))});if(this[0]){var b=f(a,this[0].ownerDocument).eq(0).clone(!0);this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){var a=this;while(a.firstChild&&a.firstChild.nodeType===1)a=a.firstChild;return a}).append(this)}return this},wrapInner:function(a){if(f.isFunction(a))return this.each(function(b){f(this).wrapInner(a.call(this,b))});return this.each(function(){var b=f(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){var b=f.isFunction(a);return this.each(function(c){f(this).wrapAll(b?a.call(this,c):a)})},unwrap:function(){return this.parent().each(function(){f.nodeName(this,"body")||f(this).replaceWith(this.childNodes)}).end()},append:function(){return this.domManip(arguments,!0,function(a){this.nodeType===1&&this.appendChild(a)})},prepend:function(){return this.domManip(arguments,!0,function(a){this.nodeType===1&&this.insertBefore(a,this.firstChild)})},before:function(){if(this[0]&&this[0].parentNode)return this.domManip(arguments,!1,function(a){this.parentNode.insertBefore(a,this)});if(arguments.length){var a=f.clean(arguments);a.push.apply(a,this.toArray());return this.pushStack(a,"before",arguments)}},after:function(){if(this[0]&&this[0].parentNode)return this.domManip(arguments,!1,function(a){this.parentNode.insertBefore(a,this.nextSibling)});if(arguments.length){var a=this.pushStack(this,"after",arguments);a.push.apply(a,f.clean(arguments));return a}},remove:function(a,b){for(var c=0,d;(d=this[c])!=null;c++)if(!a||f.filter(a,[d]).length)!b&&d.nodeType===1&&(f.cleanData(d.getElementsByTagName("*")),f.cleanData([d])),d.parentNode&&d.parentNode.removeChild(d);return this},empty:function()
{for(var a=0,b;(b=this[a])!=null;a++){b.nodeType===1&&f.cleanData(b.getElementsByTagName("*"));while(b.firstChild)b.removeChild(b.firstChild)}return this},clone:function(a,b){a=a==null?!1:a,b=b==null?a:b;return this.map(function(){return f.clone(this,a,b)})},html:function(a){if(a===b)return this[0]&&this[0].nodeType===1?this[0].innerHTML.replace(W,""):null;if(typeof a=="string"&&!ba.test(a)&&(f.support.leadingWhitespace||!X.test(a))&&!bg[(Z.exec(a)||["",""])[1].toLowerCase()]){a=a.replace(Y,"<$1></$2>");try{for(var c=0,d=this.length;c<d;c++)this[c].nodeType===1&&(f.cleanData(this[c].getElementsByTagName("*")),this[c].innerHTML=a)}catch(e){this.empty().append(a)}}else f.isFunction(a)?this.each(function(b){var c=f(this);c.html(a.call(this,b,c.html()))}):this.empty().append(a);return this},replaceWith:function(a){if(this[0]&&this[0].parentNode){if(f.isFunction(a))return this.each(function(b){var c=f(this),d=c.html();c.replaceWith(a.call(this,b,d))});typeof a!="string"&&(a=f(a).detach());return this.each(function(){var b=this.nextSibling,c=this.parentNode;f(this).remove(),b?f(b).before(a):f(c).append(a)})}return this.length?this.pushStack(f(f.isFunction(a)?a():a),"replaceWith",a):this},detach:function(a){return this.remove(a,!0)},domManip:function(a,c,d){var e,g,h,i,j=a[0],k=[];if(!f.support.checkClone&&arguments.length===3&&typeof j=="string"&&bd.test(j))return this.each(function(){f(this).domManip(a,c,d,!0)});if(f.isFunction(j))return this.each(function(e){var g=f(this);a[0]=j.call(this,e,c?g.html():b),g.domManip(a,c,d)});if(this[0]){i=j&&j.parentNode,f.support.parentNode&&i&&i.nodeType===11&&i.childNodes.length===this.length?e={fragment:i}:e=f.buildFragment(a,this,k),h=e.fragment,h.childNodes.length===1?g=h=h.firstChild:g=h.firstChild;if(g){c=c&&f.nodeName(g,"tr");for(var l=0,m=this.length,n=m-1;l<m;l++)d.call(c?bi(this[l],g):this[l],e.cacheable||m>1&&l<n?f.clone(h,!0,!0):h)}k.length&&f.each(k,bp)}return this}}),f.buildFragment=function(a,b,d){var e,g,h,i,j=a[0];b&&b[0]&&(i=b[0].ownerDocument||b[0]),i.createDocumentFragment||(i=c),a.length===1&&typeof j=="string"&&j.length<512&&i===c&&j.charAt(0)==="<"&&!bb.test(j)&&(f.support.checkClone||!bd.test(j))&&(f.support.html5Clone||!bc.test(j))&&(g=!0,h=f.fragments[j],h&&h!==1&&(e=h)),e||(e=i.createDocumentFragment(),f.clean(a,i,e,d)),g&&(f.fragments[j]=h?e:1);return{fragment:e,cacheable:g}},f.fragments={},f.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){f.fn[a]=function(c){var d=[],e=f(c),g=this.length===1&&this[0].parentNode;if(g&&g.nodeType===11&&g.childNodes.length===1&&e.length===1){e[b](this[0]);return this}for(var h=0,i=e.length;h<i;h++){var j=(h>0?this.clone(!0):this).get();f(e[h])[b](j),d=d.concat(j)}return this.pushStack(d,a,e.selector)}}),f.extend({clone:function(a,b,c){var d,e,g,h=f.support.html5Clone||!bc.test("<"+a.nodeName)?a.cloneNode(!0):bo(a);if((!f.support.noCloneEvent||!f.support.noCloneChecked)&&(a.nodeType===1||a.nodeType===11)&&!f.isXMLDoc(a)){bk(a,h),d=bl(a),e=bl(h);for(g=0;d[g];++g)e[g]&&bk(d[g],e[g])}if(b){bj(a,h);if(c){d=bl(a),e=bl(h);for(g=0;d[g];++g)bj(d[g],e[g])}}d=e=null;return h},clean:function(a,b,d,e){var g;b=b||c,typeof b.createElement=="undefined"&&(b=b.ownerDocument||b[0]&&b[0].ownerDocument||c);var h=[],i;for(var j=0,k;(k=a[j])!=null;j++){typeof k=="number"&&(k+="");if(!k)continue;if(typeof k=="string")if(!_.test(k))k=b.createTextNode(k);else{k=k.replace(Y,"<$1></$2>");var l=(Z.exec(k)||["",""])[1].toLowerCase(),m=bg[l]||bg._default,n=m[0],o=b.createElement("div");b===c?bh.appendChild(o):U(b).appendChild(o),o.innerHTML=m[1]+k+m[2];while(n--)o=o.lastChild;if(!f.support.tbody){var p=$.test(k),q=l==="table"&&!p?o.firstChild&&o.firstChild.childNodes:m[1]==="<table>"&&!p?o.childNodes:[];for(i=q.length-1;i>=0;--i)f.nodeName(q[i],"tbody")&&!q[i].childNodes.length&&q[i].parentNode.removeChild(q[i])}!f.support.leadingWhitespace&&X.test(k)&&o.insertBefore(b.createTextNode(X.exec(k)[0]),o.firstChild),k=o.childNodes}var r;if(!f.support.appendChecked)if(k[0]&&typeof (r=k.length)=="number")for(i=0;i<r;i++)bn(k[i]);else bn(k);k.nodeType?h.push(k):h=f.merge(h,k)}if(d){g=function(a){return!a.type||be.test(a.type)};for(j=0;h[j];j++)if(e&&f.nodeName(h[j],"script")&&(!h[j].type||h[j].type.toLowerCase()==="text/javascript"))e.push(h[j].parentNode?h[j].parentNode.removeChild(h[j]):h[j]);else{if(h[j].nodeType===1){var s=f.grep(h[j].getElementsByTagName("script"),g);h.splice.apply(h,[j+1,0].concat(s))}d.appendChild(h[j])}}return h},cleanData:function(a){var b,c,d=f.cache,e=f.event.special,g=f.support.deleteExpando;for(var h=0,i;(i=a[h])!=null;h++){if(i.nodeName&&f.noData[i.nodeName.toLowerCase()])continue;c=i[f.expando];if(c){b=d[c];if(b&&b.events){for(var j in b.events)e[j]?f.event.remove(i,j):f.removeEvent(i,j,b.handle);b.handle&&(b.handle.elem=null)}g?delete i[f.expando]:i.removeAttribute&&i.removeAttribute(f.expando),delete d[c]}}}});var bq=/alpha\([^)]*\)/i,br=/opacity=([^)]*)/,bs=/([A-Z]|^ms)/g,bt=/^-?\d+(?:px)?$/i,bu=/^-?\d/,bv=/^([\-+])=([\-+.\de]+)/,bw={position:"absolute",visibility:"hidden",display:"block"},bx=["Left","Right"],by=["Top","Bottom"],bz,bA,bB;f.fn.css=function(a,c){if(arguments.length===2&&c===b)return this;return f.access(this,a,c,!0,function(a,c,d){return d!==b?f.style(a,c,d):f.css(a,c)})},f.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=bz(a,"opacity","opacity");return c===""?"1":c}return a.style.opacity}}},cssNumber:{fillOpacity:!0,fontWeight:!0,lineHeight:!0,opacity:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":f.support.cssFloat?"cssFloat":"styleFloat"},style:function(a,c,d,e){if(!!a&&a.nodeType!==3&&a.nodeType!==8&&!!a.style){var g,h,i=f.camelCase(c),j=a.style,k=f.cssHooks[i];c=f.cssProps[i]||i;if(d===b){if(k&&"get"in k&&(g=k.get(a,!1,e))!==b)return g;return j[c]}h=typeof d,h==="string"&&(g=bv.exec(d))&&(d=+(g[1]+1)*+g[2]+parseFloat(f.css(a,c)),h="number");if(d==null||h==="number"&&isNaN(d))return;h==="number"&&!f.cssNumber[i]&&(d+="px");if(!k||!("set"in k)||(d=k.set(a,d))!==b)try{j[c]=d}catch(l){}}},css:function(a,c,d){var e,g;c=f.camelCase(c),g=f.cssHooks[c],c=f.cssProps[c]||c,c==="cssFloat"&&(c="float");if(g&&"get"in g&&(e=g.get(a,!0,d))!==b)return e;if(bz)return bz(a,c)},swap:function(a,b,c){var d={};for(var e in b)d[e]=a.style[e],a.style[e]=b[e];c.call(a);for(e in b)a.style[e]=d[e]}}),f.curCSS=f.css,f.each(["height","width"],function(a,b){f.cssHooks[b]={get:function(a,c,d){var e;if(c){if(a.offsetWidth!==0)return bC(a,b,d);f.swap(a,bw,function(){e=bC(a,b,d)});return e}},set:function(a,b){if(!bt.test(b))return b;b=parseFloat(b);if(b>=0)return b+"px"}}}),f.support.opacity||(f.cssHooks.opacity={get:function(a,b){return br.test((b&&a.currentStyle?a.currentStyle.filter:a.style.filter)||"")?parseFloat(RegExp.$1)/100+"":b?"1":""},set:function(a,b){var c=a.style,d=a.currentStyle,e=f.isNumeric(b)?"alpha(opacity="+b*100+")":"",g=d&&d.filter||c.filter||"";c.zoom=1;if(b>=1&&f.trim(g.replace(bq,""))===""){c.removeAttribute("filter");if(d&&!d.filter)return}c.filter=bq.test(g)?g.replace(bq,e):g+" "+e}}),f(function(){f.support.reliableMarginRight||(f.cssHooks.marginRight={get:function(a,b){var c;f.swap(a,{display:"inline-block"},function(){b?c=bz(a,"margin-right","marginRight"):c=a.style.marginRight});return c}})}),c.defaultView&&c.defaultView.getComputedStyle&&(bA=function(a,b){var c,d,e;b=b.replace(bs,"-$1").toLowerCase(),(d=a.ownerDocument.defaultView)&&(e=d.getComputedStyle(a,null))&&(c=e.getPropertyValue(b),c===""&&!f.contains(a.ownerDocument.documentElement,a)&&(c=f.style(a,b)));return c}),c.documentElement.currentStyle&&(bB=function(a,b){var c,d,e,f=a.currentStyle&&a.currentStyle[b],g=a.style;f===null&&g&&(e=g[b])&&(f=e),!bt.test(f)&&bu.test(f)&&(c=g.left,d=a.runtimeStyle&&a.runtimeStyle.left,d&&(a.runtimeStyle.left=a.currentStyle.left),g.left=b==="fontSize"?"1em":f||0,f=g.pixelLeft+"px",g.left=c,d&&(a.runtimeStyle.left=d));return f===""?"auto":f}),bz=bA||bB,f.expr&&f.expr.filters&&(f.expr.filters.hidden=function(a){var b=a.offsetWidth,c=a.offsetHeight;return b===0&&c===0||!f.support.reliableHiddenOffsets&&(a.style&&a.style.display||f.css(a,"display"))==="none"},f.expr.filters.visible=function(a){return!f.expr.filters.hidden(a)});var bD=/%20/g,bE=/\[\]$/,bF=/\r?\n/g,bG=/#.*$/,bH=/^(.*?):[ \t]*([^\r\n]*)\r?$/mg,bI=/^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,bJ=/^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,bK=/^(?:GET|HEAD)$/,bL=/^\/\//,bM=/\?/,bN=/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,bO=/^(?:select|textarea)/i,bP=/\s+/,bQ=/([?&])_=[^&]*/,bR=/^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,bS=f.fn.load,bT={},bU={},bV,bW,bX=["*/"]+["*"];try{bV=e.href}catch(bY){bV=c.createElement("a"),bV.href="",bV=bV.href}bW=bR.exec(bV.toLowerCase())||[],f.fn.extend({load:function(a,c,d){if(typeof a!="string"&&bS)return bS.apply(this,arguments);if(!this.length)return this;var e=a.indexOf(" ");if(e>=0){var g=a.slice(e,a.length);a=a.slice(0,e)}var h="GET";c&&(f.isFunction(c)?(d=c,c=b):typeof c=="object"&&(c=f.param(c,f.ajaxSettings.traditional),h="POST"));var i=this;f.ajax({url:a,type:h,dataType:"html",data:c,complete:function(a,b,c){c=a.responseText,a.isResolved()&&(a.done(function(a){c=a}),i.html(g?f("<div>").append(c.replace(bN,"")).find(g):c)),d&&i.each(d,[c,b,a])}});return this},serialize:function(){return f.param(this.serializeArray())},serializeArray:function(){return this.map(function(){return this.elements?f.makeArray(this.elements):this}).filter(function(){return this.name&&!this.disabled&&(this.checked||bO.test(this.nodeName)||bI.test(this.type))}).map(function(a,b){var c=f(this).val();return c==null?null:f.isArray(c)?f.map(c,function(a,c){return{name:b.name,value:a.replace(bF,"\r\n")}}):{name:b.name,value:c.replace(bF,"\r\n")}}).get()}}),f.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "),function(a,b){f.fn[b]=function(a){return this.on(b,a)}}),f.each(["get","post"],function(a,c){f[c]=function(a,d,e,g){f.isFunction(d)&&(g=g||e,e=d,d=b);return f.ajax({type:c,url:a,data:d,success:e,dataType:g})}}),f.extend({getScript:function(a,c){return f.get(a,b,c,"script")},getJSON:function(a,b,c){return f.get(a,b,c,"json")},ajaxSetup:function(a,b){b?b_(a,f.ajaxSettings):(b=a,a=f.ajaxSettings),b_(a,b);return a},ajaxSettings:{url:bV,isLocal:bJ.test(bW[1]),global:!0,type:"GET",contentType:"application/x-www-form-urlencoded",processData:!0,async:!0,accepts:{xml:"application/xml, text/xml",html:"text/html",text:"text/plain",json:"application/json, text/javascript","*":bX},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText"},converters:{"* text":a.String,"text html":!0,"text json":f.parseJSON,"text xml":f.parseXML},flatOptions:{context:!0,url:!0}},ajaxPrefilter:bZ(bT),ajaxTransport:bZ(bU),ajax:function(a,c){function w(a,c,l,m){if(s!==2){s=2,q&&clearTimeout(q),p=b,n=m||"",v.readyState=a>0?4:0;var o,r,u,w=c,x=l?cb(d,v,l):b,y,z;if(a>=200&&a<300||a===304){if(d.ifModified){if(y=v.getResponseHeader("Last-Modified"))f.lastModified[k]=y;if(z=v.getResponseHeader("Etag"))f.etag[k]=z}if(a===304)w="notmodified",o=!0;else try{r=cc(d,x),w="success",o=!0}catch(A){w="parsererror",u=A}}else{u=w;if(!w||a)w="error",a<0&&(a=0)}v.status=a,v.statusText=""+(c||w),o?h.resolveWith(e,[r,w,v]):h.rejectWith(e,[v,w,u]),v.statusCode(j),j=b,t&&g.trigger("ajax"+(o?"Success":"Error"),[v,d,o?r:u]),i.fireWith(e,[v,w]),t&&(g.trigger("ajaxComplete",[v,d]),--f.active||f.event.trigger("ajaxStop"))}}typeof a=="object"&&(c=a,a=b),c=c||{};var d=f.ajaxSetup({},c),e=d.context||d,g=e!==d&&(e.nodeType||e instanceof f)?f(e):f.event,h=f.Deferred(),i=f.Callbacks("once memory"),j=d.statusCode||{},k,l={},m={},n,o,p,q,r,s=0,t,u,v={readyState:0,setRequestHeader:function(a,b){if(!s){var c=a.toLowerCase();a=m[c]=m[c]||a,l[a]=b}return this},getAllResponseHeaders:function(){return s===2?n:null},getResponseHeader:function(a){var c;if(s===2){if(!o){o={};while(c=bH.exec(n))o[c[1].toLowerCase()]=c[2]}c=o[a.toLowerCase()]}return c===b?null:c},overrideMimeType:function(a){s||(d.mimeType=a);return this},abort:function(a){a=a||"abort",p&&p.abort(a),w(0,a);return this}};h.promise(v),v.success=v.done,v.error=v.fail,v.complete=i.add,v.statusCode=function(a){if(a){var b;if(s<2)for(b in a)j[b]=[j[b],a[b]];else b=a[v.status],v.then(b,b)}return this},d.url=((a||d.url)+"").replace(bG,"").replace(bL,bW[1]+"//"),d.dataTypes=f.trim(d.dataType||"*").toLowerCase().split(bP),d.crossDomain==null&&(r=bR.exec(d.url.toLowerCase()),d.crossDomain=!(!r||r[1]==bW[1]&&r[2]==bW[2]&&(r[3]||(r[1]==="http:"?80:443))==(bW[3]||(bW[1]==="http:"?80:443)))),d.data&&d.processData&&typeof d.data!="string"&&(d.data=f.param(d.data,d.traditional)),b$(bT,d,c,v);if(s===2)return!1;t=d.global,d.type=d.type.toUpperCase(),d.hasContent=!bK.test(d.type),t&&f.active++===0&&f.event.trigger("ajaxStart");if(!d.hasContent){d.data&&(d.url+=(bM.test(d.url)?"&":"?")+d.data,delete d.data),k=d.url;if(d.cache===!1){var x=f.now(),y=d.url.replace(bQ,"$1_="+x);d.url=y+(y===d.url?(bM.test(d.url)?"&":"?")+"_="+x:"")}}(d.data&&d.hasContent&&d.contentType!==!1||c.contentType)&&v.setRequestHeader("Content-Type",d.contentType),d.ifModified&&(k=k||d.url,f.lastModified[k]&&v.setRequestHeader("If-Modified-Since",f.lastModified[k]),f.etag[k]&&v.setRequestHeader("If-None-Match",f.etag[k])),v.setRequestHeader("Accept",d.dataTypes[0]&&d.accepts[d.dataTypes[0]]?d.accepts[d.dataTypes[0]]+(d.dataTypes[0]!=="*"?", "+bX+"; q=0.01":""):d.accepts["*"]);for(u in d.headers)v.setRequestHeader(u,d.headers[u]);if(d.beforeSend&&(d.beforeSend.call(e,v,d)===!1||s===2)){v.abort();return!1}for(u in{success:1,error:1,complete:1})v[u](d[u]);p=b$(bU,d,c,v);if(!p)w(-1,"No Transport");else{v.readyState=1,t&&g.trigger("ajaxSend",[v,d]),d.async&&d.timeout>0&&(q=setTimeout(function(){v.abort("timeout")},d.timeout));try{s=1,p.send(l,w)}catch(z){if(s<2)w(-1,z);else throw z}}return v},param:function(a,c){var d=[],e=function(a,b){b=f.isFunction(b)?b():b,d[d.length]=encodeURIComponent(a)+"="+encodeURIComponent(b)};c===b&&(c=f.ajaxSettings.traditional);if(f.isArray(a)||a.jquery&&!f.isPlainObject(a))f.each(a,function(){e(this.name,this.value)});else for(var g in a)ca(g,a[g],c,e);return d.join("&").replace(bD,"+")}}),f.extend({active:0,lastModified:{},etag:{}});var cd=f.now(),ce=/(\=)\?(&|$)|\?\?/i;f.ajaxSetup({jsonp:"callback",jsonpCallback:function(){return f.expando+"_"+cd++}}),f.ajaxPrefilter("json jsonp",function(b,c,d){var e=b.contentType==="application/x-www-form-urlencoded"&&typeof b.data=="string";if(b.dataTypes[0]==="jsonp"||b.jsonp!==!1&&(ce.test(b.url)||e&&ce.test(b.data))){var g,h=b.jsonpCallback=f.isFunction(b.jsonpCallback)?b.jsonpCallback():b.jsonpCallback,i=a[h],j=b.url,k=b.data,l="$1"+h+"$2";b.jsonp!==!1&&(j=j.replace(ce,l),b.url===j&&(e&&(k=k.replace(ce,l)),b.data===k&&(j+=(/\?/.test(j)?"&":"?")+b.jsonp+"="+h))),b.url=j,b.data=k,a[h]=function(a){g=[a]},d.always(function(){a[h]=i,g&&f.isFunction(i)&&a[h](g[0])}),b.converters["script json"]=function(){g||f.error(h+" was not called");return g[0]},b.dataTypes[0]="json";return"script"}}),f.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/javascript|ecmascript/},converters:{"text script":function(a){f.globalEval(a);return a}}}),f.ajaxPrefilter("script",function(a){a.cache===b&&(a.cache=!1),a.crossDomain&&(a.type="GET",a.global=!1)}),f.ajaxTransport("script",function(a){if(a.crossDomain){var d,e=c.head||c.getElementsByTagName("head")[0]||c.documentElement;return{send:function(f,g){d=c.createElement("script"),d.async="async",a.scriptCharset&&(d.charset=a.scriptCharset),d.src=a.url,d.onload=d.onreadystatechange=function(a,c){if(c||!d.readyState||/loaded|complete/.test(d.readyState))d.onload=d.onreadystatechange=null,e&&d.parentNode&&e.removeChild(d),d=b,c||g(200,"success")},e.insertBefore(d,e.firstChild)},abort:function(){d&&d.onload(0,1)}}}});var cf=a.ActiveXObject?function(){for(var a in ch)ch[a](0,1)}:!1,cg=0,ch;f.ajaxSettings.xhr=a.ActiveXObject?function(){return!this.isLocal&&ci()||cj()}:ci,function(a){f.extend(f.support,{ajax:!!a,cors:!!a&&"withCredentials"in a})}(f.ajaxSettings.xhr()),f.support.ajax&&f.ajaxTransport(function(c){if(!c.crossDomain||f.support.cors){var d;return{send:function(e,g){var h=c.xhr(),i,j;c.username?h.open(c.type,c.url,c.async,c.username,c.password):h.open(c.type,c.url,c.async);if(c.xhrFields)for(j in c.xhrFields)h[j]=c.xhrFields[j];c.mimeType&&h.overrideMimeType&&h.overrideMimeType(c.mimeType),!c.crossDomain&&!e["X-Requested-With"]&&(e["X-Requested-With"]="XMLHttpRequest");try{for(j in e)h.setRequestHeader(j,e[j])}catch(k){}h.send(c.hasContent&&c.data||null),d=function(a,e){var j,k,l,m,n;try{if(d&&(e||h.readyState===4)){d=b,i&&(h.onreadystatechange=f.noop,cf&&delete ch[i]);if(e)h.readyState!==4&&h.abort();else{j=h.status,l=h.getAllResponseHeaders(),m={},n=h.responseXML,n&&n.documentElement&&(m.xml=n),m.text=h.responseText;try{k=h.statusText}catch(o){k=""}!j&&c.isLocal&&!c.crossDomain?j=m.text?200:404:j===1223&&(j=204)}}}catch(p){e||g(-1,p)}m&&g(j,k,m,l)},!c.async||h.readyState===4?d():(i=++cg,cf&&(ch||(ch={},f(a).unload(cf)),ch[i]=d),h.onreadystatechange=d)},abort:function(){d&&d(0,1)}}}});var ck={},cl,cm,cn=/^(?:toggle|show|hide)$/,co=/^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i,cp,cq=[["height","marginTop","marginBottom","paddingTop","paddingBottom"],["width","marginLeft","marginRight","paddingLeft","paddingRight"],["opacity"]],cr;f.fn.extend({show:function(a,b,c){var d,e;if(a||a===0)return this.animate(cu("show",3),a,b,c);for(var g=0,h=this.length;g<h;g++)d=this[g],d.style&&(e=d.style.display,!f._data(d,"olddisplay")&&e==="none"&&(e=d.style.display=""),e===""&&f.css(d,"display")==="none"&&f._data(d,"olddisplay",cv(d.nodeName)));for(g=0;g<h;g++){d=this[g];if(d.style){e=d.style.display;if(e===""||e==="none")d.style.display=f._data(d,"olddisplay")||""}}return this},hide:function(a,b,c){if(a||a===0)return this.animate(cu("hide",3),a,b,c);var d,e,g=0,h=this.length;for(;g<h;g++)d=this[g],d.style&&(e=f.css(d,"display"),e!=="none"&&!f._data(d,"olddisplay")&&f._data(d,"olddisplay",e));for(g=0;g<h;g++)this[g].style&&(this[g].style.display="none");return this},_toggle:f.fn.toggle,toggle:function(a,b,c){var d=typeof a=="boolean";f.isFunction(a)&&f.isFunction(b)?this._toggle.apply(this,arguments):a==null||d?this.each(function(){var b=d?a:f(this).is(":hidden");f(this)[b?"show":"hide"]()}):this.animate(cu("toggle",3),a,b,c);return this},fadeTo:function(a,b,c,d){return this.filter(":hidden").css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){function g(){e.queue===!1&&f._mark(this);var b=f.extend({},e),c=this.nodeType===1,d=c&&f(this).is(":hidden"),g,h,i,j,k,l,m,n,o;b.animatedProperties={};for(i in a){g=f.camelCase(i),i!==g&&(a[g]=a[i],delete a[i]),h=a[g],f.isArray(h)?(b.animatedProperties[g]=h[1],h=a[g]=h[0]):b.animatedProperties[g]=b.specialEasing&&b.specialEasing[g]||b.easing||"swing";if(h==="hide"&&d||h==="show"&&!d)return b.complete.call(this);c&&(g==="height"||g==="width")&&(b.overflow=[this.style.overflow,this.style.overflowX,this.style.overflowY],f.css(this,"display")==="inline"&&f.css(this,"float")==="none"&&(!f.support.inlineBlockNeedsLayout||cv(this.nodeName)==="inline"?this.style.display="inline-block":this.style.zoom=1))}b.overflow!=null&&(this.style.overflow="hidden");for(i in a)j=new f.fx(this,b,i),h=a[i],cn.test(h)?(o=f._data(this,"toggle"+i)||(h==="toggle"?d?"show":"hide":0),o?(f._data(this,"toggle"+i,o==="show"?"hide":"show"),j[o]()):j[h]()):(k=co.exec(h),l=j.cur(),k?(m=parseFloat(k[2]),n=k[3]||(f.cssNumber[i]?"":"px"),n!=="px"&&(f.style(this,i,(m||1)+n),l=(m||1)/j.cur()*l,f.style(this,i,l+n)),k[1]&&(m=(k[1]==="-="?-1:1)*m+l),j.custom(l,m,n)):j.custom(l,h,""));return!0}var e=f.speed(b,c,d);if(f.isEmptyObject(a))return this.each(e.complete,[!1]);a=f.extend({},a);return e.queue===!1?this.each(g):this.queue(e.queue,g)},stop:function(a,c,d){typeof a!="string"&&(d=c,c=a,a=b),c&&a!==!1&&this.queue(a||"fx",[]);return this.each(function(){function h(a,b,c){var e=b[c];f.removeData(a,c,!0),e.stop(d)}var b,c=!1,e=f.timers,g=f._data(this);d||f._unmark(!0,this);if(a==null)for(b in g)g[b]&&g[b].stop&&b.indexOf(".run")===b.length-4&&h(this,g,b);else g[b=a+".run"]&&g[b].stop&&h(this,g,b);for(b=e.length;b--;)e[b].elem===this&&(a==null||e[b].queue===a)&&(d?e[b](!0):e[b].saveState(),c=!0,e.splice(b,1));(!d||!c)&&f.dequeue(this,a)})}}),f.each({slideDown:cu("show",1),slideUp:cu("hide",1),slideToggle:cu("toggle",1),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){f.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),f.extend({speed:function(a,b,c){var d=a&&typeof a=="object"?f.extend({},a):{complete:c||!c&&b||f.isFunction(a)&&a,duration:a,easing:c&&b||b&&!f.isFunction(b)&&b};d.duration=f.fx.off?0:typeof d.duration=="number"?d.duration:d.duration in f.fx.speeds?f.fx.speeds[d.duration]:f.fx.speeds._default;if(d.queue==null||d.queue===!0)d.queue="fx";d.old=d.complete,d.complete=function(a){f.isFunction(d.old)&&d.old.call(this),d.queue?f.dequeue(this,d.queue):a!==!1&&f._unmark(this)};return d},easing:{linear:function(a,b,c,d){return c+d*a},swing:function(a,b,c,d){return(-Math.cos(a*Math.PI)/2+.5)*d+c}},timers:[],fx:function(a,b,c){this.options=b,this.elem=a,this.prop=c,b.orig=b.orig||{}}}),f.fx.prototype={update:function(){this.options.step&&this.options.step.call(this.elem,this.now,this),(f.fx.step[this.prop]||f.fx.step._default)(this)},cur:function(){if(this.elem[this.prop]!=null&&(!this.elem.style||this.elem.style[this.prop]==null))return this.elem[this.prop];var a,b=f.css(this.elem,this.prop);return isNaN(a=parseFloat(b))?!b||b==="auto"?0:b:a},custom:function(a,c,d){function h(a){return e.step(a)}var e=this,g=f.fx;this.startTime=cr||cs(),this.end=c,this.now=this.start=a,this.pos=this.state=0,this.unit=d||this.unit||(f.cssNumber[this.prop]?"":"px"),h.queue=this.options.queue,h.elem=this.elem,h.saveState=function(){e.options.hide&&f._data(e.elem,"fxshow"+e.prop)===b&&f._data(e.elem,"fxshow"+e.prop,e.start)},h()&&f.timers.push(h)&&!cp&&(cp=setInterval(g.tick,g.interval))},show:function(){var a=f._data(this.elem,"fxshow"+this.prop);this.options.orig[this.prop]=a||f.style(this.elem,this.prop),this.options.show=!0,a!==b?this.custom(this.cur(),a):this.custom(this.prop==="width"||this.prop==="height"?1:0,this.cur()),f(this.elem).show()},hide:function(){this.options.orig[this.prop]=f._data(this.elem,"fxshow"+this.prop)||f.style(this.elem,this.prop),this.options.hide=!0,this.custom(this.cur(),0)},step:function(a){var b,c,d,e=cr||cs(),g=!0,h=this.elem,i=this.options;if(a||e>=i.duration+this.startTime){this.now=this.end,this.pos=this.state=1,this.update(),i.animatedProperties[this.prop]=!0;for(b in i.animatedProperties)i.animatedProperties[b]!==!0&&(g=!1);if(g){i.overflow!=null&&!f.support.shrinkWrapBlocks&&f.each(["","X","Y"],function(a,b){h.style["overflow"+b]=i.overflow[a]}),i.hide&&f(h).hide();if(i.hide||i.show)for(b in i.animatedProperties)f.style(h,b,i.orig[b]),f.removeData(h,"fxshow"+b,!0),f.removeData(h,"toggle"+b,!0);d=i.complete,d&&(i.complete=!1,d.call(h))}return!1}i.duration==Infinity?this.now=e:(c=e-this.startTime,this.state=c/i.duration,this.pos=f.easing[i.animatedProperties[this.prop]](this.state,c,0,1,i.duration),this.now=this.start+(this.end-this.start)*this.pos),this.update();return!0}},f.extend(f.fx,{tick:function(){var a,b=f.timers,c=0;for(;c<b.length;c++)a=b[c],!a()&&b[c]===a&&b.splice(c--,1);b.length||f.fx.stop()},interval:13,stop:function(){clearInterval(cp),cp=null},speeds:{slow:600,fast:200,_default:400},step:{opacity:function(a){f.style(a.elem,"opacity",a.now)},_default:function(a){a.elem.style&&a.elem.style[a.prop]!=null?a.elem.style[a.prop]=a.now+a.unit:a.elem[a.prop]=a.now}}}),f.each(["width","height"],function(a,b){f.fx.step[b]=function(a){f.style(a.elem,b,Math.max(0,a.now)+a.unit)}}),f.expr&&f.expr.filters&&(f.expr.filters.animated=function(a){return f.grep(f.timers,function(b){return a===b.elem}).length});var cw=/^t(?:able|d|h)$/i,cx=/^(?:body|html)$/i;"getBoundingClientRect"in c.documentElement?f.fn.offset=function(a){var b=this[0],c;if(a)return this.each(function(b){f.offset.setOffset(this,a,b)});if(!b||!b.ownerDocument)return null;if(b===b.ownerDocument.body)return f.offset.bodyOffset(b);try{c=b.getBoundingClientRect()}catch(d){}var e=b.ownerDocument,g=e.documentElement;if(!c||!f.contains(g,b))return c?{top:c.top,left:c.left}:{top:0,left:0};var h=e.body,i=cy(e),j=g.clientTop||h.clientTop||0,k=g.clientLeft||h.clientLeft||0,l=i.pageYOffset||f.support.boxModel&&g.scrollTop||h.scrollTop,m=i.pageXOffset||f.support.boxModel&&g.scrollLeft||h.scrollLeft,n=c.top+l-j,o=c.left+m-k;return{top:n,left:o}}:f.fn.offset=function(a){var b=this[0];if(a)return this.each(function(b){f.offset.setOffset(this,a,b)});if(!b||!b.ownerDocument)return null;if(b===b.ownerDocument.body)return f.offset.bodyOffset(b);var c,d=b.offsetParent,e=b,g=b.ownerDocument,h=g.documentElement,i=g.body,j=g.defaultView,k=j?j.getComputedStyle(b,null):b.currentStyle,l=b.offsetTop,m=b.offsetLeft;while((b=b.parentNode)&&b!==i&&b!==h){if(f.support.fixedPosition&&k.position==="fixed")break;c=j?j.getComputedStyle(b,null):b.currentStyle,l-=b.scrollTop,m-=b.scrollLeft,b===d&&(l+=b.offsetTop,m+=b.offsetLeft,f.support.doesNotAddBorder&&(!f.support.doesAddBorderForTableAndCells||!cw.test(b.nodeName))&&(l+=parseFloat(c.borderTopWidth)||0,m+=parseFloat(c.borderLeftWidth)||0),e=d,d=b.offsetParent),f.support.subtractsBorderForOverflowNotVisible&&c.overflow!=="visible"&&(l+=parseFloat(c.borderTopWidth)||0,m+=parseFloat(c.borderLeftWidth)||0),k=c}if(k.position==="relative"||k.position==="static")l+=i.offsetTop,m+=i.offsetLeft;f.support.fixedPosition&&k.position==="fixed"&&(l+=Math.max(h.scrollTop,i.scrollTop),m+=Math.max(h.scrollLeft,i.scrollLeft));return{top:l,left:m}},f.offset={bodyOffset:function(a){var b=a.offsetTop,c=a.offsetLeft;f.support.doesNotIncludeMarginInBodyOffset&&(b+=parseFloat(f.css(a,"marginTop"))||0,c+=parseFloat(f.css(a,"marginLeft"))||0);return{top:b,left:c}},setOffset:function(a,b,c){var d=f.css(a,"position");d==="static"&&(a.style.position="relative");var e=f(a),g=e.offset(),h=f.css(a,"top"),i=f.css(a,"left"),j=(d==="absolute"||d==="fixed")&&f.inArray("auto",[h,i])>-1,k={},l={},m,n;j?(l=e.position(),m=l.top,n=l.left):(m=parseFloat(h)||0,n=parseFloat(i)||0),f.isFunction(b)&&(b=b.call(a,c,g)),b.top!=null&&(k.top=b.top-g.top+m),b.left!=null&&(k.left=b.left-g.left+n),"using"in b?b.using.call(a,k):e.css(k)}},f.fn.extend({position:function(){if(!this[0])return null;var a=this[0],b=this.offsetParent(),c=this.offset(),d=cx.test(b[0].nodeName)?{top:0,left:0}:b.offset();c.top-=parseFloat(f.css(a,"marginTop"))||0,c.left-=parseFloat(f.css(a,"marginLeft"))||0,d.top+=parseFloat(f.css(b[0],"borderTopWidth"))||0,d.left+=parseFloat(f.css(b[0],"borderLeftWidth"))||0;return{top:c.top-d.top,left:c.left-d.left}},offsetParent:function(){return this.map(function(){var a=this.offsetParent||c.body;while(a&&!cx.test(a.nodeName)&&f.css(a,"position")==="static")a=a.offsetParent;return a})}}),f.each(["Left","Top"],function(a,c){var d="scroll"+c;f.fn[d]=function(c){var e,g;if(c===b){e=this[0];if(!e)return null;g=cy(e);return g?"pageXOffset"in g?g[a?"pageYOffset":"pageXOffset"]:f.support.boxModel&&g.document.documentElement[d]||g.document.body[d]:e[d]}return this.each(function(){g=cy(this),g?g.scrollTo(a?f(g).scrollLeft():c,a?c:f(g).scrollTop()):this[d]=c})}}),f.each(["Height","Width"],function(a,c){var d=c.toLowerCase();f.fn["inner"+c]=function(){var a=this[0];return a?a.style?parseFloat(f.css(a,d,"padding")):this[d]():null},f.fn["outer"+c]=function(a){var b=this[0];return b?b.style?parseFloat(f.css(b,d,a?"margin":"border")):this[d]():null},f.fn[d]=function(a){var e=this[0];if(!e)return a==null?null:this;if(f.isFunction(a))return this.each(function(b){var c=f(this);c[d](a.call(this,b,c[d]()))});if(f.isWindow(e)){var g=e.document.documentElement["client"+c],h=e.document.body;return e.document.compatMode==="CSS1Compat"&&g||h&&h["client"+c]||g}if(e.nodeType===9)return Math.max(e.documentElement["client"+c],e.body["scroll"+c],e.documentElement["scroll"+c],e.body["offset"+c],e.documentElement["offset"+c]);if(a===b){var i=f.css(e,d),j=parseFloat(i);return f.isNumeric(j)?j:i}return this.css(d,typeof a=="string"?a:a+"px")}}),a.jQuery=a.$=f,typeof define=="function"&&define.amd&&define.amd.jQuery&&define("jquery",[],function(){return f})})(window);
	
	
/**
 * Cookie plugin
 *
 * Copyright (c) 2006 Klaus Hartl (stilbuero.de)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */

/**
 * Create a cookie with the given name and value and other optional parameters.
 *
 * @example $.cookie('the_cookie', 'the_value');
 * @desc Set the value of a cookie.
 * @example $.cookie('the_cookie', 'the_value', { expires: 7, path: '/', domain: 'jquery.com', secure: true });
 * @desc Create a cookie with all available options.
 * @example $.cookie('the_cookie', 'the_value');
 * @desc Create a session cookie.
 * @example $.cookie('the_cookie', null);
 * @desc Delete a cookie by passing null as value. Keep in mind that you have to use the same path and domain
 *       used when the cookie was set.
 *
 * @param String name The name of the cookie.
 * @param String value The value of the cookie.
 * @param Object options An object literal containing key/value pairs to provide optional cookie attributes.
 * @option Number|Date expires Either an integer specifying the expiration date from now on in days or a Date object.
 *                             If a negative value is specified (e.g. a date in the past), the cookie will be deleted.
 *                             If set to null or omitted, the cookie will be a session cookie and will not be retained
 *                             when the the browser exits.
 * @option String path The value of the path atribute of the cookie (default: path of page that created the cookie).
 * @option String domain The value of the domain attribute of the cookie (default: domain of page that created the cookie).
 * @option Boolean secure If true, the secure attribute of the cookie will be set and the cookie transmission will
 *                        require a secure protocol (like HTTPS).
 * @type undefined
 *
 * @name $.cookie
 * @cat Plugins/Cookie
 * @author Klaus Hartl/klaus.hartl@stilbuero.de
 */

/**
 * Get the value of a cookie with the given name.
 *
 * @example $.cookie('the_cookie');
 * @desc Get the value of a cookie.
 *
 * @param String name The name of the cookie.
 * @return The value of the cookie.
 * @type String
 *
 * @name $.cookie
 * @cat Plugins/Cookie
 * @author Klaus Hartl/klaus.hartl@stilbuero.de
 */
jQuery.cookie = function(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        // CAUTION: Needed to parenthesize options.path and options.domain
        // in the following expressions, otherwise they evaluate to undefined
        // in the packed version for some reason...
        var path = options.path ? '; path=' + (options.path) : '';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};


(function(window) {
	var p = [],
		push = function( m ) { return '\\' + p.push( m ) + '\\'; };
		pop = function( m, i ) { return p[i-1] };
		tabs = function( count ) { return new Array( count + 1 ).join( '\t' ); };

	window.JSONFormat = function( json ) {
		p = [];
		var out = "",
			indent = 0;
		
		// Extract backslashes and strings
		json = json
			.replace( /\\./g, push )
			.replace( /(".*?"|'.*?')/g, push )
			.replace( /\s+/, '' );		
		
		// Indent and insert newlines
		for( var i = 0; i < json.length; i++ ) {
			var c = json.charAt(i);
			
			switch(c) {
				case '{':
				case '[':
					out += c + "\n" + tabs(++indent);
					break;
				case '}':
				case ']':
					out += "\n" + tabs(--indent) + c;
					break;
				case ',':
					out += ",\n" + tabs(indent);
					break;
				case ':':
					out += ": ";
					break;
				default:
					out += c;
					break;      
			}					
		}
		
		// Strip whitespace from numeric arrays and put backslashes 
		// and strings back in
		out = out
			.replace( /\[[\d,\s]+?\]/g, function(m){ return m.replace(/\s/g,''); } ) 
			.replace( /\\(\d+)\\/g, pop );
		
		return out;
	};
})(window);
},{}],30:[function(require,module,exports){
/*!
 * jQuery UI 1.8.1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI
 */
jQuery.ui||function(c){c.ui={version:"1.8.1",plugin:{add:function(a,b,d){a=c.ui[a].prototype;for(var e in d){a.plugins[e]=a.plugins[e]||[];a.plugins[e].push([b,d[e]])}},call:function(a,b,d){if((b=a.plugins[b])&&a.element[0].parentNode)for(var e=0;e<b.length;e++)a.options[b[e][0]]&&b[e][1].apply(a.element,d)}},contains:function(a,b){return document.compareDocumentPosition?a.compareDocumentPosition(b)&16:a!==b&&a.contains(b)},hasScroll:function(a,b){if(c(a).css("overflow")=="hidden")return false;
b=b&&b=="left"?"scrollLeft":"scrollTop";var d=false;if(a[b]>0)return true;a[b]=1;d=a[b]>0;a[b]=0;return d},isOverAxis:function(a,b,d){return a>b&&a<b+d},isOver:function(a,b,d,e,f,g){return c.ui.isOverAxis(a,d,f)&&c.ui.isOverAxis(b,e,g)},keyCode:{ALT:18,BACKSPACE:8,CAPS_LOCK:20,COMMA:188,CONTROL:17,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,INSERT:45,LEFT:37,NUMPAD_ADD:107,NUMPAD_DECIMAL:110,NUMPAD_DIVIDE:111,NUMPAD_ENTER:108,NUMPAD_MULTIPLY:106,NUMPAD_SUBTRACT:109,PAGE_DOWN:34,PAGE_UP:33,
PERIOD:190,RIGHT:39,SHIFT:16,SPACE:32,TAB:9,UP:38}};c.fn.extend({_focus:c.fn.focus,focus:function(a,b){return typeof a==="number"?this.each(function(){var d=this;setTimeout(function(){c(d).focus();b&&b.call(d)},a)}):this._focus.apply(this,arguments)},enableSelection:function(){return this.attr("unselectable","off").css("MozUserSelect","")},disableSelection:function(){return this.attr("unselectable","on").css("MozUserSelect","none")},scrollParent:function(){var a;a=c.browser.msie&&/(static|relative)/.test(this.css("position"))||
/absolute/.test(this.css("position"))?this.parents().filter(function(){return/(relative|absolute|fixed)/.test(c.curCSS(this,"position",1))&&/(auto|scroll)/.test(c.curCSS(this,"overflow",1)+c.curCSS(this,"overflow-y",1)+c.curCSS(this,"overflow-x",1))}).eq(0):this.parents().filter(function(){return/(auto|scroll)/.test(c.curCSS(this,"overflow",1)+c.curCSS(this,"overflow-y",1)+c.curCSS(this,"overflow-x",1))}).eq(0);return/fixed/.test(this.css("position"))||!a.length?c(document):a},zIndex:function(a){if(a!==
undefined)return this.css("zIndex",a);if(this.length){a=c(this[0]);for(var b;a.length&&a[0]!==document;){b=a.css("position");if(b=="absolute"||b=="relative"||b=="fixed"){b=parseInt(a.css("zIndex"));if(!isNaN(b)&&b!=0)return b}a=a.parent()}}return 0}});c.extend(c.expr[":"],{data:function(a,b,d){return!!c.data(a,d[3])},focusable:function(a){var b=a.nodeName.toLowerCase(),d=c.attr(a,"tabindex");return(/input|select|textarea|button|object/.test(b)?!a.disabled:"a"==b||"area"==b?a.href||!isNaN(d):!isNaN(d))&&
!c(a)["area"==b?"parents":"closest"](":hidden").length},tabbable:function(a){var b=c.attr(a,"tabindex");return(isNaN(b)||b>=0)&&c(a).is(":focusable")}})}(jQuery);
;/*!
 * jQuery UI Widget 1.8.1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Widget
 */
(function(b){var j=b.fn.remove;b.fn.remove=function(a,c){return this.each(function(){if(!c)if(!a||b.filter(a,[this]).length)b("*",this).add(this).each(function(){b(this).triggerHandler("remove")});return j.call(b(this),a,c)})};b.widget=function(a,c,d){var e=a.split(".")[0],f;a=a.split(".")[1];f=e+"-"+a;if(!d){d=c;c=b.Widget}b.expr[":"][f]=function(h){return!!b.data(h,a)};b[e]=b[e]||{};b[e][a]=function(h,g){arguments.length&&this._createWidget(h,g)};c=new c;c.options=b.extend({},c.options);b[e][a].prototype=
b.extend(true,c,{namespace:e,widgetName:a,widgetEventPrefix:b[e][a].prototype.widgetEventPrefix||a,widgetBaseClass:f},d);b.widget.bridge(a,b[e][a])};b.widget.bridge=function(a,c){b.fn[a]=function(d){var e=typeof d==="string",f=Array.prototype.slice.call(arguments,1),h=this;d=!e&&f.length?b.extend.apply(null,[true,d].concat(f)):d;if(e&&d.substring(0,1)==="_")return h;e?this.each(function(){var g=b.data(this,a),i=g&&b.isFunction(g[d])?g[d].apply(g,f):g;if(i!==g&&i!==undefined){h=i;return false}}):this.each(function(){var g=
b.data(this,a);if(g){d&&g.option(d);g._init()}else b.data(this,a,new c(d,this))});return h}};b.Widget=function(a,c){arguments.length&&this._createWidget(a,c)};b.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",options:{disabled:false},_createWidget:function(a,c){this.element=b(c).data(this.widgetName,this);this.options=b.extend(true,{},this.options,b.metadata&&b.metadata.get(c)[this.widgetName],a);var d=this;this.element.bind("remove."+this.widgetName,function(){d.destroy()});this._create();
this._init()},_create:function(){},_init:function(){},destroy:function(){this.element.unbind("."+this.widgetName).removeData(this.widgetName);this.widget().unbind("."+this.widgetName).removeAttr("aria-disabled").removeClass(this.widgetBaseClass+"-disabled ui-state-disabled")},widget:function(){return this.element},option:function(a,c){var d=a,e=this;if(arguments.length===0)return b.extend({},e.options);if(typeof a==="string"){if(c===undefined)return this.options[a];d={};d[a]=c}b.each(d,function(f,
h){e._setOption(f,h)});return e},_setOption:function(a,c){this.options[a]=c;if(a==="disabled")this.widget()[c?"addClass":"removeClass"](this.widgetBaseClass+"-disabled ui-state-disabled").attr("aria-disabled",c);return this},enable:function(){return this._setOption("disabled",false)},disable:function(){return this._setOption("disabled",true)},_trigger:function(a,c,d){var e=this.options[a];c=b.Event(c);c.type=(a===this.widgetEventPrefix?a:this.widgetEventPrefix+a).toLowerCase();d=d||{};if(c.originalEvent){a=
b.event.props.length;for(var f;a;){f=b.event.props[--a];c[f]=c.originalEvent[f]}}this.element.trigger(c,d);return!(b.isFunction(e)&&e.call(this.element[0],c,d)===false||c.isDefaultPrevented())}}})(jQuery);
;/*!
 * jQuery UI Mouse 1.8.1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Mouse
 *
 * Depends:
 *	jquery.ui.widget.js
 */
(function(c){c.widget("ui.mouse",{options:{cancel:":input,option",distance:1,delay:0},_mouseInit:function(){var a=this;this.element.bind("mousedown."+this.widgetName,function(b){return a._mouseDown(b)}).bind("click."+this.widgetName,function(b){if(a._preventClickEvent){a._preventClickEvent=false;b.stopImmediatePropagation();return false}});this.started=false},_mouseDestroy:function(){this.element.unbind("."+this.widgetName)},_mouseDown:function(a){a.originalEvent=a.originalEvent||{};if(!a.originalEvent.mouseHandled){this._mouseStarted&&
this._mouseUp(a);this._mouseDownEvent=a;var b=this,e=a.which==1,f=typeof this.options.cancel=="string"?c(a.target).parents().add(a.target).filter(this.options.cancel).length:false;if(!e||f||!this._mouseCapture(a))return true;this.mouseDelayMet=!this.options.delay;if(!this.mouseDelayMet)this._mouseDelayTimer=setTimeout(function(){b.mouseDelayMet=true},this.options.delay);if(this._mouseDistanceMet(a)&&this._mouseDelayMet(a)){this._mouseStarted=this._mouseStart(a)!==false;if(!this._mouseStarted){a.preventDefault();
return true}}this._mouseMoveDelegate=function(d){return b._mouseMove(d)};this._mouseUpDelegate=function(d){return b._mouseUp(d)};c(document).bind("mousemove."+this.widgetName,this._mouseMoveDelegate).bind("mouseup."+this.widgetName,this._mouseUpDelegate);c.browser.safari||a.preventDefault();return a.originalEvent.mouseHandled=true}},_mouseMove:function(a){if(c.browser.msie&&!a.button)return this._mouseUp(a);if(this._mouseStarted){this._mouseDrag(a);return a.preventDefault()}if(this._mouseDistanceMet(a)&&
this._mouseDelayMet(a))(this._mouseStarted=this._mouseStart(this._mouseDownEvent,a)!==false)?this._mouseDrag(a):this._mouseUp(a);return!this._mouseStarted},_mouseUp:function(a){c(document).unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate);if(this._mouseStarted){this._mouseStarted=false;this._preventClickEvent=a.target==this._mouseDownEvent.target;this._mouseStop(a)}return false},_mouseDistanceMet:function(a){return Math.max(Math.abs(this._mouseDownEvent.pageX-
a.pageX),Math.abs(this._mouseDownEvent.pageY-a.pageY))>=this.options.distance},_mouseDelayMet:function(){return this.mouseDelayMet},_mouseStart:function(){},_mouseDrag:function(){},_mouseStop:function(){},_mouseCapture:function(){return true}})})(jQuery);
;/*
 * jQuery UI Sortable 1.8.1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Sortables
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */
(function(d){d.widget("ui.sortable",d.ui.mouse,{widgetEventPrefix:"sort",options:{appendTo:"parent",axis:false,connectWith:false,containment:false,cursor:"auto",cursorAt:false,dropOnEmpty:true,forcePlaceholderSize:false,forceHelperSize:false,grid:false,handle:false,helper:"original",items:"> *",opacity:false,placeholder:false,revert:false,scroll:true,scrollSensitivity:20,scrollSpeed:20,scope:"default",tolerance:"intersect",zIndex:1E3},_create:function(){this.containerCache={};this.element.addClass("ui-sortable");
this.refresh();this.floating=this.items.length?/left|right/.test(this.items[0].item.css("float")):false;this.offset=this.element.offset();this._mouseInit()},destroy:function(){this.element.removeClass("ui-sortable ui-sortable-disabled").removeData("sortable").unbind(".sortable");this._mouseDestroy();for(var a=this.items.length-1;a>=0;a--)this.items[a].item.removeData("sortable-item");return this},_setOption:function(a,b){if(a==="disabled"){this.options[a]=b;this.widget()[b?"addClass":"removeClass"]("ui-sortable-disabled")}else d.Widget.prototype._setOption.apply(self,
arguments)},_mouseCapture:function(a,b){if(this.reverting)return false;if(this.options.disabled||this.options.type=="static")return false;this._refreshItems(a);var c=null,e=this;d(a.target).parents().each(function(){if(d.data(this,"sortable-item")==e){c=d(this);return false}});if(d.data(a.target,"sortable-item")==e)c=d(a.target);if(!c)return false;if(this.options.handle&&!b){var f=false;d(this.options.handle,c).find("*").andSelf().each(function(){if(this==a.target)f=true});if(!f)return false}this.currentItem=
c;this._removeCurrentsFromItems();return true},_mouseStart:function(a,b,c){b=this.options;var e=this;this.currentContainer=this;this.refreshPositions();this.helper=this._createHelper(a);this._cacheHelperProportions();this._cacheMargins();this.scrollParent=this.helper.scrollParent();this.offset=this.currentItem.offset();this.offset={top:this.offset.top-this.margins.top,left:this.offset.left-this.margins.left};this.helper.css("position","absolute");this.cssPosition=this.helper.css("position");d.extend(this.offset,
{click:{left:a.pageX-this.offset.left,top:a.pageY-this.offset.top},parent:this._getParentOffset(),relative:this._getRelativeOffset()});this.originalPosition=this._generatePosition(a);this.originalPageX=a.pageX;this.originalPageY=a.pageY;b.cursorAt&&this._adjustOffsetFromHelper(b.cursorAt);this.domPosition={prev:this.currentItem.prev()[0],parent:this.currentItem.parent()[0]};this.helper[0]!=this.currentItem[0]&&this.currentItem.hide();this._createPlaceholder();b.containment&&this._setContainment();
if(b.cursor){if(d("body").css("cursor"))this._storedCursor=d("body").css("cursor");d("body").css("cursor",b.cursor)}if(b.opacity){if(this.helper.css("opacity"))this._storedOpacity=this.helper.css("opacity");this.helper.css("opacity",b.opacity)}if(b.zIndex){if(this.helper.css("zIndex"))this._storedZIndex=this.helper.css("zIndex");this.helper.css("zIndex",b.zIndex)}if(this.scrollParent[0]!=document&&this.scrollParent[0].tagName!="HTML")this.overflowOffset=this.scrollParent.offset();this._trigger("start",
a,this._uiHash());this._preserveHelperProportions||this._cacheHelperProportions();if(!c)for(c=this.containers.length-1;c>=0;c--)this.containers[c]._trigger("activate",a,e._uiHash(this));if(d.ui.ddmanager)d.ui.ddmanager.current=this;d.ui.ddmanager&&!b.dropBehaviour&&d.ui.ddmanager.prepareOffsets(this,a);this.dragging=true;this.helper.addClass("ui-sortable-helper");this._mouseDrag(a);return true},_mouseDrag:function(a){this.position=this._generatePosition(a);this.positionAbs=this._convertPositionTo("absolute");
if(!this.lastPositionAbs)this.lastPositionAbs=this.positionAbs;if(this.options.scroll){var b=this.options,c=false;if(this.scrollParent[0]!=document&&this.scrollParent[0].tagName!="HTML"){if(this.overflowOffset.top+this.scrollParent[0].offsetHeight-a.pageY<b.scrollSensitivity)this.scrollParent[0].scrollTop=c=this.scrollParent[0].scrollTop+b.scrollSpeed;else if(a.pageY-this.overflowOffset.top<b.scrollSensitivity)this.scrollParent[0].scrollTop=c=this.scrollParent[0].scrollTop-b.scrollSpeed;if(this.overflowOffset.left+
this.scrollParent[0].offsetWidth-a.pageX<b.scrollSensitivity)this.scrollParent[0].scrollLeft=c=this.scrollParent[0].scrollLeft+b.scrollSpeed;else if(a.pageX-this.overflowOffset.left<b.scrollSensitivity)this.scrollParent[0].scrollLeft=c=this.scrollParent[0].scrollLeft-b.scrollSpeed}else{if(a.pageY-d(document).scrollTop()<b.scrollSensitivity)c=d(document).scrollTop(d(document).scrollTop()-b.scrollSpeed);else if(d(window).height()-(a.pageY-d(document).scrollTop())<b.scrollSensitivity)c=d(document).scrollTop(d(document).scrollTop()+
b.scrollSpeed);if(a.pageX-d(document).scrollLeft()<b.scrollSensitivity)c=d(document).scrollLeft(d(document).scrollLeft()-b.scrollSpeed);else if(d(window).width()-(a.pageX-d(document).scrollLeft())<b.scrollSensitivity)c=d(document).scrollLeft(d(document).scrollLeft()+b.scrollSpeed)}c!==false&&d.ui.ddmanager&&!b.dropBehaviour&&d.ui.ddmanager.prepareOffsets(this,a)}this.positionAbs=this._convertPositionTo("absolute");if(!this.options.axis||this.options.axis!="y")this.helper[0].style.left=this.position.left+
"px";if(!this.options.axis||this.options.axis!="x")this.helper[0].style.top=this.position.top+"px";for(b=this.items.length-1;b>=0;b--){c=this.items[b];var e=c.item[0],f=this._intersectsWithPointer(c);if(f)if(e!=this.currentItem[0]&&this.placeholder[f==1?"next":"prev"]()[0]!=e&&!d.ui.contains(this.placeholder[0],e)&&(this.options.type=="semi-dynamic"?!d.ui.contains(this.element[0],e):true)){this.direction=f==1?"down":"up";if(this.options.tolerance=="pointer"||this._intersectsWithSides(c))this._rearrange(a,
c);else break;this._trigger("change",a,this._uiHash());break}}this._contactContainers(a);d.ui.ddmanager&&d.ui.ddmanager.drag(this,a);this._trigger("sort",a,this._uiHash());this.lastPositionAbs=this.positionAbs;return false},_mouseStop:function(a,b){if(a){d.ui.ddmanager&&!this.options.dropBehaviour&&d.ui.ddmanager.drop(this,a);if(this.options.revert){var c=this;b=c.placeholder.offset();c.reverting=true;d(this.helper).animate({left:b.left-this.offset.parent.left-c.margins.left+(this.offsetParent[0]==
document.body?0:this.offsetParent[0].scrollLeft),top:b.top-this.offset.parent.top-c.margins.top+(this.offsetParent[0]==document.body?0:this.offsetParent[0].scrollTop)},parseInt(this.options.revert,10)||500,function(){c._clear(a)})}else this._clear(a,b);return false}},cancel:function(){var a=this;if(this.dragging){this._mouseUp();this.options.helper=="original"?this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper"):this.currentItem.show();for(var b=this.containers.length-1;b>=0;b--){this.containers[b]._trigger("deactivate",
null,a._uiHash(this));if(this.containers[b].containerCache.over){this.containers[b]._trigger("out",null,a._uiHash(this));this.containers[b].containerCache.over=0}}}this.placeholder[0].parentNode&&this.placeholder[0].parentNode.removeChild(this.placeholder[0]);this.options.helper!="original"&&this.helper&&this.helper[0].parentNode&&this.helper.remove();d.extend(this,{helper:null,dragging:false,reverting:false,_noFinalSort:null});this.domPosition.prev?d(this.domPosition.prev).after(this.currentItem):
d(this.domPosition.parent).prepend(this.currentItem);return this},serialize:function(a){var b=this._getItemsAsjQuery(a&&a.connected),c=[];a=a||{};d(b).each(function(){var e=(d(a.item||this).attr(a.attribute||"id")||"").match(a.expression||/(.+)[-=_](.+)/);if(e)c.push((a.key||e[1]+"[]")+"="+(a.key&&a.expression?e[1]:e[2]))});return c.join("&")},toArray:function(a){var b=this._getItemsAsjQuery(a&&a.connected),c=[];a=a||{};b.each(function(){c.push(d(a.item||this).attr(a.attribute||"id")||"")});return c},
_intersectsWith:function(a){var b=this.positionAbs.left,c=b+this.helperProportions.width,e=this.positionAbs.top,f=e+this.helperProportions.height,g=a.left,h=g+a.width,i=a.top,k=i+a.height,j=this.offset.click.top,l=this.offset.click.left;j=e+j>i&&e+j<k&&b+l>g&&b+l<h;return this.options.tolerance=="pointer"||this.options.forcePointerForContainers||this.options.tolerance!="pointer"&&this.helperProportions[this.floating?"width":"height"]>a[this.floating?"width":"height"]?j:g<b+this.helperProportions.width/
2&&c-this.helperProportions.width/2<h&&i<e+this.helperProportions.height/2&&f-this.helperProportions.height/2<k},_intersectsWithPointer:function(a){var b=d.ui.isOverAxis(this.positionAbs.top+this.offset.click.top,a.top,a.height);a=d.ui.isOverAxis(this.positionAbs.left+this.offset.click.left,a.left,a.width);b=b&&a;a=this._getDragVerticalDirection();var c=this._getDragHorizontalDirection();if(!b)return false;return this.floating?c&&c=="right"||a=="down"?2:1:a&&(a=="down"?2:1)},_intersectsWithSides:function(a){var b=
d.ui.isOverAxis(this.positionAbs.top+this.offset.click.top,a.top+a.height/2,a.height);a=d.ui.isOverAxis(this.positionAbs.left+this.offset.click.left,a.left+a.width/2,a.width);var c=this._getDragVerticalDirection(),e=this._getDragHorizontalDirection();return this.floating&&e?e=="right"&&a||e=="left"&&!a:c&&(c=="down"&&b||c=="up"&&!b)},_getDragVerticalDirection:function(){var a=this.positionAbs.top-this.lastPositionAbs.top;return a!=0&&(a>0?"down":"up")},_getDragHorizontalDirection:function(){var a=
this.positionAbs.left-this.lastPositionAbs.left;return a!=0&&(a>0?"right":"left")},refresh:function(a){this._refreshItems(a);this.refreshPositions();return this},_connectWith:function(){var a=this.options;return a.connectWith.constructor==String?[a.connectWith]:a.connectWith},_getItemsAsjQuery:function(a){var b=[],c=[],e=this._connectWith();if(e&&a)for(a=e.length-1;a>=0;a--)for(var f=d(e[a]),g=f.length-1;g>=0;g--){var h=d.data(f[g],"sortable");if(h&&h!=this&&!h.options.disabled)c.push([d.isFunction(h.options.items)?
h.options.items.call(h.element):d(h.options.items,h.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"),h])}c.push([d.isFunction(this.options.items)?this.options.items.call(this.element,null,{options:this.options,item:this.currentItem}):d(this.options.items,this.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"),this]);for(a=c.length-1;a>=0;a--)c[a][0].each(function(){b.push(this)});return d(b)},_removeCurrentsFromItems:function(){for(var a=this.currentItem.find(":data(sortable-item)"),
b=0;b<this.items.length;b++)for(var c=0;c<a.length;c++)a[c]==this.items[b].item[0]&&this.items.splice(b,1)},_refreshItems:function(a){this.items=[];this.containers=[this];var b=this.items,c=[[d.isFunction(this.options.items)?this.options.items.call(this.element[0],a,{item:this.currentItem}):d(this.options.items,this.element),this]],e=this._connectWith();if(e)for(var f=e.length-1;f>=0;f--)for(var g=d(e[f]),h=g.length-1;h>=0;h--){var i=d.data(g[h],"sortable");if(i&&i!=this&&!i.options.disabled){c.push([d.isFunction(i.options.items)?
i.options.items.call(i.element[0],a,{item:this.currentItem}):d(i.options.items,i.element),i]);this.containers.push(i)}}for(f=c.length-1;f>=0;f--){a=c[f][1];e=c[f][0];h=0;for(g=e.length;h<g;h++){i=d(e[h]);i.data("sortable-item",a);b.push({item:i,instance:a,width:0,height:0,left:0,top:0})}}},refreshPositions:function(a){if(this.offsetParent&&this.helper)this.offset.parent=this._getParentOffset();for(var b=this.items.length-1;b>=0;b--){var c=this.items[b],e=this.options.toleranceElement?d(this.options.toleranceElement,
c.item):c.item;if(!a){c.width=e.outerWidth();c.height=e.outerHeight()}e=e.offset();c.left=e.left;c.top=e.top}if(this.options.custom&&this.options.custom.refreshContainers)this.options.custom.refreshContainers.call(this);else for(b=this.containers.length-1;b>=0;b--){e=this.containers[b].element.offset();this.containers[b].containerCache.left=e.left;this.containers[b].containerCache.top=e.top;this.containers[b].containerCache.width=this.containers[b].element.outerWidth();this.containers[b].containerCache.height=
this.containers[b].element.outerHeight()}return this},_createPlaceholder:function(a){var b=a||this,c=b.options;if(!c.placeholder||c.placeholder.constructor==String){var e=c.placeholder;c.placeholder={element:function(){var f=d(document.createElement(b.currentItem[0].nodeName)).addClass(e||b.currentItem[0].className+" ui-sortable-placeholder").removeClass("ui-sortable-helper")[0];if(!e)f.style.visibility="hidden";return f},update:function(f,g){if(!(e&&!c.forcePlaceholderSize)){g.height()||g.height(b.currentItem.innerHeight()-
parseInt(b.currentItem.css("paddingTop")||0,10)-parseInt(b.currentItem.css("paddingBottom")||0,10));g.width()||g.width(b.currentItem.innerWidth()-parseInt(b.currentItem.css("paddingLeft")||0,10)-parseInt(b.currentItem.css("paddingRight")||0,10))}}}}b.placeholder=d(c.placeholder.element.call(b.element,b.currentItem));b.currentItem.after(b.placeholder);c.placeholder.update(b,b.placeholder)},_contactContainers:function(a){for(var b=null,c=null,e=this.containers.length-1;e>=0;e--)if(!d.ui.contains(this.currentItem[0],
this.containers[e].element[0]))if(this._intersectsWith(this.containers[e].containerCache)){if(!(b&&d.ui.contains(this.containers[e].element[0],b.element[0]))){b=this.containers[e];c=e}}else if(this.containers[e].containerCache.over){this.containers[e]._trigger("out",a,this._uiHash(this));this.containers[e].containerCache.over=0}if(b)if(this.containers.length===1){this.containers[c]._trigger("over",a,this._uiHash(this));this.containers[c].containerCache.over=1}else if(this.currentContainer!=this.containers[c]){b=
1E4;e=null;for(var f=this.positionAbs[this.containers[c].floating?"left":"top"],g=this.items.length-1;g>=0;g--)if(d.ui.contains(this.containers[c].element[0],this.items[g].item[0])){var h=this.items[g][this.containers[c].floating?"left":"top"];if(Math.abs(h-f)<b){b=Math.abs(h-f);e=this.items[g]}}if(e||this.options.dropOnEmpty){this.currentContainer=this.containers[c];e?this._rearrange(a,e,null,true):this._rearrange(a,null,this.containers[c].element,true);this._trigger("change",a,this._uiHash());this.containers[c]._trigger("change",
a,this._uiHash(this));this.options.placeholder.update(this.currentContainer,this.placeholder);this.containers[c]._trigger("over",a,this._uiHash(this));this.containers[c].containerCache.over=1}}},_createHelper:function(a){var b=this.options;a=d.isFunction(b.helper)?d(b.helper.apply(this.element[0],[a,this.currentItem])):b.helper=="clone"?this.currentItem.clone():this.currentItem;a.parents("body").length||d(b.appendTo!="parent"?b.appendTo:this.currentItem[0].parentNode)[0].appendChild(a[0]);if(a[0]==
this.currentItem[0])this._storedCSS={width:this.currentItem[0].style.width,height:this.currentItem[0].style.height,position:this.currentItem.css("position"),top:this.currentItem.css("top"),left:this.currentItem.css("left")};if(a[0].style.width==""||b.forceHelperSize)a.width(this.currentItem.width());if(a[0].style.height==""||b.forceHelperSize)a.height(this.currentItem.height());return a},_adjustOffsetFromHelper:function(a){if(typeof a=="string")a=a.split(" ");if(d.isArray(a))a={left:+a[0],top:+a[1]||
0};if("left"in a)this.offset.click.left=a.left+this.margins.left;if("right"in a)this.offset.click.left=this.helperProportions.width-a.right+this.margins.left;if("top"in a)this.offset.click.top=a.top+this.margins.top;if("bottom"in a)this.offset.click.top=this.helperProportions.height-a.bottom+this.margins.top},_getParentOffset:function(){this.offsetParent=this.helper.offsetParent();var a=this.offsetParent.offset();if(this.cssPosition=="absolute"&&this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],
this.offsetParent[0])){a.left+=this.scrollParent.scrollLeft();a.top+=this.scrollParent.scrollTop()}if(this.offsetParent[0]==document.body||this.offsetParent[0].tagName&&this.offsetParent[0].tagName.toLowerCase()=="html"&&d.browser.msie)a={top:0,left:0};return{top:a.top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:a.left+(parseInt(this.offsetParent.css("borderLeftWidth"),10)||0)}},_getRelativeOffset:function(){if(this.cssPosition=="relative"){var a=this.currentItem.position();return{top:a.top-
(parseInt(this.helper.css("top"),10)||0)+this.scrollParent.scrollTop(),left:a.left-(parseInt(this.helper.css("left"),10)||0)+this.scrollParent.scrollLeft()}}else return{top:0,left:0}},_cacheMargins:function(){this.margins={left:parseInt(this.currentItem.css("marginLeft"),10)||0,top:parseInt(this.currentItem.css("marginTop"),10)||0}},_cacheHelperProportions:function(){this.helperProportions={width:this.helper.outerWidth(),height:this.helper.outerHeight()}},_setContainment:function(){var a=this.options;
if(a.containment=="parent")a.containment=this.helper[0].parentNode;if(a.containment=="document"||a.containment=="window")this.containment=[0-this.offset.relative.left-this.offset.parent.left,0-this.offset.relative.top-this.offset.parent.top,d(a.containment=="document"?document:window).width()-this.helperProportions.width-this.margins.left,(d(a.containment=="document"?document:window).height()||document.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top];if(!/^(document|window|parent)$/.test(a.containment)){var b=
d(a.containment)[0];a=d(a.containment).offset();var c=d(b).css("overflow")!="hidden";this.containment=[a.left+(parseInt(d(b).css("borderLeftWidth"),10)||0)+(parseInt(d(b).css("paddingLeft"),10)||0)-this.margins.left,a.top+(parseInt(d(b).css("borderTopWidth"),10)||0)+(parseInt(d(b).css("paddingTop"),10)||0)-this.margins.top,a.left+(c?Math.max(b.scrollWidth,b.offsetWidth):b.offsetWidth)-(parseInt(d(b).css("borderLeftWidth"),10)||0)-(parseInt(d(b).css("paddingRight"),10)||0)-this.helperProportions.width-
this.margins.left,a.top+(c?Math.max(b.scrollHeight,b.offsetHeight):b.offsetHeight)-(parseInt(d(b).css("borderTopWidth"),10)||0)-(parseInt(d(b).css("paddingBottom"),10)||0)-this.helperProportions.height-this.margins.top]}},_convertPositionTo:function(a,b){if(!b)b=this.position;a=a=="absolute"?1:-1;var c=this.cssPosition=="absolute"&&!(this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],this.offsetParent[0]))?this.offsetParent:this.scrollParent,e=/(html|body)/i.test(c[0].tagName);return{top:b.top+
this.offset.relative.top*a+this.offset.parent.top*a-(d.browser.safari&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollTop():e?0:c.scrollTop())*a),left:b.left+this.offset.relative.left*a+this.offset.parent.left*a-(d.browser.safari&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():e?0:c.scrollLeft())*a)}},_generatePosition:function(a){var b=this.options,c=this.cssPosition=="absolute"&&!(this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],
this.offsetParent[0]))?this.offsetParent:this.scrollParent,e=/(html|body)/i.test(c[0].tagName);if(this.cssPosition=="relative"&&!(this.scrollParent[0]!=document&&this.scrollParent[0]!=this.offsetParent[0]))this.offset.relative=this._getRelativeOffset();var f=a.pageX,g=a.pageY;if(this.originalPosition){if(this.containment){if(a.pageX-this.offset.click.left<this.containment[0])f=this.containment[0]+this.offset.click.left;if(a.pageY-this.offset.click.top<this.containment[1])g=this.containment[1]+this.offset.click.top;
if(a.pageX-this.offset.click.left>this.containment[2])f=this.containment[2]+this.offset.click.left;if(a.pageY-this.offset.click.top>this.containment[3])g=this.containment[3]+this.offset.click.top}if(b.grid){g=this.originalPageY+Math.round((g-this.originalPageY)/b.grid[1])*b.grid[1];g=this.containment?!(g-this.offset.click.top<this.containment[1]||g-this.offset.click.top>this.containment[3])?g:!(g-this.offset.click.top<this.containment[1])?g-b.grid[1]:g+b.grid[1]:g;f=this.originalPageX+Math.round((f-
this.originalPageX)/b.grid[0])*b.grid[0];f=this.containment?!(f-this.offset.click.left<this.containment[0]||f-this.offset.click.left>this.containment[2])?f:!(f-this.offset.click.left<this.containment[0])?f-b.grid[0]:f+b.grid[0]:f}}return{top:g-this.offset.click.top-this.offset.relative.top-this.offset.parent.top+(d.browser.safari&&this.cssPosition=="fixed"?0:this.cssPosition=="fixed"?-this.scrollParent.scrollTop():e?0:c.scrollTop()),left:f-this.offset.click.left-this.offset.relative.left-this.offset.parent.left+
(d.browser.safari&&this.cssPosition=="fixed"?0:this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():e?0:c.scrollLeft())}},_rearrange:function(a,b,c,e){c?c[0].appendChild(this.placeholder[0]):b.item[0].parentNode.insertBefore(this.placeholder[0],this.direction=="down"?b.item[0]:b.item[0].nextSibling);this.counter=this.counter?++this.counter:1;var f=this,g=this.counter;window.setTimeout(function(){g==f.counter&&f.refreshPositions(!e)},0)},_clear:function(a,b){this.reverting=false;var c=[];!this._noFinalSort&&
this.currentItem[0].parentNode&&this.placeholder.before(this.currentItem);this._noFinalSort=null;if(this.helper[0]==this.currentItem[0]){for(var e in this._storedCSS)if(this._storedCSS[e]=="auto"||this._storedCSS[e]=="static")this._storedCSS[e]="";this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper")}else this.currentItem.show();this.fromOutside&&!b&&c.push(function(f){this._trigger("receive",f,this._uiHash(this.fromOutside))});if((this.fromOutside||this.domPosition.prev!=this.currentItem.prev().not(".ui-sortable-helper")[0]||
this.domPosition.parent!=this.currentItem.parent()[0])&&!b)c.push(function(f){this._trigger("update",f,this._uiHash())});if(!d.ui.contains(this.element[0],this.currentItem[0])){b||c.push(function(f){this._trigger("remove",f,this._uiHash())});for(e=this.containers.length-1;e>=0;e--)if(d.ui.contains(this.containers[e].element[0],this.currentItem[0])&&!b){c.push(function(f){return function(g){f._trigger("receive",g,this._uiHash(this))}}.call(this,this.containers[e]));c.push(function(f){return function(g){f._trigger("update",
g,this._uiHash(this))}}.call(this,this.containers[e]))}}for(e=this.containers.length-1;e>=0;e--){b||c.push(function(f){return function(g){f._trigger("deactivate",g,this._uiHash(this))}}.call(this,this.containers[e]));if(this.containers[e].containerCache.over){c.push(function(f){return function(g){f._trigger("out",g,this._uiHash(this))}}.call(this,this.containers[e]));this.containers[e].containerCache.over=0}}this._storedCursor&&d("body").css("cursor",this._storedCursor);this._storedOpacity&&this.helper.css("opacity",
this._storedOpacity);if(this._storedZIndex)this.helper.css("zIndex",this._storedZIndex=="auto"?"":this._storedZIndex);this.dragging=false;if(this.cancelHelperRemoval){if(!b){this._trigger("beforeStop",a,this._uiHash());for(e=0;e<c.length;e++)c[e].call(this,a);this._trigger("stop",a,this._uiHash())}return false}b||this._trigger("beforeStop",a,this._uiHash());this.placeholder[0].parentNode.removeChild(this.placeholder[0]);this.helper[0]!=this.currentItem[0]&&this.helper.remove();this.helper=null;if(!b){for(e=
0;e<c.length;e++)c[e].call(this,a);this._trigger("stop",a,this._uiHash())}this.fromOutside=false;return true},_trigger:function(){d.Widget.prototype._trigger.apply(this,arguments)===false&&this.cancel()},_uiHash:function(a){var b=a||this;return{helper:b.helper,placeholder:b.placeholder||d([]),position:b.position,originalPosition:b.originalPosition,offset:b.positionAbs,item:b.currentItem,sender:a?a.element:null}}});d.extend(d.ui.sortable,{version:"1.8.1"})})(jQuery);
;
},{}],31:[function(require,module,exports){
ig.module(
	'weltmeister.modal-dialogs'
)
.requires(
	'weltmeister.select-file-dropdown'
)
.defines(function(){ "use strict";

wm.ModalDialog = ig.Class.extend({
	onOk: null,
	onCancel: null,

	text: '',
	okText: '',
	cancelText: '',
	
	background: null,
	dialogBox: null,
	buttonDiv: null,
	
	init: function( text, okText, cancelText ) {
		this.text = text;
		this.okText = okText || 'OK';
		this.cancelText = cancelText || 'Cancel';
	
		this.background = $('<div/>', {'class':'modalDialogBackground'});
		this.dialogBox = $('<div/>', {'class':'modalDialogBox'});
		this.background.append( this.dialogBox );
		$('body').append( this.background );
		
		this.initDialog( text );
	},
	
	
	initDialog: function() {
		this.buttonDiv = $('<div/>', {'class': 'modalDialogButtons'} );
		var okButton = $('<input/>', {'type': 'button', 'class':'button', 'value': this.okText});
		var cancelButton = $('<input/>', {'type': 'button', 'class':'button', 'value': this.cancelText});
		
		okButton.bind( 'click', this.clickOk.bind(this) );
		cancelButton.bind( 'click', this.clickCancel.bind(this) );
		
		this.buttonDiv.append( okButton ).append( cancelButton );
		
		this.dialogBox.html('<div class="modalDialogText">' + this.text + '</div>' );
		this.dialogBox.append( this.buttonDiv );
	},
	
	
	clickOk: function() {
		if( this.onOk ) { this.onOk(this); }
		this.close();
	},
	
	
	clickCancel: function() {
		if( this.onCancel ) { this.onCancel(this); }
		this.close();
	},
	
	
	open: function() {
		this.background.fadeIn(100);
	},
	
	
	close: function() {
		this.background.fadeOut(100);
	}
});



wm.ModalDialogPathSelect = wm.ModalDialog.extend({
	pathDropdown: null,
	pathInput: null,
	fileType: '',
	
	init: function( text, okText, type ) {
		this.fileType = type || '';
		this.parent( text, (okText || 'Select') );
	},
	
	
	setPath: function( path ) {
		var dir = path.replace(/\/[^\/]*$/, '');
		this.pathInput.val( path );
		this.pathDropdown.loadDir( dir );
	},
	
	
	initDialog: function() {
		this.parent();
		this.pathInput = $('<input/>', {'type': 'text', 'class': 'modalDialogPath'} );
		this.buttonDiv.before( this.pathInput );
		this.pathDropdown = new wm.SelectFileDropdown( this.pathInput, wm.config.api.browse, this.fileType );
	},
	
	
	clickOk: function() {
		if( this.onOk ) { 
			this.onOk(this, this.pathInput.val()); 
		}
		this.close();
	}
});

});
},{}],32:[function(require,module,exports){
ig.module(
	'weltmeister.select-file-dropdown'
)
.defines(function(){ "use strict";
	
wm.SelectFileDropdown = ig.Class.extend({
	input: null,
	boundShow: null,
	div: null,
	filelistPHP: '',
	filetype: '',
	
	init: function( elementId, filelistPHP, filetype ) {
		this.filetype = filetype || '';
		this.filelistPHP = filelistPHP;
		this.input = $(elementId);
		this.boundHide = this.hide.bind(this);
		this.input.bind('focus', this.show.bind(this) );
		
		this.div = $('<div/>', {'class':'selectFileDialog'});
		this.input.after( this.div );
		this.div.bind('mousedown', this.noHide.bind(this) );
		
		this.loadDir( '' );
	},
	
	
	loadDir: function( dir ) {
		var path = this.filelistPHP + '?dir=' + encodeURIComponent( dir || '' ) + '&type=' + this.filetype;
		var req = $.ajax({
			url:path, 
			dataType: 'json',
			async: false,
			success:this.showFiles.bind(this)
		});
	},
	
	
	selectDir: function( event ) {
		this.loadDir( $(event.target).attr('href') );
		return false;
	},
	
	
	selectFile: function( event ) {
		this.input.val( $(event.target).attr('href') );
		this.input.blur();
		this.hide();
		return false;
	},
	
	
	showFiles: function( data ) {
		this.div.empty();
		if( data.parent !== false ) {
			var parentDir = $('<a/>', {'class':'dir', href:data.parent, html: '&hellip;parent directory'});
			parentDir.bind( 'click', this.selectDir.bind(this) );
			this.div.append( parentDir );
		}
		for( var i = 0; i < data.dirs.length; i++ ) {
			var name = data.dirs[i].match(/[^\/]*$/)[0] + '/';
			var dir = $('<a/>', {'class':'dir', href:data.dirs[i], html: name, title: name});
			dir.bind( 'click', this.selectDir.bind(this) );
			this.div.append( dir );
		}
		for( var i = 0; i < data.files.length; i++ ) {
			var name = data.files[i].match(/[^\/]*$/)[0];
			var file = $('<a/>', {'class':'file', href:data.files[i], html: name, title: name});
			file.bind( 'click', this.selectFile.bind(this) );
			this.div.append( file );
		}
	},
	
	
	noHide: function(event) {
		event.stopPropagation();
	},
	
	
	show: function( event ) {
		var inputPos = this.input.position();//this.input.getPosition(this.input.getOffsetParent());
		var inputHeight = parseInt(this.input.innerHeight()) + parseInt(this.input.css('margin-top'));
		var inputWidth = this.input.innerWidth();
		$(document).bind( 'mousedown', this.boundHide );
		this.div.css({
			'top': inputPos.top + inputHeight + 1,
			'left': inputPos.left,
			'width': inputWidth
		}).slideDown(100);
	},
	
	
	hide: function() {
		$(document).unbind( 'mousedown', this.boundHide );
		this.div.slideUp(100);
	}
});

});
},{}],33:[function(require,module,exports){
ig.module(
	'weltmeister.tile-select'
)
.defines(function(){ "use strict";

wm.TileSelect = ig.Class.extend({
	
	pos: {x:0, y:0},
	
	layer: null,
	selectionBegin: null,
	
	init: function( layer ) {
		this.layer = layer;
	},
	
	
	getCurrentTile: function() {
		var b = this.layer.brush;
		if( b.length == 1 && b[0].length == 1 ) {
			return b[0][0] - 1;
		}
		else {
			return -1;
		}
	},
	
	
	setPosition: function( x, y ) {
		this.selectionBegin = null;
		var tile = this.getCurrentTile();
		this.pos.x = 
			Math.floor( x / this.layer.tilesize ) * this.layer.tilesize 
			- Math.floor( tile * this.layer.tilesize ) % this.layer.tiles.width;
			
		this.pos.y = 
			Math.floor( y / this.layer.tilesize ) * this.layer.tilesize 
			- Math.floor( tile * this.layer.tilesize / this.layer.tiles.width ) * this.layer.tilesize
			- (tile == -1 ? this.layer.tilesize : 0);
			
		this.pos.x = this.pos.x.limit( 0, ig.system.width - this.layer.tiles.width - (ig.system.width % this.layer.tilesize) );
		this.pos.y = this.pos.y.limit( 0, ig.system.height - this.layer.tiles.height - (ig.system.height % this.layer.tilesize)  );
	},
	
	
	beginSelecting: function( x, y ) {
		this.selectionBegin = {x:x, y:y};
	},
	
		
	endSelecting: function( x, y ) {
		var r = this.getSelectionRect( x, y);
		
		var mw = Math.floor( this.layer.tiles.width / this.layer.tilesize );
		var mh = Math.floor( this.layer.tiles.height / this.layer.tilesize );
		
		var brush = [];
		for( var ty = r.y; ty < r.y+r.h; ty++ ) {
			var row = [];
			for( var tx = r.x; tx < r.x+r.w; tx++ ) {
				if( tx < 0 || ty < 0 || tx >= mw || ty >= mh) {
					row.push( 0 );
				}
				else {
					row.push( ty * Math.floor(this.layer.tiles.width / this.layer.tilesize) + tx + 1 );
				}
			}
			brush.push( row );
		}
		this.selectionBegin = null;
		return brush;
	},
	
	
	getSelectionRect: function( x, y ) {
		var sx = this.selectionBegin ? this.selectionBegin.x : x,
			sy = this.selectionBegin ? this.selectionBegin.y : y;
			
		var
			txb = Math.floor( (sx - this.pos.x) / this.layer.tilesize ),
			tyb = Math.floor( (sy - this.pos.y) / this.layer.tilesize ),
			txe = Math.floor( (x - this.pos.x) / this.layer.tilesize ),
			tye = Math.floor( (y - this.pos.y) / this.layer.tilesize );
		
		return {
			x: Math.min( txb, txe ),
			y: Math.min( tyb, tye ),
			w: Math.abs( txb - txe) + 1,
			h: Math.abs( tyb - tye) + 1
		}
	},	
	
	
	draw: function() {
		ig.system.clear( "rgba(0,0,0,0.8)" ); 
		if( !this.layer.tiles.loaded ) {
			return;
		}
		
		// Tileset
		ig.system.context.lineWidth = 1;
		ig.system.context.strokeStyle = wm.config.colors.secondary;
		ig.system.context.fillStyle = wm.config.colors.clear;
		ig.system.context.fillRect( 
			this.pos.x * ig.system.scale, 
			this.pos.y * ig.system.scale, 
			this.layer.tiles.width * ig.system.scale, 
			this.layer.tiles.height * ig.system.scale
		);
		ig.system.context.strokeRect( 
			this.pos.x * ig.system.scale - 0.5, 
			this.pos.y * ig.system.scale - 0.5, 
			this.layer.tiles.width * ig.system.scale + 1, 
			this.layer.tiles.height * ig.system.scale + 1
		);
		
		this.layer.tiles.draw( this.pos.x, this.pos.y );
		
		// Selected Tile
		var tile = this.getCurrentTile();
		var tx = Math.floor( tile * this.layer.tilesize ) % this.layer.tiles.width + this.pos.x;
		var ty = 
			Math.floor( tile * this.layer.tilesize / this.layer.tiles.width )
			* this.layer.tilesize + this.pos.y 
			+ (tile == -1 ? this.layer.tilesize : 0);
		
		ig.system.context.lineWidth = 1;
		ig.system.context.strokeStyle = wm.config.colors.highlight;
		ig.system.context.strokeRect( 
			tx * ig.system.scale - 0.5, 
			ty * ig.system.scale - 0.5, 
			this.layer.tilesize * ig.system.scale + 1, 
			this.layer.tilesize * ig.system.scale + 1
		);
	},
	
	
	drawCursor: function( x, y ) {  
		var cx = Math.floor( x / this.layer.tilesize ) * this.layer.tilesize;
		var cy = Math.floor( y / this.layer.tilesize ) * this.layer.tilesize;
		
		var r = this.getSelectionRect( x, y);
		
		ig.system.context.lineWidth = 1;
		ig.system.context.strokeStyle = wm.config.colors.selection;
		ig.system.context.strokeRect( 
			(r.x * this.layer.tilesize + this.pos.x) * ig.system.scale - 0.5, 
			(r.y * this.layer.tilesize + this.pos.y) * ig.system.scale - 0.5, 
			r.w * this.layer.tilesize * ig.system.scale + 1, 
			r.h * this.layer.tilesize * ig.system.scale + 1
		);
	}
});

});
},{}],34:[function(require,module,exports){
ig.module(
	'weltmeister.undo'
)
.requires(
	'weltmeister.config'
)
.defines(function(){ "use strict";


wm.Undo = ig.Class.extend({
	levels: 10,
	chain: [],
	rpos: 0,
	currentAction: null,
	
	init: function( levels ) {
		this.levels = levels || 10;
	},
	
	
	clear: function() {
		this.chain = [];
		this.currentAction = null;
	},
	
	
	commit: function( action ) {
		if( this.rpos ) {
			this.chain.splice( this.chain.length - this.rpos, this.rpos );
			this.rpos = 0;
		}
		action.activeLayer = ig.game.activeLayer ? ig.game.activeLayer.name : '';
		this.chain.push( action );
		if( this.chain.length > this.levels ) {
			this.chain.shift();
		}
	},
	
	
	undo: function() {
		var action = this.chain[ this.chain.length - this.rpos - 1 ];
		if( !action ) {
			return;
		}
		this.rpos++;
		
		
		ig.game.setActiveLayer( action.activeLayer );
		
		if( action.type == wm.Undo.MAP_DRAW ) {
			for( var i = 0; i < action.changes.length; i++ ) {
				var change = action.changes[i];
				change.layer.setTile( change.x, change.y, change.old );
			}
		}
		else if( action.type == wm.Undo.ENTITY_EDIT ) {
			action.entity.pos.x = action.old.x;
			action.entity.pos.y = action.old.y;
			action.entity.size.x = action.old.w;
			action.entity.size.y = action.old.h;
			ig.game.entities.selectEntity( action.entity );
			ig.game.entities.loadEntitySettings();
		}
		else if( action.type == wm.Undo.ENTITY_CREATE ) {
			ig.game.entities.removeEntity( action.entity );
			ig.game.entities.selectEntity( null );
		}
		else if( action.type == wm.Undo.ENTITY_DELETE ) {
			ig.game.entities.entities.push( action.entity );
			if( action.entity.name ) {
				this.namedEntities[action.entity.name] = action.entity;
			}
			ig.game.entities.selectEntity( action.entity );
		}
		
		ig.game.setModified();
	},
	
	
	redo: function() {
		if( !this.rpos ) {
			return;
		}
		
		var action = this.chain[ this.chain.length - this.rpos ];
		if( !action ) {
			return;
		}
		this.rpos--;
		
		
		ig.game.setActiveLayer( action.activeLayer );
		
		if( action.type == wm.Undo.MAP_DRAW ) {
			for( var i = 0; i < action.changes.length; i++ ) {
				var change = action.changes[i];
				change.layer.setTile( change.x, change.y, change.current );
			}
		}
		else if( action.type == wm.Undo.ENTITY_EDIT ) {
			action.entity.pos.x = action.current.x;
			action.entity.pos.y = action.current.y;
			action.entity.size.x = action.current.w;
			action.entity.size.y = action.current.h;
			ig.game.entities.selectEntity( action.entity );
			ig.game.entities.loadEntitySettings();
		}
		else if( action.type == wm.Undo.ENTITY_CREATE ) {
			ig.game.entities.entities.push( action.entity );
			if( action.entity.name ) {
				this.namedEntities[action.entity.name] = action.entity;
			}
			ig.game.entities.selectEntity( action.entity );
		}
		else if( action.type == wm.Undo.ENTITY_DELETE ) {
			ig.game.entities.removeEntity( action.entity );
			ig.game.entities.selectEntity( null );
		}
		
		ig.game.setModified();
	},
	
	
	// -------------------------------------------------------------------------
	// Map changes
	
	beginMapDraw: function( layer ) {
		this.currentAction = {
			type: wm.Undo.MAP_DRAW,
			time: Date.now(),
			changes: []
		};
	},
	
	pushMapDraw: function( layer, x, y, oldTile, currentTile ) {
		if( !this.currentAction ) {
			return;
		}
		
		this.currentAction.changes.push({
			layer: layer,
			x: x,
			y: y,
			old: oldTile,
			current: currentTile
		});
	},
	
	endMapDraw: function() {		
		if( !this.currentAction || !this.currentAction.changes.length ) {
			return;
		}
		
		this.commit( this.currentAction );		
		this.currentAction = null;
	},
	
	
	// -------------------------------------------------------------------------
	// Entity changes
	
	beginEntityEdit: function( entity ) {		
		this.currentAction = {
			type: wm.Undo.ENTITY_EDIT,
			time: Date.now(),
			entity: entity,
			old: {
				x: entity.pos.x,
				y: entity.pos.y,
				w: entity.size.x,
				h: entity.size.y
			},
			current: {
				x: entity.pos.x,
				y: entity.pos.y,
				w: entity.size.x,
				h: entity.size.y
			}
		};
	},

	pushEntityEdit: function( entity ) {		
		if( !this.currentAction ) {
			return;
		}
		
		this.currentAction.current = {
			x: entity.pos.x,
			y: entity.pos.y,
			w: entity.size.x,
			h: entity.size.y
		};
	},
	
	
	endEntityEdit: function() {	
		var a = this.currentAction;
		
		if( !a || (
			a.old.x == a.current.x && a.old.y == a.current.y &&
			a.old.w == a.current.w && a.old.h == a.current.h
		)) {
			return;
		}
		
		this.commit( this.currentAction );		
		this.currentAction = null;
	},
	
	
	commitEntityCreate: function( entity ) {		
		this.commit({
			type: wm.Undo.ENTITY_CREATE,
			time: Date.now(),
			entity: entity
		});
	},
	
	
	commitEntityDelete: function( entity ) {		
		this.commit({
			type: wm.Undo.ENTITY_DELETE,
			time: Date.now(),
			entity: entity
		});
	}
});

wm.Undo.MAP_DRAW = 1;
wm.Undo.ENTITY_EDIT = 2;
wm.Undo.ENTITY_CREATE = 3;
wm.Undo.ENTITY_DELETE = 4;

});
},{}],35:[function(require,module,exports){
var wm = {};	
wm.entityFiles = [];

ig.module(
	'weltmeister.weltmeister'
)
.requires(
	'dom.ready',
	'impact.game',
	'weltmeister.evented-input',
	'weltmeister.config',
	'weltmeister.edit-map',
	'weltmeister.edit-entities',
	'weltmeister.select-file-dropdown',
	'weltmeister.modal-dialogs',
	'weltmeister.undo'
)
.defines(function(){ "use strict";

wm.Weltmeister = ig.Class.extend({	
	MODE: {
		DRAW: 1,
		TILESELECT: 2,
		ENTITYSELECT: 4
	},
	
	layers: [],
	entities: null,
	activeLayer: null,
	collisionLayer: null,
	selectedEntity: null,
	
	screen: {x: 0, y: 0},
	_rscreen: {x: 0, y: 0},
	mouseLast: {x: -1, y: -1},
	waitForModeChange: false,
	
	tilsetSelectDialog: null,
	levelSavePathDialog: null,
	labelsStep: 32,
	
	collisionSolid: 1,
	
	loadDialog: null,
	saveDialog: null,
	loseChangesDialog: null,
	fileName: 'untitled.js',
	filePath: wm.config.project.levelPath + 'untitled.js',
	modified: false,
	needsDraw: true,
	
	undo: null,
	
	init: function() {
		ig.game = ig.editor = this;
		
		ig.system.context.textBaseline = 'top';
		ig.system.context.font = wm.config.labels.font;
		this.labelsStep = wm.config.labels.step;
		
			
		
		// Dialogs
		this.loadDialog = new wm.ModalDialogPathSelect( 'Load Level', 'Load', 'scripts' );
		this.loadDialog.onOk = this.load.bind(this);
		this.loadDialog.setPath( wm.config.project.levelPath );
		$('#levelLoad').bind( 'click', this.showLoadDialog.bind(this) );
		$('#levelNew').bind( 'click', this.showNewDialog.bind(this) );
		
		this.saveDialog = new wm.ModalDialogPathSelect( 'Save Level', 'Save', 'scripts' );
		this.saveDialog.onOk = this.save.bind(this);
		this.saveDialog.setPath( wm.config.project.levelPath );
		$('#levelSaveAs').bind( 'click', this.saveDialog.open.bind(this.saveDialog) );
		$('#levelSave').bind( 'click', this.saveQuick.bind(this) );
		
		this.loseChangesDialog = new wm.ModalDialog( 'Lose all changes?' );
		
		this.deleteLayerDialog = new wm.ModalDialog( 'Delete Layer? NO UNDO!' );
		this.deleteLayerDialog.onOk = this.removeLayer.bind(this);
		
		this.mode = this.MODE.DEFAULT;
		
		
		this.tilesetSelectDialog = new wm.SelectFileDropdown( '#layerTileset', wm.config.api.browse, 'images' );
		this.entities = new wm.EditEntities( $('#layerEntities') );
		
		$('#layers').sortable({
			update: this.reorderLayers.bind(this)
		});
		$('#layers').disableSelection();
		this.resetModified();
		
		
		// Events/Input
		for( var key in wm.config.binds ) {
			ig.input.bind( ig.KEY[key], wm.config.binds[key] );
		}
		ig.input.keydownCallback = this.keydown.bind(this);
		ig.input.keyupCallback = this.keyup.bind(this);
		ig.input.mousemoveCallback = this.mousemove.bind(this);
		
		$(window).resize( this.resize.bind(this) );
		$(window).bind( 'keydown', this.uikeydown.bind(this) );
		$(window).bind( 'beforeunload', this.confirmClose.bind(this) );
	
		$('#buttonAddLayer').bind( 'click', this.addLayer.bind(this) );
		$('#buttonRemoveLayer').bind( 'click', this.deleteLayerDialog.open.bind(this.deleteLayerDialog) );
		$('#buttonSaveLayerSettings').bind( 'click', this.saveLayerSettings.bind(this) );
		$('#reloadImages').bind( 'click', ig.Image.reloadCache );
		$('#layerIsCollision').bind( 'change', this.toggleCollisionLayer.bind(this) );
		
		$('input#toggleSidebar').click(function() {
			$('div#menu').slideToggle('fast');
			$('input#toggleSidebar').toggleClass('active');
		});
		
		// Always unfocus current input field when clicking the canvas
		$('#canvas').mousedown(function(){
			$('input:focus').blur();
		});
		
		
		this.undo = new wm.Undo( wm.config.undoLevels );
		
		
		if( wm.config.loadLastLevel ) {
			var path = $.cookie('wmLastLevel');
			if( path ) {
				this.load( null, path )
			}
		}
		
		ig.setAnimation( this.drawIfNeeded.bind(this) );
	},
		
	
	uikeydown: function( event ) {
		if( event.target.type == 'text' ) {
			return;
		}
		
		var key = String.fromCharCode(event.which);
		if( key.match(/^\d$/) ) {
			var index = parseInt(key);
			var name = $('#layers div.layer:nth-child('+index+') span.name').text();
			
			var layer = name == 'entities'
				? this.entities
				: this.getLayerWithName(name);
				
			if( layer ) {
				if( event.shiftKey ) {
					layer.toggleVisibility();
				} else {
					this.setActiveLayer( layer.name );
				}
			}
		}
	},
	
	
	showLoadDialog: function() {
		if( this.modified ) {
			this.loseChangesDialog.onOk = this.loadDialog.open.bind(this.loadDialog);
			this.loseChangesDialog.open();
		} else {
			this.loadDialog.open();
		}
	},
	
	showNewDialog: function() {
		if( this.modified ) {
			this.loseChangesDialog.onOk = this.loadNew.bind(this);
			this.loseChangesDialog.open();
		} else {
			this.loadNew();
		}
	},
	
	setModified: function() {
		if( !this.modified ) {
			this.modified = true;
			this.setWindowTitle();
		}
	},
	
	resetModified: function() {
		this.modified = false;
		this.setWindowTitle();
	},
	
	setWindowTitle: function() {
		document.title = this.fileName + (this.modified ? ' * ' : ' - ') + 'Weltmeister';
		$('span.headerTitle').text(this.fileName);
		$('span.unsavedTitle').text(this.modified ? '*' : '');
	},
	
	
	confirmClose: function( event ) {
		var rv = undefined;
		if( this.modified && wm.config.askBeforeClose ) {
			rv = 'There are some unsaved changes. Leave anyway?';
		}
		event.returnValue = rv;
		return rv;
	},
	
	
	resize: function() {
		ig.system.resize(
			Math.floor(wm.Weltmeister.getMaxWidth() / wm.config.view.zoom), 
			Math.floor(wm.Weltmeister.getMaxHeight() / wm.config.view.zoom), 
			wm.config.view.zoom
		);
		ig.system.context.textBaseline = 'top';
		ig.system.context.font = wm.config.labels.font;
		this.draw();
	},
	
	
	drag: function() {
		this.screen.x -= ig.input.mouse.x - this.mouseLast.x;
		this.screen.y -= ig.input.mouse.y - this.mouseLast.y;
		this._rscreen.x = Math.round(this.screen.x * ig.system.scale)/ig.system.scale;
		this._rscreen.y = Math.round(this.screen.y * ig.system.scale)/ig.system.scale;
		for( var i = 0; i < this.layers.length; i++ ) {
			this.layers[i].setScreenPos( this.screen.x, this.screen.y );
		}
	},
	
	
	zoom: function( delta ) {
		var z = wm.config.view.zoom;
		var mx = ig.input.mouse.x * z,
			my = ig.input.mouse.y * z;
		
		if( z <= 1 ) {
			if( delta < 0 ) {
				z /= 2;
			}
			else {
				z *= 2;
			}
		}
		else {
			z += delta;
		}
		
		wm.config.view.zoom = z.limit( wm.config.view.zoomMin, wm.config.view.zoomMax );
		wm.config.labels.step = Math.round( this.labelsStep / wm.config.view.zoom );
		$('#zoomIndicator').text( wm.config.view.zoom + 'x' ).stop(true,true).show().delay(300).fadeOut();
		
		// Adjust mouse pos and screen coordinates
		ig.input.mouse.x = mx / wm.config.view.zoom;
		ig.input.mouse.y = my / wm.config.view.zoom;
		this.drag();
		
		for( var i in ig.Image.cache ) {
			ig.Image.cache[i].resize( wm.config.view.zoom );
		}
		
		this.resize();
	},
	
	
	// -------------------------------------------------------------------------
	// Loading
	
	loadNew: function() {
		$.cookie( 'wmLastLevel', null );
		while( this.layers.length ) {
			this.layers[0].destroy();
			this.layers.splice( 0, 1 );
		}
		this.screen = {x: 0, y: 0};
		this.entities.clear();
		this.fileName = 'untitled.js';
		this.filePath = wm.config.project.levelPath + 'untitled.js';
		this.saveDialog.setPath( this.filePath );
		this.resetModified();
		this.draw();
	},
	
	
	load: function( dialog, path ) {
		this.filePath = path;
		this.saveDialog.setPath( path );
		this.fileName = path.replace(/^.*\//,'');
		
		var req = $.ajax({
			url:( path + '?nocache=' + Math.random() ), 
			dataType: 'text',
			async:false,
			success: this.loadResponse.bind(this),
			error: function() { $.cookie( 'wmLastLevel', null ); }
		});
	},
	
	
	loadResponse: function( data ) {
		$.cookie( 'wmLastLevel', this.filePath );
		
		// extract JSON from a module's JS
		var jsonMatch = data.match( /\/\*JSON\[\*\/([\s\S]*?)\/\*\]JSON\*\// );
		data = JSON.parse( jsonMatch ? jsonMatch[1] : data );
		
		while( this.layers.length ) {
			this.layers[0].destroy();
			this.layers.splice( 0, 1 );
		}
		this.screen = {x: 0, y: 0};
		this.entities.clear();
		
		for( var i=0; i < data.entities.length; i++ ) {
			var ent = data.entities[i];
			this.entities.spawnEntity( ent.type, ent.x, ent.y, ent.settings );
		}
		
		for( var i=0; i < data.layer.length; i++ ) {
			var ld = data.layer[i];
			var newLayer = new wm.EditMap( ld.name, ld.tilesize, ld.tilesetName, !!ld.foreground );
			newLayer.resize( ld.width, ld.height );
			newLayer.linkWithCollision = ld.linkWithCollision;
			newLayer.repeat = ld.repeat;
			newLayer.preRender = !!ld.preRender;
			newLayer.distance = ld.distance;
			newLayer.visible = !ld.visible;
			newLayer.data = ld.data;
			newLayer.toggleVisibility();
			this.layers.push( newLayer );
			
			if( ld.name == 'collision' ) {
				this.collisionLayer = newLayer;
			}
			
			this.setActiveLayer( ld.name );
		}
		
		this.setActiveLayer( 'entities' );
		
		this.reorderLayers();
		$('#layers').sortable('refresh');
		
		this.resetModified();
		this.undo.clear();
		this.draw();
	},
	
	
	
	// -------------------------------------------------------------------------
	// Saving
	
	saveQuick: function() {
		if( this.fileName == 'untitled.js' ) {
			this.saveDialog.open();
		}
		else {
			this.save( null, this.filePath );
		}
	},
	
	save: function( dialog, path ) {
		if( !path.match(/\.js$/) ) {
			path += '.js';
		}
		
		this.filePath = path;
		this.fileName = path.replace(/^.*\//,'');
		var data = {
			'entities': this.entities.getSaveData(),
			'layer': []
		};
		
		var resources = [];
		for( var i=0; i < this.layers.length; i++ ) {
			var layer = this.layers[i];
			data.layer.push( layer.getSaveData() );
			if( layer.name != 'collision' ) {
				resources.push( layer.tiles.path );
			}
		}
		
		
		var dataString = JSON.stringify(data);
		if( wm.config.project.prettyPrint ) {
			dataString = JSONFormat( dataString );
		}
		
		// Make it an ig.module instead of plain JSON?
		if( wm.config.project.outputFormat == 'module' ) {
			var levelModule = path
				.replace(wm.config.project.modulePath, '')
				.replace(/\.js$/, '')
				.replace(/\//g, '.');
				
			var levelName = levelModule.replace(/(^.*\.|-)(\w)/g, function( m, s, a ) {
				return a.toUpperCase();
			});
			
			
			var resourcesString = '';
			if( resources.length ) {
				resourcesString = "Level" + levelName + "Resources=[new ig.Image('" +
					resources.join("'), new ig.Image('") +
				"')];\n";
			}
			
			// Collect all Entity Modules
			var requires = ['impact.image'];
			var requiresHash = {};
			for( var i = 0; i < data.entities.length; i++ ) {
				var ec = this.entities.entityClasses[ data.entities[i].type ];
				if( !requiresHash[ec] ) {
					requiresHash[ec] = true;
					requires.push(ec);
				}
			}
			
			// include /*JSON[*/ ... /*]JSON*/ markers, so we can easily load
			// this level as JSON again
			dataString =
				"ig.module( '"+levelModule+"' )\n" +
				".requires( '"+requires.join("','")+"' )\n" +
				".defines(function(){\n"+
					"Level" + levelName + "=" +
						"/*JSON[*/" + dataString + "/*]JSON*/" +
					";\n" +
					resourcesString +
				"});";
		}
		
		var postString = 
			'path=' + encodeURIComponent( path ) +
			'&data=' + encodeURIComponent(dataString);
		
		var req = $.ajax({
			url: wm.config.api.save,
			type: 'POST',
			dataType: 'json',
			async: false,
			data: postString,
			success:this.saveResponse.bind(this)
		});
	},
	
	saveResponse: function( data ) {
		if( data.error ) {
			alert( 'Error: ' + data.msg );
		} else {
			this.resetModified();
			$.cookie( 'wmLastLevel', this.filePath );
		}
	},
	
	
	
	// -------------------------------------------------------------------------
	// Layers
	
	addLayer: function() {
		var name = 'new_layer_' + this.layers.length;
		var newLayer = new wm.EditMap( name, wm.config.layerDefaults.tilesize );
		newLayer.resize( wm.config.layerDefaults.width, wm.config.layerDefaults.height );
		newLayer.setScreenPos( this.screen.x, this.screen.y );
		this.layers.push( newLayer );
		this.setActiveLayer( name );
		this.updateLayerSettings();
		
		this.reorderLayers();
		
		$('#layers').sortable('refresh');
	},
	
	
	removeLayer: function() {
		var name = this.activeLayer.name;
		if( name == 'entities' ) {
			return false;
		}
		this.activeLayer.destroy();
		for( var i = 0; i < this.layers.length; i++ ) {
			if( this.layers[i].name == name ) {
				this.layers.splice( i, 1 );
				this.reorderLayers();
				$('#layers').sortable('refresh');
				this.setActiveLayer( 'entities' );
				return true;
			}
		}
		return false;
	},
	
	
	getLayerWithName: function( name ) {
		for( var i = 0; i < this.layers.length; i++ ) {
			if( this.layers[i].name == name ) {
				return this.layers[i];
			}
		}
		return null;
	},
	
	
	reorderLayers: function( dir ) {
		var newLayers = [];
		var isForegroundLayer = true;
		$('#layers div.layer span.name').each((function( newIndex, span ){
			var name = $(span).text();
			
			var layer = name == 'entities'
				? this.entities
				: this.getLayerWithName(name);
				
			if( layer ) {
				layer.setHotkey( newIndex+1 );
				if( layer.name == 'entities' ) {
					// All layers after the entity layer are not foreground
					// layers
					isForegroundLayer = false;
				}
				else {
					layer.foreground = isForegroundLayer;
					newLayers.unshift( layer );
				}
			}
		}).bind(this));
		this.layers = newLayers;
		this.setModified();
		this.draw();
	},
	
	
	updateLayerSettings: function( ) {
		$('#layerName').val( this.activeLayer.name );
		$('#layerTileset').val( this.activeLayer.tilesetName );
		$('#layerTilesize').val( this.activeLayer.tilesize );
		$('#layerWidth').val( this.activeLayer.width );
		$('#layerHeight').val( this.activeLayer.height );
		$('#layerPreRender').prop( 'checked', this.activeLayer.preRender );
		$('#layerRepeat').prop( 'checked', this.activeLayer.repeat );
		$('#layerLinkWithCollision').prop( 'checked', this.activeLayer.linkWithCollision );
		$('#layerDistance').val( this.activeLayer.distance );
	},
	
	
	saveLayerSettings: function() {
		var isCollision = $('#layerIsCollision').prop('checked');
		
		var newName = $('#layerName').val();
		var newWidth = Math.floor($('#layerWidth').val());
		var newHeight = Math.floor($('#layerHeight').val());
		
		if( newWidth != this.activeLayer.width || newHeight != this.activeLayer.height ) {
			this.activeLayer.resize( newWidth, newHeight );
		}
		this.activeLayer.tilesize = Math.floor($('#layerTilesize').val());
		
		if( isCollision ) {
			newName = 'collision';
			this.activeLayer.linkWithCollision = false;
			this.activeLayer.distance = 1;
			this.activeLayer.repeat = false;
			this.activeLayer.setCollisionTileset();
		}
		else {
			var newTilesetName = $('#layerTileset').val();
			if( newTilesetName != this.activeLayer.tilesetName ) {
				this.activeLayer.setTileset( newTilesetName );
			}
			this.activeLayer.linkWithCollision = $('#layerLinkWithCollision').prop('checked');
			this.activeLayer.distance = $('#layerDistance').val();
			this.activeLayer.repeat = $('#layerRepeat').prop('checked');
			this.activeLayer.preRender = $('#layerPreRender').prop('checked');
		}
		
		
		if( newName == 'collision' ) {
			// is collision layer
			this.collisionLayer = this.activeLayer;
		} 
		else if( this.activeLayer.name == 'collision' ) {
			// was collision layer, but is no more
			this.collisionLayer = null;
		}
		

		this.activeLayer.setName( newName );
		this.setModified();
		this.draw();
	},
	
	
	setActiveLayer: function( name ) {
		var previousLayer = this.activeLayer;
		this.activeLayer = ( name == 'entities' ? this.entities : this.getLayerWithName(name) );
		if( previousLayer == this.activeLayer ) {
			return; // nothing to do here
		}
		
		if( previousLayer ) {
			previousLayer.setActive( false );
		}
		this.activeLayer.setActive( true );
		this.mode = this.MODE.DEFAULT;
		
		$('#layerIsCollision').prop('checked', (name == 'collision') );
		
		if( name == 'entities' ) {
			$('#layerSettings').fadeOut(100);
		}
		else {
			this.entities.selectEntity( null );
			this.toggleCollisionLayer();
			$('#layerSettings')
				.fadeOut(100,this.updateLayerSettings.bind(this))
				.fadeIn(100);
		}
		this.draw();
	},
	
	
	toggleCollisionLayer: function( ev ) {
		var isCollision = $('#layerIsCollision').prop('checked');
		$('#layerLinkWithCollision,#layerDistance,#layerPreRender,#layerRepeat,#layerName,#layerTileset')
			.attr('disabled', isCollision );
	},
	
	
	
	// -------------------------------------------------------------------------
	// Update
	
	mousemove: function() {
		if( !this.activeLayer ) {
			return;
		}
		
		if( this.mode == this.MODE.DEFAULT ) {
			
			// scroll map
			if( ig.input.state('drag') ) {
				this.drag();
			}
			
			else if( ig.input.state('draw') ) {
				
				// move/scale entity
				if( this.activeLayer == this.entities ) {
					var x = ig.input.mouse.x + this.screen.x;
					var y = ig.input.mouse.y + this.screen.y;
					this.entities.dragOnSelectedEntity( x, y );
					this.setModified();
				}
				
				// draw on map
				else if( !this.activeLayer.isSelecting ) {
					this.setTileOnCurrentLayer();
				}
			}
			else if( this.activeLayer == this.entities ) {
				var x = ig.input.mouse.x + this.screen.x;
				var y = ig.input.mouse.y + this.screen.y;
				this.entities.mousemove( x, y );
			}
		}
		
		this.mouseLast = {x: ig.input.mouse.x, y: ig.input.mouse.y};
		this.draw();
	},
	
	
	keydown: function( action ) {
		if( !this.activeLayer ) {
			return;
		}
		
		if( action == 'draw' ) {
			if( this.mode == this.MODE.DEFAULT ) {
				// select entity
				if( this.activeLayer == this.entities ) {
					var x = ig.input.mouse.x + this.screen.x;
					var y = ig.input.mouse.y + this.screen.y;
					var entity = this.entities.selectEntityAt( x, y );
					if( entity ) {
						this.undo.beginEntityEdit( entity );
					}
				}
				else {
					if( ig.input.state('select') ) {
						this.activeLayer.beginSelecting( ig.input.mouse.x, ig.input.mouse.y );
					}
					else {
						this.undo.beginMapDraw();
						this.activeLayer.beginEditing();
						if( 
							this.activeLayer.linkWithCollision && 
							this.collisionLayer && 
							this.collisionLayer != this.activeLayer
						) {
							this.collisionLayer.beginEditing();
						}
						this.setTileOnCurrentLayer();
					}
				}
			}
			else if( this.mode == this.MODE.TILESELECT && ig.input.state('select') ) {	
				this.activeLayer.tileSelect.beginSelecting( ig.input.mouse.x, ig.input.mouse.y );
			}
		}
		
		this.draw();
	},
	
	
	keyup: function( action ) {
		if( !this.activeLayer ) {
			return;
		}
		
		if( action == 'delete' ) {
			this.entities.deleteSelectedEntity();
			this.setModified();
		}
		
		else if( action == 'clone' ) {
			this.entities.cloneSelectedEntity();
			this.setModified();
		}
		
		else if( action == 'grid' ) {
			wm.config.view.grid = !wm.config.view.grid;
		}
		
		else if( action == 'menu' ) {
			if( this.mode != this.MODE.TILESELECT && this.mode != this.MODE.ENTITYSELECT ) {
				if( this.activeLayer == this.entities ) {
					this.mode = this.MODE.ENTITYSELECT;
					this.entities.showMenu( ig.input.mouse.x, ig.input.mouse.y );
				}
				else {
					this.mode = this.MODE.TILESELECT;
					this.activeLayer.tileSelect.setPosition( ig.input.mouse.x, ig.input.mouse.y	);
				}
			} else {
				this.mode = this.MODE.DEFAULT;
				this.entities.hideMenu();
			}
		}
		
		else if( action == 'zoomin' ) {
			this.zoom( 1 );
		}
		else if( action == 'zoomout' ) {
			this.zoom( -1 );
		}
		
		
		if( action == 'draw' ) {			
			// select tile
			if( this.mode == this.MODE.TILESELECT ) {
				this.activeLayer.brush = this.activeLayer.tileSelect.endSelecting( ig.input.mouse.x, ig.input.mouse.y );
				this.mode = this.MODE.DEFAULT;
			}
			else if( this.activeLayer == this.entities ) {
				this.undo.endEntityEdit();
			}
			else {
				if( this.activeLayer.isSelecting ) {
					this.activeLayer.brush = this.activeLayer.endSelecting( ig.input.mouse.x, ig.input.mouse.y );
				}
				else {
					this.undo.endMapDraw();
				}
			}
		}
		
		if( action == 'undo' ) {
			this.undo.undo();
		}
		
		if( action == 'redo' ) {
			this.undo.redo();
		}
		
		this.draw();
		this.mouseLast = {x: ig.input.mouse.x, y: ig.input.mouse.y};
	},
	
	
	setTileOnCurrentLayer: function() {
		if( !this.activeLayer || !this.activeLayer.scroll ) {
			return;
		}
		
		var co = this.activeLayer.getCursorOffset();
		var x = ig.input.mouse.x + this.activeLayer.scroll.x - co.x;
		var y = ig.input.mouse.y + this.activeLayer.scroll.y - co.y;
		
		var brush = this.activeLayer.brush;
		for( var by = 0; by < brush.length; by++ ) {
			var brushRow = brush[by];
			for( var bx = 0; bx < brushRow.length; bx++ ) {
				
				var mapx = x + bx * this.activeLayer.tilesize;
				var mapy = y + by * this.activeLayer.tilesize;
				
				var newTile = brushRow[bx];
				var oldTile = this.activeLayer.getOldTile( mapx, mapy );
				
				this.activeLayer.setTile( mapx, mapy, newTile );
				this.undo.pushMapDraw( this.activeLayer, mapx, mapy, oldTile, newTile );
				
				
				if( 
					this.activeLayer.linkWithCollision && 
					this.collisionLayer && 
					this.collisionLayer != this.activeLayer
				) {
					var collisionLayerTile = newTile > 0 ? this.collisionSolid : 0;
					
					var oldCollisionTile = this.collisionLayer.getOldTile(mapx, mapy);
					this.collisionLayer.setTile( mapx, mapy, collisionLayerTile );
					this.undo.pushMapDraw( this.collisionLayer, mapx, mapy, oldCollisionTile, collisionLayerTile );
				}
			}
		}
		
		this.setModified();
	},
	
	
	// -------------------------------------------------------------------------
	// Drawing
	
	draw: function() {
		// The actual drawing loop is scheduled via ig.setAnimation() already.
		// We just set a flag to indicate that a redraw is needed.
		this.needsDraw = true;
	},
	
	
	drawIfNeeded: function() {
		// Only draw if flag is set
		if( !this.needsDraw ) { return; }
		this.needsDraw = false;
		
		
		ig.system.clear( wm.config.colors.clear );
	
		var entitiesDrawn = false;
		for( var i = 0; i < this.layers.length; i++ ) {
			var layer = this.layers[i];
			
			// This layer is a foreground layer? -> Draw entities first!
			if( !entitiesDrawn && layer.foreground ) {
				entitiesDrawn = true;
				this.entities.draw();
			}
			layer.draw();
		}
		
		if( !entitiesDrawn ) {
			this.entities.draw();
		}
		
		
		if( this.activeLayer ) {
			if( this.mode == this.MODE.TILESELECT ) {
				this.activeLayer.tileSelect.draw();
				this.activeLayer.tileSelect.drawCursor( ig.input.mouse.x, ig.input.mouse.y );
			}
			
			if( this.mode == this.MODE.DEFAULT ) {
				this.activeLayer.drawCursor( ig.input.mouse.x, ig.input.mouse.y );
			}
		}
		
		if( wm.config.labels.draw ) {
			this.drawLabels( wm.config.labels.step );
		}
	},
	
	
	drawLabels: function( step ) {
		ig.system.context.fillStyle = wm.config.colors.primary;
		var xlabel = this.screen.x - this.screen.x % step - step;
		for( var tx = Math.floor(-this.screen.x % step); tx < ig.system.width; tx += step ) {
			xlabel += step;
			ig.system.context.fillText( xlabel, tx * ig.system.scale, 0 );
		}
		
		var ylabel = this.screen.y - this.screen.y % step - step;
		for( var ty = Math.floor(-this.screen.y % step); ty < ig.system.height; ty += step ) {
			ylabel += step;
			ig.system.context.fillText( ylabel, 0, ty * ig.system.scale );
		}
	},
	
	
	getEntityByName: function( name ) {
		return this.entities.getEntityByName( name );
	}
});


wm.Weltmeister.getMaxWidth = function() {
	return $(window).width();
};

wm.Weltmeister.getMaxHeight = function() {
	return $(window).height() - $('#headerMenu').height();
};


// Custom ig.Image class for use in Weltmeister. To make the zoom function 
// work, we need some additional scaling behavior:
// Keep the original image, maintain a cache of scaled versions and use the 
// default Canvas scaling (~bicubic) instead of nearest neighbor when 
// zooming out.
ig.Image.inject({
	resize: function( scale ) {
		if( !this.loaded ) { return; }
		if( !this.scaleCache ) { this.scaleCache = {}; }
		if( this.scaleCache['x'+scale] ) {
			this.data = this.scaleCache['x'+scale];
			return;
		}
		
		// Retain the original image when scaling
		this.origData = this.data = this.origData || this.data;
		
		if( scale > 1 ) {
			// Nearest neighbor when zooming in
			this.parent( scale );
		}
		else {
			// Otherwise blur
			var scaled = ig.$new('canvas');
			scaled.width = Math.ceil(this.width * scale);
			scaled.height = Math.ceil(this.height * scale);
			var scaledCtx = scaled.getContext('2d');
			scaledCtx.drawImage( this.data, 0, 0, this.width, this.height, 0, 0, scaled.width, scaled.height );
			this.data = scaled;
		}
		
		this.scaleCache['x'+scale] = this.data;
	}
});



// Create a custom loader, to skip sound files and the run loop creation
wm.Loader = ig.Loader.extend({
	end: function() {
		if( this.done ) { return; }
		
		clearInterval( this._intervalId );
		this.done = true;
		ig.system.clear( wm.config.colors.clear );
		ig.game = new (this.gameClass)();
	},
	
	loadResource: function( res ) {
		if( res instanceof ig.Sound ) {
			this._unloaded.erase( res.path );
		}
		else {
			this.parent( res );
		}
	}
});



// Init!
ig.system = new ig.System(
	'#canvas', 1,
	Math.floor(wm.Weltmeister.getMaxWidth() / wm.config.view.zoom), 
	Math.floor(wm.Weltmeister.getMaxHeight() / wm.config.view.zoom), 
	wm.config.view.zoom
);
	
ig.input = new wm.EventedInput();
ig.soundManager = new ig.SoundManager();
ig.ready = true;

var loader = new wm.Loader( wm.Weltmeister, ig.resources );
loader.load();

});



},{}]},{},[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35]);
