class Tile {
	/**
	 * Create the data for a tile with the given value at the given position
	 * @param {JSON} position Vector position of the tile
	 * @param {number} value The value of the tile
	 */
	constructor(position, value) {
		this.x = position.x;
		this.y = position.y;
		this.value = value;

		this.previousPosition = null;
		this.mergedFrom = null; // Tracks tiles that merged together TODO: ?
	}

	savePosition() {
		this.previousPosition = { x: this.x, y: this.y };
	}

	updatePosition(position) {
		this.x = position.x;
		this.y = position.y;
	}

	serialize() {
		return {
			position: {
				x: this.x,
				y: this.y,
			},
			value: this.value,
		};
	}
}
