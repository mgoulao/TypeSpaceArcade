import Phaser from "phaser";

export default class HealthBar {
	constructor(scene, value, configs) {
		this.scene = scene;
		this.value = value;
		this.width = configs.width || 0;
		this.height = configs.height || 0;
		this.x = configs.x || 0;
		this.y = configs.y || 0;
		this.bgColor = 0x000000;
		this.fillColor = 0xffffff;
		this.borderColor = 0xff0000;

		this.draw();
	}

	draw() {
		this.fillRect = new Phaser.GameObjects.Rectangle(
			this.scene,
			this.x,
			this.y,
			this.width * this.value,
			this.height,
			this.fillColor
		);
		this.fillRect.w = 1;
		this.bgRect = new Phaser.GameObjects.Rectangle(
			this.scene,
			this.x,
			this.y,
			this.width,
			this.height,
			this.bgColor
		);
		this.scene.add.existing(this.fillRect);
		// this.scene.add.existing(this.bgRect);
	}

	setValue(newValue) {
		this.value = newValue;
		this.fillRect.width = this.width * this.value;
	}

	setPosition(x, y) {
		this.x = x;
		this.y = y;
		this.bgRect.setX(x);
		this.bgRect.setY(y);
		this.fillRect.setX(x);
		this.fillRect.setY(y);
	}

	remove() {
		this.fillRect.destroy();
		this.bgRect.destroy();
	}
}
