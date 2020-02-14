import Phaser from "phaser";
import Entity from "./entity";
import assetsKeys from "./constants/assets";
import gameConstants from "./constants/game";

export default class Laser extends Entity {
	/**
	 *
	 * @param {Phaser.Scene} scene
	 * @param {Player} source
	 * @param {Player} target
	 * @param {string} asset
	 * @param {number} damage
	 */
	constructor(scene, source, target, asset, damage) {
		super(scene, source.x, source.y, asset);
		this.source = source;
		this.target = target;
		this.damage = damage;
		this.collision = false;
		this.aimAngle = 0;
		this.setRotationAndVelocity();
		this.body.onWorldBounds = true;
		this.body.world.on("worldbounds", this.onWorldsEnd, this);

		this.scene.anims.create({
			key: assetsKeys.ANIM_EXPLOSION,
			frames: this.scene.anims.generateFrameNumbers(assetsKeys.LASER_EXPLOSION),
			frameRate: 10
		});
	}

	setRotationAndVelocity() {
		if (this.collision) return;
		this.aimAngle = Phaser.Math.Angle.Between(
			this.x,
			this.y,
			this.target.x,
			this.target.y
		);
		this.setRotation(this.aimAngle);
		this.body.rotation = this.aimAngle;
		let speed = gameConstants.LASER_VELOCITY;
		let speedX = speed * Math.sin(this.aimAngle);
		let speedY = speed * Math.cos(this.aimAngle);

		this.body.velocity.y = speedX;
		this.body.velocity.x = speedY;
	}

	explode(enemy) {
		this.collision = true;
		this.body.setVelocity(0, 0);
		enemy.laserHit(this.damage);

		// Animations not working, need further investigation
		/* this.anims.play(assetsKeys.ANIM_EXPLOSION, true);
		this.anims.resume();
		this.on('animationcomplete', () => {
			this.setVisible(false);

		}, this);
		// Sometimes this callback is trigered before animation is complete
		setTimeout(() => {
			this.destroy();
		}, 2000); */
		this.destroy();
	}

	onWorldsEnd(body) {
		// Check if the body's game object is the sprite you are listening for
		if (body.gameObject === this) {
			this.destroy();
		}
	}

	update() {
		//
		// BUG HERE: Update not firer
		//	working only fired by preUpdate()
		//
		if (!this.target.destroyed) this.setRotationAndVelocity();
	}

	preUpdate() {
		this.update();
	}
}
