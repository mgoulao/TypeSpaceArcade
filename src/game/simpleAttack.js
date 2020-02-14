import Laser from "./laser";
import assetsKeys from "./constants/assets";
import gameConstants from "./constants/game";

export default class SimpleAttack extends Laser {
	/**
	 *
	 * @param {Phaser.Scene} scene
	 * @param {Player} source
	 * @param {Player} target
	 */
	constructor(scene, source, target) {
		super(
			scene,
			source,
			target,
			assetsKeys.BLUE_LASER,
			gameConstants.SIMPLE_ATTACK_DAMAGE
		);
	}
}
