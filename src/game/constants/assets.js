const assetsKeys = {
	SHIP1: "ship1",
	SHIP1_FIRE: "ship1Fire",
	SHIP2: "ship2",
	SHIP2_FIRE: "ship2Fire",
	RED_LASER: "red-laser",
	BLUE_LASER: "blue-laser",
	LASER_EXPLOSION: "laserExplosion",
	ROCK: "rock",
	ROCK2: "rock2",
	ANIM_EXPLOSION: "explosion",
	getFireAsset: (asset) => {
		return asset + "Fire";
	}
}

export default assetsKeys;