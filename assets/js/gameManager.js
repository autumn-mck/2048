class GameManager {
	/**
	 *
	 * @param {number} size Size of the grid
	 * @param {*} InputManager
	 * @param {*} Actuator
	 * @param {*} StorageManager
	 */
	constructor(sizeX, sizeY, InputManager, Actuator, StorageManager) {
		this.inputManager = new InputManager();
		this.storageManager = new StorageManager();
		let previousState = this.storageManager.getGameState();
		if (previousState) this.size = previousState.grid.size;
		else this.size = { x: sizeX, y: sizeY };
		this.actuator = new Actuator(this.size);

		// Number of tiles to start a new game with
		this.startTiles = 2;

		this.inputManager.on("move", this.move.bind(this));
		this.inputManager.on("restart", this.restart.bind(this));
		this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));

		this.setup();
	}

	/**
	 * Restart the game
	 */
	restart() {
		this.storageManager.clearGameState();
		this.actuator.continueGame(); // Clear the game won/lost message
		this.setup();
	}

	/**
	 * Keep playing after winning (Allows going over max score)
	 */
	keepPlaying() {
		this.keepPlaying = true;
		this.actuator.continueGame(); // Clear the game won/lost message
	}

	/**
	 * Return true if the game is lost, or has won and the user hasn't kept playing
	 */
	isGameTerminated() {
		return this.over || (this.won && !this.keepPlaying);
	}

	/**
	 * Set up the game
	 */
	setup() {
		let previousState = this.storageManager.getGameState();

		// Reload the game from a previous game if present
		if (previousState) {
			this.grid = new Grid(previousState.grid.size, previousState.grid.cells); // Reload grid
			this.score = previousState.score;
			this.over = previousState.over;
			this.won = previousState.won;
			this.keepPlaying = previousState.keepPlaying;
		} else {
			this.grid = new Grid(this.size);
			this.score = 0;
			this.over = false;
			this.won = false;
			this.keepPlaying = false;

			// Add the initial tiles
			this.addStartTiles();
		}

		// Update the actuator
		this.actuate();
	}

	// Set up the initial tiles to start the game with
	addStartTiles() {
		for (let i = 0; i < this.startTiles; i++) {
			this.addRandomTile();
		}
	}

	// Adds a tile in a random position
	addRandomTile() {
		if (this.grid.cellsAvailable()) {
			let value = Math.random() < 0.9 ? 2 : 4;
			let tile = new Tile(this.grid.randomAvailableCell(), value);

			this.grid.insertTile(tile);
		}
	}

	// Sends the updated grid to the actuator
	actuate() {
		if (this.storageManager.getBestScore() < this.score) {
			this.storageManager.setBestScore(this.score);
		}

		// Clear the state when the game is over (game over only, not win)
		if (this.over) {
			this.storageManager.clearGameState();
		} else {
			this.storageManager.setGameState(this.serialize());
		}

		this.actuator.actuate(this.grid, {
			score: this.score,
			over: this.over,
			won: this.won,
			bestScore: this.storageManager.getBestScore(),
			terminated: this.isGameTerminated(),
		});
	}

	// Represent the current game as an object
	serialize() {
		return {
			grid: this.grid.serialize(),
			score: this.score,
			over: this.over,
			won: this.won,
			keepPlaying: this.keepPlaying,
		};
	}
	// Save all tile positions and remove merger info
	prepareTiles() {
		this.grid.eachCell(function (x, y, tile) {
			if (tile) {
				tile.mergedFrom = null;
				tile.savePosition();
			}
		});
	}

	// Move a tile and its representation
	moveTile(tile, cell) {
		this.grid.cells[tile.x][tile.y] = null;
		this.grid.cells[cell.x][cell.y] = tile;
		tile.updatePosition(cell);
	}

	// Move tiles on the grid in the specified direction
	move(direction) {
		// 0: up, 1: right, 2: down, 3: left
		let self = this;

		if (this.isGameTerminated()) return; // Don't do anything if the game's over

		let cell, tile;

		let vector = this.getVector(direction);
		let traversals = this.buildTraversals(vector);
		let moved = false;

		// Save the current tile positions and remove merger information
		this.prepareTiles();

		// Traverse the grid in the right direction and move tiles
		traversals.x.forEach(function (x) {
			traversals.y.forEach(function (y) {
				cell = { x: x, y: y };
				tile = self.grid.cellContent(cell);

				if (tile) {
					let positions = self.findFarthestPosition(cell, vector);
					let next = self.grid.cellContent(positions.next);

					// Only one merger per row traversal?
					if (next && next.value === tile.value && !next.mergedFrom) {
						let merged = new Tile(positions.next, tile.value * 2);
						merged.mergedFrom = [tile, next];

						self.grid.insertTile(merged);
						self.grid.removeTile(tile);

						// Converge the two tiles' positions
						tile.updatePosition(positions.next);

						// Update the score
						self.score += merged.value;

						// The mighty 2048 tile
						if (merged.value === 2048) self.won = true;
					} else {
						self.moveTile(tile, positions.farthest);
					}

					if (!self.positionsEqual(cell, tile)) {
						moved = true; // The tile moved from its original cell!
					}
				}
			});
		});

		if (moved) {
			this.addRandomTile();

			if (!this.movesAvailable()) {
				this.over = true; // Game over!
			}

			this.actuate();
		}
	}

	// Get the vector representing the chosen direction
	getVector(direction) {
		// Vectors representing tile movement
		let map = {
			0: { x: 0, y: -1 },
			1: { x: 1, y: 0 },
			2: { x: 0, y: 1 },
			3: { x: -1, y: 0 }, // Left
		};

		return map[direction];
	}

	// Build a list of positions to traverse in the right order
	buildTraversals(vector) {
		let traversals = { x: [], y: [] };

		for (let x = 0; x < this.size.x; x++) traversals.x.push(x);
		for (let y = 0; y < this.size.y; y++) traversals.y.push(y);

		// Always traverse from the farthest cell in the chosen direction
		if (vector.x === 1) traversals.x = traversals.x.reverse();
		if (vector.y === 1) traversals.y = traversals.y.reverse();

		return traversals;
	}

	findFarthestPosition(cell, vector) {
		let previous;

		// Progress towards the vector direction until an obstacle is found
		do {
			previous = cell;
			cell = { x: previous.x + vector.x, y: previous.y + vector.y };
		} while (this.grid.withinBounds(cell) && this.grid.cellAvailable(cell));

		return {
			farthest: previous,
			next: cell, // Used to check if a merge is required
		};
	}

	movesAvailable() {
		return this.grid.cellsAvailable() || this.tileMatchesAvailable();
	}

	// Check for available matches between tiles (more expensive check)
	tileMatchesAvailable() {
		let self = this;

		let tile;

		for (let x = 0; x < this.size.x; x++) {
			for (let y = 0; y < this.size.y; y++) {
				tile = this.grid.cellContent({ x: x, y: y });

				if (tile) {
					for (let direction = 0; direction < 4; direction++) {
						let vector = self.getVector(direction);
						let cell = { x: x + vector.x, y: y + vector.y };

						let other = self.grid.cellContent(cell);

						if (other && other.value === tile.value) {
							return true; // These two tiles can be merged
						}
					}
				}
			}
		}

		return false;
	}
	positionsEqual(first, second) {
		return first.x === second.x && first.y === second.y;
	}
}
