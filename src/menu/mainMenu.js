import ship2 from '../game/assets/ship2.png';
import { startGame } from '../game/main';
import ServerMenu from './serverMenu';
import menuMessages from '../game/constants/menuMessages';

export default class MainMenu {

	static handleButtonOne(menu) {
		if (menu.data.username === "") {
			menu.showUsernameError(menuMessages.USERNAME_INVALID);
			return;
		}
		menu.p2p.start(menu.data.username, menu.currentShipKey, menu);
		menu.currentMenu = ServerMenu;
		menu.currentMenu.show(menu);
	}

	static handleButtonTwo(menu) {
		if (menu.data.serverId === "") {
			menu.showServerIdError(menuMessages.SERVER_NOT_FOUND);
		} else if (menu.data.username === "") {
			menu.showUsernameError(menuMessages.USERNAME_INVALID);
		} else {
			menu.hideErrors();
			menu.currentMenu.removeListeners(menu);
			menu.showServerMenu();
			menu.p2p.join(menu.data.serverId, menu.data.username, menu.currentShipKey, menu);
		}
	}

	static show(menu) {
		menu.resetData();
		let menuContainer = document.querySelector(".menu-container");
		if (menuContainer.firstChild)
			menuContainer.removeChild(menuContainer.firstChild);
		let menuCard = document.createElement('div');
		menuCard.classList.add("menu-card");
		menuContainer.appendChild(menuCard);

		//Header
		menu.createMenuHeader("Main Menu");

		//Content
		let menuContent = document.createElement("div");
		// Username and stuff
		menuContent.classList.add("menu-content");
		menuCard.appendChild(menuContent);
		let gameCustomization = document.createElement("div");
		gameCustomization.classList.add("menu-subsection");
		gameCustomization.id = "user-customization";
		menuContent.appendChild(gameCustomization);
		let userNameForm = document.createElement("div");
		userNameForm.classList.add("menu-form-input");
		gameCustomization.appendChild(userNameForm);
		let userNameTitle = document.createElement("h5");
		userNameTitle.innerHTML = "Username";
		userNameForm.appendChild(userNameTitle);
		let userNameInput = document.createElement("input");
		userNameInput.classList.add("menu-input");
		userNameInput.id = "username";
		userNameInput.setAttribute("autocomplete", "off");
		userNameInput.placeholder = "username";
		userNameForm.appendChild(userNameInput);
		let usernameInputError = document.createElement("span");
		usernameInputError.classList.add("menu-error");
		usernameInputError.id = "usernameError";
		usernameInputError.innerHTML = "";
		userNameForm.appendChild(usernameInputError);
		//Ship picker
		let shipPickerForm = document.createElement("div");
		shipPickerForm.classList.add("menu-form-input");
		gameCustomization.appendChild(shipPickerForm);
		let shipPickerTitle = document.createElement("h5");
		shipPickerTitle.innerHTML = "Ship";
		shipPickerForm.appendChild(shipPickerTitle);
		let shipPickerContainer = document.createElement("div");
		shipPickerContainer.classList.add("ship-picker-container");
		let leftBtn = document.createElement("div");
		leftBtn.id = "previous-ship";
		leftBtn.classList.add("ship-picker__btn");
		leftBtn.classList.add("tsa-btn");
		leftBtn.classList.add("tsa-btn--outline");
		leftBtn.innerHTML = '<svg class="arrow arrow--left" viewBox="0 0 24 24"><path fill="#fff" d="M8,5.14V19.14L19,12.14L8,5.14Z" /></svg>';
		shipPickerContainer.appendChild(leftBtn);
		let shipImageContainer = document.createElement("div");
		shipImageContainer.classList.add("ship-picker__img-container");
		let shipImage = document.createElement("img");
		shipImage.classList.add("ship-picker__img");
		shipImage.src = menu.getCurrentShip();
		shipImageContainer.appendChild(shipImage);
		shipPickerContainer.appendChild(shipImageContainer);
		let rightBtn = document.createElement("div");
		rightBtn.id = "next-ship";
		rightBtn.classList.add("ship-picker__btn");
		rightBtn.classList.add("tsa-btn");
		rightBtn.classList.add("tsa-btn--outline");
		rightBtn.innerHTML = '<svg class="arrow" viewBox="0 0 24 24"><path fill="#fff" d="M8,5.14V19.14L19,12.14L8,5.14Z" /></svg>';
		shipPickerContainer.appendChild(rightBtn);
		shipPickerForm.appendChild(shipPickerContainer);
		// Server
		let serverCustomization = document.createElement("div");
		serverCustomization.classList.add("menu-subsection");
		serverCustomization.id = "game-customization";
		menuContent.appendChild(serverCustomization);
		let serverForm = document.createElement("div");
		serverForm.classList.add("menu-form-input");
		serverCustomization.appendChild(serverForm);
		let serverTitle = document.createElement("h5");
		serverTitle.innerHTML = "Server ID";
		serverForm.appendChild(serverTitle);
		let serverInput = document.createElement("input");
		serverInput.classList.add("menu-input");
		serverInput.id = "serverId";
		serverInput.setAttribute("autocomplete", "off");
		serverInput.placeholder = "server id";
		serverForm.appendChild(serverInput);
		let serverInputError = document.createElement("span");
		serverInputError.classList.add("menu-error");
		serverInputError.id = "serverIdError";
		serverInputError.innerHTML = "";
		serverForm.appendChild(serverInputError);

		let menuFooter = document.createElement("div");
		menuFooter.classList.add("menu-footer");
		menuCard.appendChild(menuFooter);
		let buttonOne = document.createElement("div");
		buttonOne.classList.add("menu-button");
		buttonOne.id = "new-game";
		buttonOne.innerHTML = "Start new server";
		menuFooter.appendChild(buttonOne);
		let buttonSpacer = document.createElement("div");
		buttonSpacer.classList.add("menu-spacer");
		menuFooter.appendChild(buttonSpacer);
		let buttonTwo = document.createElement("div");
		buttonTwo.classList.add("menu-button");
		buttonTwo.id = "join-game";
		buttonTwo.innerHTML = "Join server";
		menuFooter.appendChild(buttonTwo);

		MainMenu.setupListeners(menu);
	}

	hideMenuStartGame() {
		const gameHtml = document.getElementById("game");
		const menuHtml = document.getElementById("main-menu");
		gameHtml.style.display = "block";
		menuHtml.style.display = "none";
		startGame();
	}

	static updateShipImage(menu) {
		let img = document.querySelector(".ship-picker__img");
		img.src = menu.getCurrentShip();
	}

	static setupListeners(menu) {
		document.querySelector(".menu-card").addEventListener('input', menu.handleInputChange.bind(menu));
		document.getElementById("new-game").addEventListener('click', menu.handleButtonOne.bind(menu));
		document.getElementById("join-game").addEventListener('click', menu.handleButtonTwo.bind(menu));
		document.getElementById("previous-ship").addEventListener("click", () => {
			menu.handleSliderBtn.bind(menu);
			menu.handleSliderBtn(-1);
		});
		document.getElementById("next-ship").addEventListener("click", () => {
			menu.handleSliderBtn.bind(menu);
			menu.handleSliderBtn(1);
		});
	}

	static removeListeners(menu) {
		document.querySelector(".menu-card").removeEventListener('input', menu.handleInputChange.bind(menu));
		document.getElementById("new-game").removeEventListener('click', menu.handleButtonOne.bind(menu));
		document.getElementById("join-game").removeEventListener('click', menu.handleButtonTwo.bind(menu));
	}

}