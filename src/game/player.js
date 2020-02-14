import Phaser from "phaser";
import Entity from "./entity";
import HealthBar from "./healthBar";
import ids from "./constants/ids";
import assetsKeys from "./constants/assets";
import gameConstants from "./constants/game";
import SimpleAttack from "./simpleAttack";
import Ulti from "./ulti";

export default class Player extends Entity {
	/**
	 *
	 * @param {Phaser.Scene} scene
	 * @param {PlayerManager} playerManager
	 * @param {ScreenDrawer} screenDrawer
	 * @param {Object} configs
	 */
	constructor(scene, playerManager, screenDrawer, configs) {
		super(scene, configs.x, configs.y, configs.shipKey);
		this.shipKey = configs.shipKey;
		this.shipFireKey = assetsKeys.getFireAsset(this.shipKey);
		this.id = configs.id;
		this.peerId = configs.peerId;
		this.username = configs.username;
		this.playerManager = playerManager;
		this.screenDrawer = screenDrawer;

		this.simpleAttack = "";
		this.currentTarget;

		this.aimAngle = 0;
		this.isAiming = false;
		this.maxLive = gameConstants.MAX_LIVE;
		this.maxVelocity = gameConstants.MAX_VELOCITY;
		this.currentVelocity = 0;
		this.live = this.maxLive;
		this.destroyed = false;

		this.enemies = this.scene.add.group();
		this.rocks = this.scene.add.group();
		this.lasers = this.scene.add.group();

		this.inGameTitleText = this.scene.add.text(this.x - 20, this.y + 20, "", {
			font: "12px Orbitron",
			fill: "#eee"
		});
		this.inGameHealthBar = new HealthBar(this.scene, this.getHealth(), {
			x: this.getHealthBarPosition().x,
			y: this.getHealthBarPosition().y,
			width: 60,
			height: 6
		});
		this.simpleAttackText = this.screenDrawer.bottomSimpleAttackText[this.id];
		this.bottomTitle = this.screenDrawer.bottomPlayerTitleText[this.id] || null;

		this.screenDrawer.drawInGameTitle(this);

		this.body.setDrag(gameConstants.SHIP_DRAG);

		this.setInitialDirection();
		if (this.id !== "MAIN_PLAYER") {
			this.drawBottomTitle();
		}
	}

	setInitialDirection() {
		if (this.x > this.screenDrawer.width / 2) {
			this.rotation = Math.PI;
		}
	}

	setEnemies(enemies) {
		enemies.forEach(enemie => {
			if (enemie === null) return;
			else if (enemie.id !== this.id) {
				this.enemies.add(enemie);
			}
		});
	}

	setRocks(rocks) {
		rocks.forEach(rock => {
			this.rocks.add(rock);
		});
	}

	setupColliders(players, rocks = []) {
		this.setEnemies([...players, ...rocks]);
		this.scene.physics.add.collider(this.lasers, this.enemies, function(
			playerLaser,
			enemy
		) {
			if (!playerLaser.collision) {
				playerLaser.explode(enemy);
			}
		});
		this.setRocks(rocks);
		this.scene.physics.add.collider(this, this.rocks, function(player, rock) {
			player.rockHit(gameConstants.ROCK_DAMAGE);
			rock.playerHit(gameConstants.SHIP_DAMAGE, player);
		});
	}

	drawBottomTitle() {
		this.screenDrawer.changeText(this.bottomTitle, this.username);
	}

	drawAttackText(color) {
		this.screenDrawer.changeText(this.simpleAttackText, this.simpleAttack);
		this.simpleAttackText.style.color = color;
	}

	getId() {
		return this.id;
	}

	getInGameTitleText() {
		return this.inGameTitleText;
	}

	setCoords(coords) {
		let velocityX = this.getVelocity().x;
		let velocityY = this.getVelocity().y;
		this.body.reset(coords.x, coords.y);
		this.body.setVelocityX(velocityX);
		this.body.setVelocityY(velocityY);
	}

	getCoords() {
		return { x: this.body.center.x, y: this.body.center.y };
	}

	rockHit(value) {
		this.body.setVelocity(
			this.getVelocity().x * 0.2,
			this.getVelocity().y * 0.2
		);
		this.hit(value);
	}

	laserHit(value) {
		this.body.setVelocity(0, 0);
		this.hit(value);
	}

	hit(value) {
		this.live -= value;

		let health = this.getHealth();
		this.inGameHealthBar.setValue(health);
		if (health <= 0) {
			this.explode();
		}
	}

	shootSimpleAttack(targetPlayer) {
		let laser = new SimpleAttack(this.scene, this, targetPlayer);
		this.lasers.add(laser);
		this.isAiming = false;
	}

	shootUlti(targetPlayer) {
		let laser = new Ulti(this.scene, this, targetPlayer);
		this.lasers.add(laser);
		this.isAiming = false;
	}

	aim(targetPlayer) {
		if (targetPlayer === undefined) return;
		this.currentTarget = targetPlayer;
		this.setAimAngle(this.x, this.y, targetPlayer.x, targetPlayer.y);
		this.isAiming = true;
	}

	explode() {
		if (this.body === undefined) return;
		this.destroy();
		this.destroyed = true;
		this.inGameHealthBar.remove();
		this.inGameTitleText.destroy();
		if (this.id !== ids.MAIN_PLAYER) this.playerManager.removeEnemy(this);
	}

	move(value) {
		if (this.destroyed) return;
		this.isAiming = false;

		this.currentVelocity = Math.min(
			Math.max(this.currentVelocity + value, 0),
			gameConstants.SHIP_MAX_VELOCITY
		);
		this.scene.physics.velocityFromRotation(
			this.rotation,
			this.currentVelocity,
			this.body.velocity
		);
		this.setTexture(this.shipFireKey);
	}

	turn(value) {
		this.rotation = this.rotation + value;
	}

	stop() {
		this.body.setVelocityX(0);
		this.body.setVelocityY(0);
		this.setTexture(this.shipKey);
	}

	getHealth() {
		return this.live / this.maxLive;
	}

	getHealthBarPosition() {
		return { x: this.x + 10, y: this.y + 42 };
	}

	setAimAngle(x, y, x1, y1) {
		this.aimAngle = this.calcRotation(x, y, x1, y1);
		this.setRotation(this.aimAngle);
	}

	calcRotation(x, y, x1, y1) {
		return Phaser.Math.Angle.Between(x, y, x1, y1);
	}

	update() {
		//
		// BUG HERE: Update not fired
		//	working only fired by preUpdate()
		//
		this.screenDrawer.drawInGameTitle(this);
		const healthBarPosition = this.getHealthBarPosition();
		this.inGameHealthBar.setPosition(healthBarPosition.x, healthBarPosition.y);
		if (this.isAiming) this.aim(this.currentTarget);
	}

	preUpdate() {
		this.update();
	}
}
