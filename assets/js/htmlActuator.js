class HTMLActuator {
	constructor() {
		this.tileContainer = document.querySelector(".tile-container");
		this.scoreContainer = document.querySelector(".score-container");
		this.bestContainer = document.querySelector(".best-container");
		this.messageContainer = document.querySelector(".game-message");

		this.score = 0;
	}

	actuate(grid, metadata) {
		let self = this;

		window.requestAnimationFrame(function () {
			self.clearContainer(self.tileContainer);

			grid.cells.forEach(function (column) {
				column.forEach(function (cell) {
					if (cell) {
						self.addTile(cell);
					}
				});
			});

			self.updateScore(metadata.score);
			self.updateBestScore(metadata.bestScore);

			if (metadata.terminated) {
				if (metadata.over) {
					self.message(false); // You lose
				} else if (metadata.won) {
					self.message(true); // You win!
				}
			}
		});
	}

	/**
	 * Continues the game (both restart and keep playing)
	 */
	continueGame() {
		this.clearMessage();
	}

	/**
	 * Clear the given container
	 */
	clearContainer(container) {
		while (container.firstChild) {
			container.removeChild(container.firstChild);
		}
	}

	/**
	 * Visually add the given tile to the grid
	 */
	addTile(tile) {
		let self = this;

		let wrapper = document.createElement("div");
		let inner = document.createElement("div");
		let position = tile.previousPosition || { x: tile.x, y: tile.y };
		let positionClass = this.positionClass(position);

		// We can't use classlist because it somehow glitches when replacing classes
		let classes = ["tile", "tile-" + tile.value, positionClass];

		if (tile.value > 2048) classes.push("tile-super");

		this.applyClasses(wrapper, classes);

		inner.classList.add("tile-inner");
		inner.textContent = tile.value;

		if (tile.previousPosition) {
			// Make sure that the tile gets rendered in the previous position first
			window.requestAnimationFrame(function () {
				classes[2] = self.positionClass({ x: tile.x, y: tile.y });
				self.applyClasses(wrapper, classes); // Update the position
			});
		} else if (tile.mergedFrom) {
			classes.push("tile-merged");
			this.applyClasses(wrapper, classes);

			// Render the tiles that merged
			tile.mergedFrom.forEach(function (merged) {
				self.addTile(merged);
			});
		} else {
			classes.push("tile-new");
			this.applyClasses(wrapper, classes);
		}

		// Add the inner part of the tile to the wrapper
		wrapper.appendChild(inner);

		// Put the tile on the board
		this.tileContainer.appendChild(wrapper);
	}

	applyClasses(element, classes) {
		element.setAttribute("class", classes.join(" "));
	}

	normalizePosition(position) {
		return { x: position.x + 1, y: position.y + 1 };
	}

	positionClass(position) {
		position = this.normalizePosition(position);
		return "tile-position-" + position.x + "-" + position.y;
	}

	/**
	 * Display the updated score (and the change in score)
	 */
	updateScore(score) {
		this.clearContainer(this.scoreContainer);

		let difference = score - this.score;
		this.score = score;

		this.scoreContainer.textContent = this.score;

		// Display an animated change in score
		if (difference > 0) {
			let addition = document.createElement("div");
			addition.classList.add("score-addition");
			addition.textContent = "+" + difference;

			this.scoreContainer.appendChild(addition);
		}
	}

	/**
	 * Update the best score
	 */
	updateBestScore(bestScore) {
		this.bestContainer.textContent = bestScore;
	}

	/**
	 * Display a message to the user depending on if they won or not
	 */
	message(didWin) {
		let type, message;
		if (didWin) {
			type = "game-won";
			message = "You win!";
		} else {
			type = "game-over";
			message = "Game over!";
		}

		this.messageContainer.classList.add(type);
		this.messageContainer.getElementsByTagName("p")[0].textContent = message;
	}

	/**
	 * Clear the game over message
	 */
	clearMessage() {
		this.messageContainer.classList.remove("game-won", "game-over");
	}
}
