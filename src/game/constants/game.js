const gameConstants = {
	MAX_LIVE: process.env.NODE_ENV === "development" ? 10 : 100,
	SHIP_MAX_VELOCITY: 75,
	LASER_VELOCITY: 200,
	SHIP_VELOCITY_STEP: 2,
	SHIP_DRAG: 4,
	SHIP_ROTATION_STEP: 0.05,
	NUMBER_ROCKS: 12,
	ROCKS_MAX_LIVE: 50,
	SIMPLE_ATTACK_DAMAGE: 10,
	ULTI_LOAD_TIME: process.env.NODE_ENV === "development" ? 5000 : 35000,
	ULTI_DAMAGE: 60,
	ROCK_DAMAGE: 5,
	SHIP_DAMAGE: 2
};
export default gameConstants;
