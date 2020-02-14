import MainMenu from './mainMenu';

export default class ServerMenu {

	static handleButtonOne(menu) {
		// menu.p2p.resetServer();
		console.log("leave");
		ServerMenu.removeListeners(menu);
		menu.currentMenu = MainMenu;
		menu.currentMenu.show(menu);
		menu.p2p.leaveServer();
	}

	static handleButtonTwo(menu) {
		menu.startGame();
	}

	static hide() {
		let menuContainer = document.querySelector(".menu-container");
		if (menuContainer.firstChild)
			menuContainer.removeChild(menuContainer.firstChild);
	}

	static show(menu) {
		let menuContainer = document.querySelector(".menu-container");
		if (menuContainer.firstChild)
			menuContainer.removeChild(menuContainer.firstChild);
		let menuCard = document.createElement('div');
		menuCard.classList.add("menu-card");
		menuContainer.appendChild(menuCard);

		//Header
		menu.createMenuHeader("Server Menu");

		//Content
		let menuContent = document.createElement("div");
		// Copy link
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
		userNameTitle.innerHTML = "Server ID:";
		userNameForm.appendChild(userNameTitle);
		let serverIdSpan = document.createElement("span");
		serverIdSpan.id = "copyServerId";
		serverIdSpan.innerHTML = "";
		userNameForm.appendChild(serverIdSpan);
		// Users list
		let gameListSection = document.createElement("div");
		gameListSection.classList.add("menu-subsection");
		gameListSection.id = "game-list-section";
		let usersList = document.createElement("ul");
		usersList.classList.add("server-players-list");
		gameListSection.appendChild(usersList);
		menuContent.appendChild(gameListSection);


		let menuFooter = document.createElement("div");
		menuFooter.classList.add("menu-footer");
		menuCard.appendChild(menuFooter);
		let buttonOne = document.createElement("div");
		buttonOne.classList.add("menu-button");
		buttonOne.id = "leave-server";
		buttonOne.innerHTML = "Leave server";
		menuFooter.appendChild(buttonOne);
		let buttonSpacer = document.createElement("div");
		buttonSpacer.classList.add("menu-spacer");
		menuFooter.appendChild(buttonSpacer);
		if (menu.p2p.owner) { // Only server creator can start game
			let buttonTwo = document.createElement("div");
			buttonTwo.classList.add("menu-button");
			buttonTwo.id = "start-game";
			buttonTwo.classList.add("disabled");
			buttonTwo.innerHTML = "Start game";
			menuFooter.appendChild(buttonTwo);
		}
		ServerMenu.setupListeners(menu);
	}

	static enableStartGameBtn() {
		let btn = document.getElementById("start-game") || null;
		if (btn !== null) {
			btn.classList.remove("disabled");
		}
	}

	static setupListeners(menu) {
		document.getElementById("leave-server").addEventListener('click', menu.handleButtonOne.bind(menu));
		let startGameBtn = document.getElementById("start-game") || null;
		if (startGameBtn !== null)
			startGameBtn.addEventListener('click', menu.handleButtonTwo.bind(menu));
	}

	static removeListeners(menu) {
		document.getElementById("leave-server").removeEventListener('click', menu.handleButtonOne.bind(menu));
		let startGameBtn = document.getElementById("start-game") || null;
		if (startGameBtn !== null)
			startGameBtn.removeEventListener('click', menu.handleButtonTwo.bind(menu));
	}

}