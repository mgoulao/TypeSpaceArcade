import ship2 from '../game/assets/ship2.png';
import { startGame } from '../game/main';
import MainMenu from './mainMenu';
import ServerMenu from './serverMenu';
import assetsKeys from '../game/constants/assets';
import assets from '../game/assets/index';

export default class Menu {

	/**
	 * 
	 * @param {P2P} p2p 
	 */
	constructor(p2p) {
		this.p2p = p2p;
		this.p2p.menu = this;
		this.resetData();

		this.ships = {
			[assetsKeys.SHIP1]: assets.ship1,
			[assetsKeys.SHIP2]: assets.ship2
		}
		this.shipsKeys = [assetsKeys.SHIP1, assetsKeys.SHIP2];
		this.currentShipKey = assetsKeys.SHIP1;

		this.gameStarted = false;
		this.showMainMenu();
		this.setupListeners();
	}

	resetData() {
		this.data = {
			username: "",
			serverId: "",
		};
	}

	setupListeners() {
		let helpBtn = document.getElementById("help-btn");
		let infoBtn = document.getElementById("info-btn");

		helpBtn.addEventListener("click", () => { this.showCard("help") });
		infoBtn.addEventListener("click", () => { this.showCard("info") });
	}

	handleInputChange(e) {
		this.data[e.target.id] = e.target.value;
	}

	handleButtonOne() {
		this.currentMenu.handleButtonOne(this);
	}

	handleButtonTwo() {
		this.currentMenu.handleButtonTwo(this);
	}

	startGame(configs = []) {
		const gameHtml = document.querySelector(".game");
		const menuContainer = document.querySelector(".menu-container");
		gameHtml.style.display = "flex";
		menuContainer.style.display = "none";
		this.currentMenu.hide();
		startGame(this.p2p, configs);
	}

	showMenu() {
		const gameHtml = document.querySelector(".game");
		const menuContainer = document.querySelector(".menu-container");
		gameHtml.style.display = "none";
		menuContainer.style.display = "flex";
		this.showMainMenu();
	}

	showMainMenu() {
		this.currentMenu = MainMenu;
		this.currentMenu.show(this);
	}

	showServerMenu() {
		this.currentMenu = ServerMenu;
		this.currentMenu.show(this);
	}

	showServerList(serverId, players) {
		this.data.serverId = serverId;
		let serverCopyText = document.getElementById("copyServerId") || null;
		if (serverCopyText === null) return;
		serverCopyText.innerHTML = this.data.serverId;

		let playersList = document.querySelector(".server-players-list");
		let items = "";
		players.forEach(player => {
			items += `<li>
                  <img class="server-players-ship" src="${this.ships[player.shipKey]}">
                  <h5 class="server-players-username">${player.username}</h5>
                </li>`;
		});
		playersList.innerHTML = items;
	}

	createMenuHeader(title) {
		let menuCard = document.querySelector('.menu-card');
		let menuHeader = document.createElement('div');
		menuHeader.classList.add("menu-header");
		menuCard.appendChild(menuHeader);
		let menuTitle = document.createElement('div');
		menuTitle.classList.add("menu-title");
		menuTitle.innerHTML = title;
		menuHeader.appendChild(menuTitle);
		let menuSpacer = document.createElement('div');
		menuSpacer.classList.add("menu-spacer");
		menuHeader.appendChild(menuSpacer);
		let menuOptions = document.createElement('div');
		menuOptions.classList.add("menu-options");
		menuHeader.appendChild(menuOptions);
		let optionsList = document.createElement("ul");
		optionsList.classList.add("buttons-list");
		let optionsButtons = ['<div class="tri-button" id="help-btn"><div class="tri-button--outer"></div><div class="tri-button--inner"></div><div class="tri-button--content">&#63;</div></div>',
			'<div class="tri-button upside" id="info-btn"><div class="tri-button--outer"></div><div class="tri-button--inner"></div><div class="tri-button--content">&#105;</div></div>'];
		for (let i = 0; i < optionsButtons.length; i++) {
			let item = document.createElement("li");
			item.innerHTML = optionsButtons[i];
			optionsList.appendChild(item);
		}
		menuOptions.appendChild(optionsList);
	}

	handleSliderBtn(value) {
		this.currentShipKey = this.shipsKeys[(this.shipsKeys.indexOf(this.currentShipKey) + value).mod(this.shipsKeys.length)];
		MainMenu.updateShipImage(this);
	}

	showServerIdError(message) {
		let errorMessage = document.getElementById("serverIdError");
		errorMessage.classList.add("active");
		errorMessage.innerHTML = message;
	}

	showUsernameError(message) {
		let errorMessage = document.getElementById("usernameError");
		errorMessage.classList.add("active");
		errorMessage.innerHTML = message;
	}

	hideErrors() {
		let serverIdError = document.getElementById("serverIdError");
		let usernameError = document.getElementById("usernameError");

		serverIdError.classList.remove("active");
		usernameError.classList.remove("active");
	}

	showCard(id) {
		let card = document.getElementById(id);
		card.classList.add("active");
	}

	getCurrentShip() {
		return this.ships[this.currentShipKey];
	}

}