import Phaser from "phaser";
import MainScene from "./mainScene";

const config = {
	type: Phaser.AUTO,
	width: 0, //Placeholder
	height: 0,
	parent: document.getElementById("game"),
	scale: {},
	physics: {
		default: "arcade",
		arcade: {
			gravity: { x: 0, y: 0 },
			debug: process.env.NODE_ENV === "development"
		}
	},
	scene: [MainScene]
};

let game = null;

const startGame = (p2p, configs = []) => {
	config.width = document.querySelector(".game-content").clientWidth - 12;
	config.height = document.querySelector(".game-content").clientHeight - 6;
	config.callbacks = {
		preBoot: game => {
			game.registry.p2p = p2p;
			game.registry.configs = configs;
		}
	};
	game = new Phaser.Game(config);
};

const endGame = () => {
	game.destroy(true);
};

export { startGame, endGame };
