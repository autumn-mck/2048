class Grid {
	constructor(size, previousState) {
		this.size = size;
		if (previousState) this.cells = this.fromState(previousState);
		else this.cells = this.empty();
	}

	/**
	 * Build an empty grid
	 */
	empty() {
		let cells = [];

		for (let x = 0; x < this.size.x; x++) {
			let row = (cells[x] = []);
			for (let y = 0; y < this.size.y; y++) {
				row.push(null);
			}
		}

		return cells;
	}

	/**
	 * Build a grid based on the provided saved state
	 * @param {*} state The state to load in
	 */
	fromState(state) {
		let cells = [];

		for (let x = 0; x < this.size.x; x++) {
			let row = (cells[x] = []);
			for (let y = 0; y < this.size.y; y++) {
				let tile = state[x][y];

				if (tile) row.push(new Tile(tile.position, tile.value));
				else row.push(null);
			}
		}

		return cells;
	}

	/**
	 * Find an available random position
	 */
	randomAvailableCell() {
		let cells = this.availableCells();

		if (cells.length) {
			return cells[Math.floor(Math.random() * cells.length)];
		}
	}

	/**
	 * Get the positions of all available cells
	 */
	availableCells() {
		let cells = [];

		this.eachCell(function (x, y, tile) {
			if (!tile) {
				cells.push({ x: x, y: y });
			}
		});

		return cells;
	}

	/**
	 * Call callback for every cell
	 * @param {function} callback
	 */
	eachCell(callback) {
		for (let x = 0; x < this.size.x; x++) {
			for (let y = 0; y < this.size.y; y++) {
				callback(x, y, this.cells[x][y]);
			}
		}
	}

	/**
	 * Check if there are any cells still available
	 */
	cellsAvailable() {
		return !!this.availableCells().length;
	}

	/**
	 * Check if the specified cell is taken
	 */
	cellAvailable(cell) {
		return !this.cellOccupied(cell);
	}

	/**
	 * TODO: Remove
	 */
	cellOccupied(cell) {
		return !!this.cellContent(cell);
	}

	/**
	 * Get the value of the given cell
	 */
	cellContent(cell) {
		if (this.withinBounds(cell)) {
			return this.cells[cell.x][cell.y];
		} else {
			return null;
		}
	}

	/**
	 * Insert the given tile at its position
	 */
	insertTile(tile) {
		this.cells[tile.x][tile.y] = tile;
	}

	/**
	 * Remove the tile at the given position
	 */
	removeTile(tile) {
		this.cells[tile.x][tile.y] = null;
	}

	/**
	 * Check if the given position is within the bounds of the grid
	 */
	withinBounds(position) {
		return position.x >= 0 && position.x < this.size.x && position.y >= 0 && position.y < this.size.y;
	}

	serialize() {
		let cellState = [];

		for (let x = 0; x < this.size.x; x++) {
			let row = (cellState[x] = []);

			for (let y = 0; y < this.size.y; y++) {
				row.push(this.cells[x][y] ? this.cells[x][y].serialize() : null);
			}
		}

		return {
			size: this.size,
			cells: cellState,
		};
	}
}
