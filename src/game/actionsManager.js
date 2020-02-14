import gameConstants from "./constants/game";

const words = require("an-array-of-english-words");

export default class ActionsManager {
	/**
	 *
	 * @param {Phaser.Scene} scene
	 * @param {MainPlayer} mainPlayer
	 * @param {ScreenDrawer} screenDrawer
	 */
	constructor(scene, mainPlayer, screenDrawer) {
		this.scene = scene;
		this.mainPlayer = mainPlayer;
		this.screenDrawer = screenDrawer;
		this.ULTI_INTERVAL = gameConstants.ULTI_LOAD_TIME;

		this.currentTime = new Date().getTime();
		this.lastUltiTime = this.currentTime;
		this.ulti = "";
		this.ultiActive = false;
		this.ultiOngoing = false;
		this.currentWord = "";
		this.currentTarget = null;

		this.setupSimpleAttacks();
		this.setupComboListener();
	}

	setupComboListener() {
		document.addEventListener("keyup", e => {
			let key = e.key;
			if (this.currentWord === "") {
				let enemies = this.mainPlayer.getEnemies();
				for (let i = 0; i < enemies.length; i++) {
					if (enemies[i] === null) continue;
					if (enemies[i].simpleAttack[0] === key) {
						this.currentTarget = [enemies[i]];
						this.currentWord = this.currentTarget[0].simpleAttack;
						break;
					}
				}
				let ulti = this.getUlti();
				if (ulti !== "" && ulti[0] === key) {
					this.currentTarget = enemies;
					this.currentWord = ulti;
					this.ultiOngoing = true;
				}
			}

			if (this.ultiOngoing) {
				if (this.currentWord[0] === key) {
					if (this.currentWord.length === 1) {
						this.currentWord = "";
						this.resetUlti();
						this.currentTarget.forEach(target => {
							this.mainPlayer.shootPlayerUlti(target);
						});
					} else {
						this.removeLetterFromUlti();
					}
				} else {
					this.resetUlti();
					this.currentWord = "";
					this.currentTarget = null;
					this.ulti = "";
				}
			} else {
				if (this.currentTarget !== null && this.currentWord[0] === key) {
					if (this.currentWord.length === 1) {
						let target = this.currentTarget[0];
						this.setPlayerRandomAttack(target);
						this.currentWord = "";
						this.mainPlayer.shootPlayerSimpleAttack(target);
						this.setPlayerRandomAttack(target);
					} else {
						this.removeLetterFromAttack();
						this.mainPlayer.aimToPlayer(this.currentTarget[0]);
					}
				}
			}
		});
	}

	resetUlti() {
		this.ultiActive = false;
		this.ultiOngoing = false;
		this.lastUltiTime = new Date().getTime();
		this.screenDrawer.drawUlti("", "#e81224");
	}

	setupSimpleAttacks() {
		let enemies = this.mainPlayer.getEnemies();
		for (let i = 0; i < enemies.length; i++) {
			if (enemies[i] === null) return;
			this.setPlayerRandomAttack(enemies[i]);
		}
	}

	setPlayerRandomAttack(player) {
		this.setPlayerAttack(player, this.getRandomWord());
	}

	setPlayerAttack(player, word) {
		if (player === null) return;
		player.simpleAttack = word;
		player.drawAttackText("#fff");
	}

	removePlayerAttack(player) {
		this.setPlayerAttack(player, "");
	}

	removeLetterFromAttack() {
		let word = this.currentTarget[0].simpleAttack;
		let wordSliced = word.slice(1, word.length);
		this.currentTarget[0].simpleAttack = wordSliced;
		this.currentWord = wordSliced;
		this.currentTarget[0].drawAttackText("#e81224");
	}

	removeLetterFromUlti() {
		let word = this.currentWord;
		let wordSliced = word.slice(1, word.length);
		this.currentWord = wordSliced;
		this.screenDrawer.drawUlti(wordSliced, "#e81224");
	}

	firstLetterUnique(word) {
		let unique = true;
		let players = this.mainPlayer.playerManager.getEnemies();
		players.forEach(player => {
			if (player && player.simpleAttack[0] === word[0]) {
				unique = false;
			}
		});
		return unique;
	}

	/**
	 * @returns {string}
	 */
	getRandomWord() {
		let newWord = "";
		do {
			newWord = words[Math.round(Math.random() * words.length)];
		} while (
			!(
				newWord.length >= 4 &&
				newWord.length <= 14 &&
				this.firstLetterUnique(newWord)
			)
		);
		return newWord;
	}

	getUlti() {
		return this.ulti;
	}

	setUlti() {
		var newUlti = "";
		while (newUlti.length < 30) {
			let newWord = this.getRandomWord();
			if (newUlti.length + newWord.length < 35)
				newUlti += (newUlti.length > 0 ? " " : "") + newWord;
		}
		this.ulti = newUlti;
		this.screenDrawer.drawUlti(this.ulti, "#fff");
	}

	updateActions() {
		this.currentTime = new Date().getTime();
		if (!this.ultiActive) {
			if (this.currentTime - this.lastUltiTime > this.ULTI_INTERVAL) {
				this.ultiActive = true;
				this.setUlti();
				this.screenDrawer.drawUltiLoader(0);
			} else {
				let ratio = (this.currentTime - this.lastUltiTime) / this.ULTI_INTERVAL;
				this.screenDrawer.drawUltiLoader(ratio);
			}
		}
	}

	resetAllActions() {
		this.ulti = "";
		let enemies = this.mainPlayer.getEnemies();
		for (let i = 0; i < enemies.length; i++) {
			this.setPlayerAttack(enemies[i], "");
		}
	}
}
