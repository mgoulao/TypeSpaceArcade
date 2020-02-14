export default class ScreenDrawer {
	/**
	 *
	 * @param {Phaser.Scene} scene
	 */
	constructor(scene) {
		this.scene = scene;
		this.width = document.querySelector("html").clientWidth - 10;
		this.height = document.querySelector("html").clientHeight - 10;

		this.gameHeaderTitle = document.querySelector(".game-header__username");

		this.bottomPlayerTitleText = {
			PLAYER_1: document.querySelector("#player1 .game-command__username"),
			PLAYER_2: document.querySelector("#player2 .game-command__username"),
			PLAYER_3: document.querySelector("#player3 .game-command__username"),
			PLAYER_4: document.querySelector("#player4 .game-command__username")
		};

		this.bottomSimpleAttackText = {
			PLAYER_1: document.querySelector("#player1 .game-command__text"),
			PLAYER_2: document.querySelector("#player2 .game-command__text"),
			PLAYER_3: document.querySelector("#player3 .game-command__text"),
			PLAYER_4: document.querySelector("#player4 .game-command__text")
		};

		this.ultiText = document.querySelector("#ulti .game-command__text");
	}

	changeText(element, text) {
		element.innerHTML = text;
	}

	drawInGameTitle(player) {
		let text = player.getInGameTitleText();
		text.setPosition(player.x - 20, player.y + 20);
		text.setText(player.username);
	}

	drawUlti(word, color) {
		this.changeText(this.ultiText, word);
		this.ultiText.style.color = color;
	}

	drawUltiLoader(ratio) {
		let loader = document.querySelector(".ulti-load-background");
		loader.style.width = `${ratio * 93}%`;
	}
}
