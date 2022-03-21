class LocalStorageManager {
	constructor() {
		this.bestScoreKey = "bestScore";
		this.gameStateKey = "gameState";

		this.storage = window.localStorage;
	}

	// Best score getters/setters
	getBestScore() {
		return this.get(this.bestScoreKey) || 0;
	}

	setBestScore(score) {
		this.set(this.bestScoreKey, score);
	}

	// Game state getters/setters and clearing
	getGameState() {
		let stateJSON = this.get(this.gameStateKey);
		return stateJSON ? JSON.parse(stateJSON) : null;
	}

	setGameState(gameState) {
		this.set(this.gameStateKey, JSON.stringify(gameState));
	}

	clearGameState() {
		this.storage.removeItem(this.gameStateKey);
	}

	/**
	 * Get the value in localStorage corresponding to the given key
	 */
	get(key) {
		return window.localStorage.getItem(key);
	}

	/**
	 * Set the localStorage value corresponding to the given key with the given value
	 */
	set(key, value) {
		window.localStorage.setItem(key, value);
	}
}
