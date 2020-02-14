import Laser from "./laser";
import assetsKeys from "./constants/assets";
import gameConstants from "./constants/game";

export default class Ulti extends Laser {
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
			assetsKeys.RED_LASER,
			gameConstants.ULTI_DAMAGE
		);
	}
}
