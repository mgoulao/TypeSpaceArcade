import Entity from "./entity";
import assetsKeys from "./constants/assets";
import gameConstants from "./constants/game";

export default class Rock extends Entity {
	/**
	 *
	 * @param {Phaser.Scene} scene
	 * @param {number} x
	 * @param {number} y
	 */
	constructor(scene, x, y) {
		super(scene, x, y, Rock.getRandomRockAsset());

		this.hitBy = null;
		this.nHits = 0;
		this.moving = false;
		this.live = gameConstants.ROCKS_MAX_LIVE;
		let randomRotation = Math.random() * 2 * Math.PI;
		this.setRotation(randomRotation);
	}

	static getRandomRockAsset() {
		let rocks = [assetsKeys.ROCK, assetsKeys.ROCK2];
		return rocks[Math.floor(Math.random() * rocks.length)];
	}

	laserHit(value) {
		if (!this.moving) this.body.setVelocity(0, 0);
		this.moving = false;
		this.hitBy = null;
		this.nHits = 0;
		this.hit(value);
	}

	playerHit(value, player) {
		if (player.destroyed) return;
		this.body.setDrag(
			Math.abs(this.getVelocity().x) * 0.1,
			Math.abs(this.getVelocity().y) * 0.1
		);
		if (
			this.nHits > 1 ||
			(this.moving && player.getId() !== this.hitBy.getId())
		) {
			this.body.setVelocity(
				-this.getVelocity().x * 0.5,
				-this.getVelocity().y * 0.5
			);
			this.moving = false;
			this.hitBy = null;
			this.nHits = 0;
		} else {
			this.nHits++;
			this.moving = true;
			this.hitBy = player;
		}
		this.hit(value);
	}

	hit(value) {
		this.live -= value;
		if (this.live <= 0) this.explode();
	}

	explode() {
		this.destroy();
	}
}
