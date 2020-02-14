import { startGame, endGame } from "./game/main";
import P2P from "./p2p";
import Menu from "./menu";
import "./utils";
import "./images";
import "./styles";

const isBrowserSupported = () => {
	return (
		window.RTCDataChannel !== undefined &&
		Object.prototype.hasOwnProperty.call(RTCDataChannel.prototype, "onclose")
	);
};

document.querySelector("body").onload = function() {
	const DEBUG_GAME = false;
	if (!isBrowserSupported()) {
		document.getElementById("browser-not-supported").classList.add("active");
		return;
	}

	let p2p = new P2P();
	if (DEBUG_GAME && process.env.NODE_ENV === "development") {
		const gameHtml = document.querySelector(".game");
		const menuHtml = document.querySelector(".menu-container");
		gameHtml.style.display = "flex";
		menuHtml.style.display = "none";
		startGame(p2p);
	}
	const menu = new Menu(p2p);
	setupListeners(p2p, menu);
};

const closeCard = id => {
	const card = document.getElementById(id);
	card.classList.remove("active");
};

const showCard = id => {
	const card = document.getElementById(id);
	card.classList.add("active");
};

const leaveGame = (p2p, menu) => {
	const gameOver = document.querySelector(".game-over");

	p2p.leaveServer();
	menu.showMenu();
	endGame();
	gameOver.classList.remove("active");
};

const setupListeners = (p2p, menu) => {
	const infoCloseBtn = document.querySelector("#info .card-close");
	const helpCloseBtn = document.querySelector("#help .card-close");
	const infoGameBtn = document.getElementById("game-info");
	const giveupBtn = document.getElementById("game-leave");
	const helpGameBtn = document.getElementById("game-help");
	const leaveGameBtn = document.querySelector(".game-over__leave");

	leaveGameBtn.addEventListener("click", () => {
		leaveGame(p2p, menu);
	});

	infoGameBtn.addEventListener("click", () => {
		showCard("info");
	});
	helpGameBtn.addEventListener("click", () => {
		showCard("help");
	});
	giveupBtn.addEventListener("click", () => {
		leaveGame(p2p, menu);
	});

	infoCloseBtn.addEventListener("click", () => {
		closeCard("info");
	});
	helpCloseBtn.addEventListener("click", () => {
		closeCard("help");
	});
};

export { leaveGame };
