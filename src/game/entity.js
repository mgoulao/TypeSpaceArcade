import Phaser from "phaser";

export default class Entity extends Phaser.GameObjects.Sprite {
	/**
	 *
	 * @param {Phaser.Scene} scene
	 * @param {number} x
	 * @param {number} y
	 * @param {string} key
	 */
	constructor(scene, x, y, key) {
		super(scene, x, y, key);

		this.scene.add.existing(this);
		this.scene.physics.world.enableBody(this, 0);
		this.body.setCollideWorldBounds(true);
	}

	getVelocity() {
		return { x: this.body.velocity.x, y: this.body.velocity.y };
	}
}
