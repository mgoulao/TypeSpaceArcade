import Phaser from "phaser";
import assets from "./assets/index";
import PlayerManager from "./playerManager";
import ScreenDrawer from "./screenDrawer";
import assetsKeys from "./constants/assets";
import gameConstants from "./constants/game";

export default class MainScene extends Phaser.Scene {
	constructor() {
		super({ key: "MainScene", active: true });
	}

	preload() {
		this.load.image(assetsKeys.SHIP1, assets.ship1);
		this.load.image(assetsKeys.SHIP1_FIRE, assets.ship1Fire);
		this.load.image(assetsKeys.SHIP2, assets.ship2);
		this.load.image(assetsKeys.SHIP2_FIRE, assets.ship2Fire);
		this.load.image(assetsKeys.RED_LASER, assets.redLaser);
		this.load.image(assetsKeys.BLUE_LASER, assets.blueLaser);
		this.load.image(assetsKeys.ROCK, assets.rock);
		this.load.image(assetsKeys.ROCK2, assets.rock2);
		this.load.spritesheet(assetsKeys.LASER_EXPLOSION, assets.laserExplosion, {
			frameWidth: 32,
			frameHeight: 21
		});
	}

	create() {
		this.cursors = this.input.keyboard.createCursorKeys();
		this.anims.create({
			key: "laserExplosion",
			frames: this.anims.generateFrameNumbers("laserExplosion"),
			frameRate: 26,
			repeat: 0
		});

		this.screenDrawer = new ScreenDrawer(this);
		this.playerManager = new PlayerManager(this, this.screenDrawer);

		this.game.events.on("hidden", function() {}, this);

		this.game.events.on(
			"visible",
			function() {
				this.registry.p2p.sendCoordsRequest();
			},
			this
		);
	}

	update() {
		let mainPlayer = this.playerManager.getMainPlayer();

		if (this.cursors.up.isDown) {
			mainPlayer.move(gameConstants.SHIP_VELOCITY_STEP);
			this.playerManager.p2p.sendMoveUp(this.playerManager.mainPlayer.peerId);
		}

		if (this.cursors.down.isDown) {
			mainPlayer.move(-gameConstants.SHIP_VELOCITY_STEP);
			this.playerManager.p2p.sendMoveDown(this.playerManager.mainPlayer.peerId);
		}

		if (this.cursors.left.isDown) {
			mainPlayer.turn(-gameConstants.SHIP_ROTATION_STEP);
			this.playerManager.p2p.sendMoveLeft(this.playerManager.mainPlayer.peerId);
		} else if (this.cursors.right.isDown) {
			mainPlayer.turn(gameConstants.SHIP_ROTATION_STEP);
			this.playerManager.p2p.sendMoveRight(
				this.playerManager.mainPlayer.peerId
			);
		}

		if (this.cursors.shift.isDown) {
			mainPlayer.stop();
			this.playerManager.p2p.sendStop(this.playerManager.mainPlayer.peerId);
		}
	}
}
