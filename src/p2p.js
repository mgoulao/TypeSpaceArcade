import Peer from "peerjs";
import ServerMenu from "./menu/serverMenu";
import menuMessages from "./game/constants/menuMessages";
import { leaveGame } from "./index";

/* Great reference @link: https://github.com/mahmud-ridwan/arteegee */

export default class P2P {
	constructor() {
		this.menu = null;
		this.leave = false;
		this.resetServer();
		this.MAX_PLAYERS = 4;
	}

	resetServer() {
		this.peer = null;
		this.peerId = null;
		this.username = "";
		this.shipKey = "";
		this.serverId = null;
		this.owner = false;
		this.opponents = [];
		this.connections = [];
		this.playerManager = null;
		this.closed = false; // Server only
		this.joined = false; // Workaround "join" peer message not sending
	}

	initialize() {
		this.peer = new Peer({
			debug: 3
		});

		this.peer.on("open", id => {
			this.peerId = id;
			console.warn("PeerId: ", this.peerId);
		});

		this.peer.on("error", err => {
			this.menu.showMainMenu();

			console.log("ERROR: ", err.type);
			if (err.type === "invalid-id" || err.type === "invalid-key") {
				//Menu error
			} else if (err.type === "peer-unavailable") {
				this.menu.showServerIdError(menuMessages.SERVER_FULL);
			}
		});

		this.leave = false;
	}

	start(username, shipKey, menu) {
		this.initialize();
		this.owner = true;
		this.username = username;
		this.shipKey = shipKey;
		this.peer.on("open", () => {
			this.serverId = this.peerId;
			this.menu = menu;
			this.menu.showServerList(this.serverId, [
				{ peerId: this.peerId, username: this.username, shipKey: this.shipKey }
			]);
		});
		this.peer.on("connection", this.handleConnectionToServer.bind(this));
	}

	join(serverId, username, shipKey, menu) {
		this.serverId = serverId;
		this.username = username;
		this.shipKey = shipKey;
		this.menu = menu;
		this.initialize();
		this.joinPeerServer(this.serverId);
		this.peer.on("connection", this.handleConnectionToPeer.bind(this));
	}

	joinPeer(user) {
		console.log(user.peerId);
		let conn = this.peer.connect(user.peerId);
		conn.on("open", () => {
			console.log("connected");
			conn.send({ type: "NOTHING" }); //First message is never delivered
			conn.send({
				type: "JOIN_PEER",
				content: {
					peerId: this.peerId,
					username: this.username
				}
			});

			this.opponents.push(user);

			conn.on("data", this.handleData.bind(this));
			this.connections.push(conn);
		});

		conn.on("close", () => {
			if (!this.leave) {
				conn.close();
				this.removePeer(conn.peer);
				if (this.playerManager) {
					this.playerManager.removePlayer(conn.peer);
				}
			}
		});
	}

	joinPeerServer(peerId) {
		console.log(peerId);
		this.peer.on("open", () => {
			let conn = this.peer.connect(peerId);
			conn.on("open", () => {
				console.log("connected");
				conn.send({ type: "NOTHING" });

				this.menu.showServerList(this.serverId, [
					{
						peerId: this.peerId,
						username: this.username
					},
					...this.opponents
				]);

				conn.on("data", this.handleData.bind(this));
				this.connections.push(conn);
			});

			conn.on("close", () => {
				if (!this.leave) {
					conn.close();
					this.removePeer(conn.peer);
					this.cleanPeer();
					this.menu.showMainMenu();
					this.menu.showServerIdError(menuMessages.CONNECTION_LOST);
					if (this.playerManager) {
						leaveGame(this, this.menu);
					}
				}
			});
		});
	}

	handleConnectionToServer(conn) {
		conn.on("open", () => {
			if (!this.closed && this.opponents.length === this.MAX_PLAYERS - 1)
				this.peer.disconnect();

			conn.send({ type: "OPPONENTS", content: this.opponents });
			conn.on("data", this.handleData.bind(this));
			this.connections.push(conn);
		});

		conn.on("close", () => {
			if (!this.leave) {
				conn.close();
				this.removePeer(conn.peer);
				this.updateLocalMenuList();
				this.broadcastMenuList();
				if (this.playerManager) {
					if (this.opponents.length === 0) {
						leaveGame(this, this.menu);
					} else {
						this.playerManager.removePlayer(conn.peer);
					}
				}
			}
		});
	}

	handleConnectionToPeer(conn) {
		conn.on("open", () => {
			conn.on("data", this.handleData.bind(this));
			this.connections.push(conn);
		});

		conn.on("close", () => {
			if (!this.leave) {
				conn.close();
				this.removePeer(conn.peer);
				if (this.playerManager) {
					this.playerManager.removePlayer(conn.peer);
				}
			}
		});
	}

	isServer() {
		return this.peerId === this.serverId;
	}

	updateLocalMenuList() {
		this.menu.showServerList(this.serverId, [
			{
				peerId: this.peerId,
				username: this.username,
				shipKey: this.shipKey
			},
			...this.opponents
		]);
	}

	broadcastMenuList() {
		this.connections.forEach(conn => {
			this.sendMenuList(conn);
		});
	}

	leaveServer() {
		this.leave = true;

		this.connections.forEach(conn => {
			if (conn !== undefined) conn.close();
		});

		this.resetServer();
	}

