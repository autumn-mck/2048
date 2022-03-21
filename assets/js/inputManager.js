class KeyboardInputManager {
	constructor() {
		this.events = {};

		this.listen();
	}

	on(event, callback) {
		if (!this.events[event]) {
			this.events[event] = [];
		}
		this.events[event].push(callback);
	}

	emit(event, data) {
		let callbacks = this.events[event];
		if (callbacks) {
			callbacks.forEach(function (callback) {
				callback(data);
			});
		}
	}

	listen() {
		let self = this;

		/*
            0: Up
            1: Right
            2: Down
            3: Left
        */

		let map = {
			ArrowUp: 0,
			ArrowRight: 1,
			ArrowDown: 2,
			ArrowLeft: 3,

			KeyK: 0,
			KeyL: 1,
			KeyJ: 2,
			KeyH: 3,

			KeyW: 0,
			KeyD: 1,
			KeyS: 2,
			KeyA: 3,
		};

		// Respond to keys being pressed
		document.addEventListener("keydown", function (event) {
			// Map the key pressed to a direction
			let mapped = map[event.code];

			// Block input if any modifier keys are being pressed
			let modifiers = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

			if (!modifiers) {
				// If one of the mapped keys was pressed
				if (mapped !== undefined) {
					// Prevent the key from being typed
					// Mostly useful for stopping the page from being scrolled when arrow keys are pressed
					event.preventDefault();

					self.emit("move", mapped);
				}
			}

			// R key restarts the game
			if (!modifiers && event.code === "KeyR") {
				self.restart.call(self, event);
			}
		});

		// Respond to button presses
		this.bindButtonPress("retry-button", this.restart);
		this.bindButtonPress("restart-button", this.restart);
		this.bindButtonPress("restart-button-2", this.restart);
		this.bindButtonPress("keep-playing-button", this.keepPlaying);

		// Respond to swipe events
		let touchStartClientX, touchStartClientY;
		let gameContainer = document.getElementById("game-container");

		gameContainer.addEventListener("touchstart", function (event) {
			// Ignore if touching with more than 1 finger
			if (event.targetTouches.length > 1) return;

			touchStartClientX = event.touches[0].clientX;
			touchStartClientY = event.touches[0].clientY;

			event.preventDefault();
		});

		// TODO: Is this needed?
		gameContainer.addEventListener("touchmove", function (event) {
			event.preventDefault();
		});

		// TODO: Same as with touch controls, but for mouse?
		gameContainer.addEventListener("touchend", function (event) {
			// Ignore if still touching with one or more fingers
			if (event.targetTouches.length > 0) return;

			let touchEndClientX = event.changedTouches[0].clientX;
			let touchEndClientY = event.changedTouches[0].clientY;

			let dx = touchEndClientX - touchStartClientX;
			let absDx = Math.abs(dx);

			let dy = touchEndClientY - touchStartClientY;
			let absDy = Math.abs(dy);

			// Figure out which direction the user swiped in
			if (Math.max(absDx, absDy) > 10) {
				// (right : left) : (down : up)
				self.emit("move", absDx > absDy ? (dx > 0 ? 1 : 3) : dy > 0 ? 2 : 0);
			}
		});
	}

	restart(event) {
		event.preventDefault();
		this.emit("restart");
	}

	keepPlaying(event) {
		event.preventDefault();
		this.emit("keepPlaying");
	}

	/**
	 * Bind the given function to the button with the given ID
	 * @param {string} id The ID of the element to be bound to
	 * @param {function} func The function to bind to the button press
	 */
	bindButtonPress(id, func) {
		let button = document.getElementById(id);
		button.addEventListener("click", func.bind(this));
		button.addEventListener("touchend", func.bind(this));
	}
}
