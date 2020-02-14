import MainPlayer from "./mainPlayer";
import Player from "./player";
import Rock from "./rock";
import gameConstants from "./constants/game";
import assetsKeys from "./constants/assets";
import ids from "./constants/ids";

export default class PlayerManager {
	/**
	 *
	 * @param {Phaser.Scene} scene
	 * @param {ScreenDrawer} screenDrawer
	 */
	constructor(scene, screenDrawer) {
		this.scene = scene;
		this.screenDrawer = screenDrawer;
		this.p2p = scene.registry.p2p;
		this.p2p.playerManager = this;
		this.playersConfigs = scene.registry.configs.players || [];
		this.rocksConfigs = scene.registry.configs.rocks || [];

		this.mainPlayer = null;
		this.opponents = [null, null, null, null];
		this.rocks = [];

		this.playersIds = [ids.PLAYER_1, ids.PLAYER_2, ids.PLAYER_3, ids.PLAYER_4];

		if (this.p2p.peer === null) {
			this.generateDebugPlayers();
		} else if (this.p2p.owner) {
			this.generatePlayersConfigs();
			this.generatePlayers();
		} else {
			this.generatePlayers();
		}
	}

	generateDebugPlayers() {
		let coords = null;
		for (let i = 0; i < 4; i++) {
			coords = this.generateRandomCoords();
			this.playersConfigs[i] = {
				id: ids[`PLAYER_${i + 1}`],
				username: `Player ${i}`,
				x: coords.x,
				y: coords.y,
				shipKey: assetsKeys.SHIP2
			};
			this.opponents[i] = new Player(
				this.scene,
				this,
				this.screenDrawer,
				this.playersConfigs[i]
			);
		}

		coords = this.generateRandomCoords();
		this.playersConfigs[4] = {
			id: ids.MAIN_PLAYER,
			username: "Main Player",
			x: coords.x,
			y: coords.y,
			shipKey: assetsKeys.SHIP1
		};
		this.mainPlayer = new MainPlayer(
			this.scene,
			this,
			this.screenDrawer,
			this.playersConfigs[4]
		);

		for (let i = 0; i < gameConstants.NUMBER_ROCKS; i++) {
			coords = this.generateRandomCoords();
			this.rocks.push(new Rock(this.scene, coords.x, coords.y));
		}

		this.setupPlayersColliders();
	}

	generatePlayersConfigs() {
		let coords;
		for (let i = 0; i < this.p2p.opponents.length; i++) {
			coords = this.generateRandomCoords();
			this.playersConfigs[i] = {
				username: this.p2p.opponents[i].username,
				peerId: this.p2p.opponents[i].peerId,
				shipKey: this.p2p.opponents[i].shipKey,
				x: coords.x,
				y: coords.y
			};
		}

		coords = this.generateRandomCoords();
		this.playersConfigs[this.p2p.opponents.length] = {
			username: this.p2p.username,
			peerId: this.p2p.peerId,
			shipKey: this.p2p.shipKey,
			x: coords.x,
			y: coords.y
		};

		for (let i = 0; i < gameConstants.NUMBER_ROCKS; i++) {
			coords = this.generateRandomCoords();
			this.rocksConfigs[i] = {
				rockId: i.toString(),
				x: coords.x,
				y: coords.y
			};
		}

		this.p2p.sendGameConfigs(this.playersConfigs, this.rocksConfigs);
	}

	generatePlayers() {
		let players = 0,
			mainPlayerIndex = 0;
		for (let i = 0; i < this.playersConfigs.length; i++) {
			if (this.playersConfigs[i].peerId === this.p2p.peerId) {
				mainPlayerIndex = i;
			} else {
				this.playersConfigs[i].id = this.playersIds[players];
				this.opponents[players] = new Player(
					this.scene,
					this,
					this.screenDrawer,
					this.playersConfigs[i]
				);
				players++;
			}
		}

		for (let i = 0; i < gameConstants.NUMBER_ROCKS; i++) {
			this.rocks.push(
				new Rock(this.scene, this.rocksConfigs[i].x, this.rocksConfigs[i].y)
			);
		}

		this.playersConfigs[mainPlayerIndex].id = ids.MAIN_PLAYER;
		this.mainPlayer = new MainPlayer(
			this.scene,
			this,
			this.screenDrawer,
			this.playersConfigs[mainPlayerIndex]
		);
		this.setupPlayersColliders();
	}