	removePeer(peer) {
		this.connections = this.connections.filter(c => c.peer !== peer);
		this.opponents = this.opponents.filter(o => o.peerId !== peer);
	}

	cleanPeer() {
		this.connections.forEach(conn => {
			conn.close();
		});

		this.peer.destroy();
	}

	checkNumberOpponents() {
		if (this.opponents.length) ServerMenu.enableStartGameBtn();
	}

	handleData(data) {
		if (process.env.NODE_ENV === "development") console.log(data);
		switch (data.type) {
			case "JOIN_SERVER":
				this.opponents.push(data.content);
				this.updateLocalMenuList();
				this.broadcastMenuList();
				break;
			case "JOIN_PEER":
				this.opponents.push(data.content);

				break;
			case "OPPONENTS":
				if (!this.joined) {
					// Workaround first message sometimes is lost
					this.connections[0].send({
						type: "JOIN_SERVER",
						content: {
							peerId: this.peerId,
							username: this.username,
							shipKey: this.shipKey
						}
					});
					this.joined = true;
				}
				this.opponents = data.content;
				this.opponents.forEach(opponent => {
					this.joinPeer(opponent);
				});
				break;
			case "CONNECT":
				this.joinPeer(data.content);
				break;
			case "MENU_LIST":
				this.menu.showServerList(data.content.serverId, data.content.players);
				break;
			case "CONFIGS":
				this.menu.startGame(data.content);
				break;
			case "COORDS":
				this.playerManager.syncPlayerCoords(
					data.content.playerPeerId,
					data.content.coords
				);
				break;
			case "REQUEST_COORDS":
				this.sendCoords(this.peerId, this.playerManager.mainPlayer.getCoords());
				break;
			case "AIM":
				this.playerManager.playerAim(
					data.content.sourcePeerId,
					data.content.targetPeerId
				);
				break;
			case "MOVE_UP":
				console.log("up");
				this.playerManager.playerMoveUp(data.content.playerPeerId);
				break;
			case "MOVE_DOWN":
				this.playerManager.playerMoveDown(data.content.playerPeerId);
				break;
			case "MOVE_LEFT":
				this.playerManager.playerMoveLeft(data.content.playerPeerId);
				break;
			case "MOVE_RIGHT":
				this.playerManager.playerMoveRight(data.content.playerPeerId);
				break;
			case "STOP":
				this.playerManager.playerStop(data.content.playerPeerId);
				break;
			case "SIMPLE_ATTACK":
				this.playerManager.playerSimpleAttack(
					data.content.sourcePeerId,
					data.content.targetPeerId
				);
				break;
			case "ULTI":
				this.playerManager.playerUlti(
					data.content.sourcePeerId,
					data.content.targetPeerId
				);
				break;
			default:
			// nothing
		}
		this.checkNumberOpponents();
	}

	sendMenuList(conn) {
		conn.send({
			type: "MENU_LIST",
			content: {
				serverId: this.serverId,
				players: [
					{
						peerId: this.peerId,
						username: this.username,
						shipKey: this.shipKey
					},
					...this.opponents
				]
			}
		});
	}

	sendGameConfigs(playersConfigs, rocksConfigs) {
		this.peer.disconnect();
		this.connections.forEach(conn => {
			conn.send({
				type: "CONFIGS",
				content: { players: playersConfigs, rocks: rocksConfigs }
			});
		});
	}

	sendCoordsRequest() {
		this.connections.forEach(conn => {
			conn.send({ type: "REQUEST_COORDS" });
		});
	}

	sendCoords(playerPeerId, coords) {
		this.connections.forEach(conn => {
			conn.send({
				type: "COORDS",
				content: { playerPeerId: playerPeerId, coords: coords }
			});
		});
	}

	sendAim(sourcePeerId, targetPeerId) {
		this.connections.forEach(conn => {
			conn.send({
				type: "AIM",
				content: { sourcePeerId: sourcePeerId, targetPeerId: targetPeerId }
			});
		});
	}

	sendMoveUp(playerPeerId) {
		this.connections.forEach(conn => {
			console.log(conn);

			conn.send({ type: "MOVE_UP", content: { playerPeerId: playerPeerId } });
		});
	}

	sendMoveDown(playerPeerId) {
		this.connections.forEach(conn => {
			conn.send({ type: "MOVE_DOWN", content: { playerPeerId: playerPeerId } });
		});
	}

	sendMoveLeft(playerPeerId) {
		this.connections.forEach(conn => {
			conn.send({ type: "MOVE_LEFT", content: { playerPeerId: playerPeerId } });
		});
	}

	sendMoveRight(playerPeerId) {
		this.connections.forEach(conn => {
			conn.send({
				type: "MOVE_RIGHT",
				content: { playerPeerId: playerPeerId }
			});
		});
	}

	sendStop(playerPeerId) {
		this.connections.forEach(conn => {
			conn.send({ type: "STOP", content: { playerPeerId: playerPeerId } });
		});
	}

	sendSimpleAttack(sourcePeerId, targetPeerId) {
		this.connections.forEach(conn => {
			conn.send({
				type: "SIMPLE_ATTACK",
				content: { sourcePeerId: sourcePeerId, targetPeerId: targetPeerId }
			});
		});
	}

	sendUlti(sourcePeerId, targetPeerId) {
		this.connections.forEach(conn => {
			conn.send({
				type: "ULTI",
				content: { sourcePeerId: sourcePeerId, targetPeerId: targetPeerId }
			});
		});
	}
}
