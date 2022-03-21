// Apparently this waits until the browser is ready to render the game before starting to avoid glitches although I can't spot any glitches myself. Leaving it in for now anyway.
window.requestAnimationFrame(function () {
	new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);
});