	getAllPlayers() {
		return [this.mainPlayer, ...this.opponents];
	}

	generateRandomCoords() {
		let x, y;
		do {
			x = Math.round(Math.random() * 1000) + 50;
			y = Math.round(Math.random() * 450) + 50;
		} while (this.hasPositionCollisions(x, y, 50, 50));

		return { x: x, y: y };
	}

	hasPositionCollisions(x, y, w, h) {
		let hasCollision = false;
		let players = this.playersConfigs;
		x = x - w; // offset
		y = y - h;
		const width = 2 * w;
		const height = 2 * h;

		players.forEach(player => {
			if (player === null) return;
			let pX = player.x - w;
			let pY = player.y - h;
			if (
				x < pX + width &&
				x + width > pX &&
				y < pY + height &&
				y + height > pY
			)
				hasCollision = true;
		});
		return hasCollision;
	}

	setupPlayersColliders() {
		let players = this.getAllPlayers();
		players.forEach(player => {
			if (player === null) return;
			player.setupColliders(players, this.rocks);
		});
	}

	getEnemies() {
		return this.opponents;
	}

	syncPlayerCoords(playerPeerId, coords) {
		const player = this.getPlayerWithPeerId(playerPeerId);
		player.setCoords(coords);
	}

	removeEnemy(player) {
		let nPlayers = 0;
		for (let i = 0; i < this.opponents.length; i++) {
			if (this.opponents[i] !== null) {
				nPlayers++;
				if (this.opponents[i].getId() === player.getId()) {
					this.opponents[i].explode();
					this.opponents[i] = null;
				}
			}
		}
		if (nPlayers === 1 && !this.mainPlayer.destroyed) this.mainPlayer.win();
		this.mainPlayer.actionsManager.removePlayerAttack(player);
	}

	getMainPlayer() {
		return this.getPlayer(ids.MAIN_PLAYER);
	}

	getPlayer(id) {
		if (this.mainPlayer.getId() === id) return this.mainPlayer;
		for (let i = 0; i < this.opponents.length; i++) {
			if (this.opponents[i].getId() == id) return this.opponents[i];
		}
		return null;
	}

	getPlayerWithPeerId(peerId) {
		let playerObj = null;
		let players = [this.mainPlayer, ...this.opponents];
		players.forEach(player => {
			if (player !== null && player.peerId === peerId) playerObj = player;
		});
		return playerObj;
	}

	playerAim(sourcePeerId, targetPeerId) {
		const source = this.getPlayerWithPeerId(sourcePeerId);
		const target = this.getPlayerWithPeerId(targetPeerId);
		source.aim(target);
	}

	playerSimpleAttack(sourcePeerId, targetPeerId) {
		const source = this.getPlayerWithPeerId(sourcePeerId);
		const target = this.getPlayerWithPeerId(targetPeerId);
		source.shootSimpleAttack(target);
	}

	playerUlti(sourcePeerId, targetPeerId) {
		const source = this.getPlayerWithPeerId(sourcePeerId);
		const target = this.getPlayerWithPeerId(targetPeerId);
		source.shootUlti(target);
	}

	playerMoveUp(playerPeerId) {
		const player = this.getPlayerWithPeerId(playerPeerId);
		player.move(gameConstants.SHIP_VELOCITY_STEP);
	}

	playerMoveDown(playerPeerId) {
		const player = this.getPlayerWithPeerId(playerPeerId);
		player.move(-gameConstants.SHIP_VELOCITY_STEP);
	}

	playerMoveLeft(playerPeerId) {
		const player = this.getPlayerWithPeerId(playerPeerId);
		player.turn(-gameConstants.SHIP_ROTATION_STEP);
	}

	playerMoveRight(playerPeerId) {
		const player = this.getPlayerWithPeerId(playerPeerId);
		player.turn(gameConstants.SHIP_ROTATION_STEP);
	}

	playerStop(playerPeerId) {
		const player = this.getPlayerWithPeerId(playerPeerId);
		player.stop();
	}

	removePlayer(playerPeerId) {
		const player = this.getPlayerWithPeerId(playerPeerId);
		this.removeEnemy(player);
	}
}
