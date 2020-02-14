import Player from "./player";
import ActionsManager from "./actionsManager";

export default class MainPlayer extends Player {
	/**
	 *
	 * @param {Phaser.Scene} scene
	 * @param {PlayerManager} playerManager
	 * @param {ScreenDrawer} screenDrawer
	 * @param {Object} configs
	 */
	constructor(scene, playerManager, screenDrawer, configs) {
		super(scene, playerManager, screenDrawer, configs);
		this.actionsManager = new ActionsManager(scene, this, screenDrawer);

		this.gameHeaderTitle = this.screenDrawer.gameHeaderTitle;
		this.screenDrawer.changeText(this.gameHeaderTitle, this.username);
	}

	getEnemies() {
		return this.playerManager.getEnemies();
	}

	shootPlayerSimpleAttack(player) {
		this.playerManager.p2p.sendSimpleAttack(this.peerId, player.peerId);
		this.shootSimpleAttack(player);
	}

	shootPlayerUlti(player) {
		this.playerManager.p2p.sendUlti(this.peerId, player.peerId);
		this.shootUlti(player);
	}

	aimToPlayer(player) {
		this.playerManager.p2p.sendAim(this.peerId, player.peerId);
		this.aim(player);
	}

	showEndGame(text) {
		let gameOver = document.querySelector(".game-over");
		let gameOverText = document.querySelector(".game-over__text");

		gameOverText.innerHTML = text;
		gameOver.classList.add("active");
	}

	gameOver() {
		this.showEndGame("Game Over");
	}

	win() {
		this.showEndGame("You win");
	}

	update() {
		super.update();
		this.actionsManager.updateActions();
	}

	explode() {
		super.explode();
		this.gameOver();
		this.actionsManager.resetAllActions();
	}
}
